import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import type { ProviderConfig, RotationStrategy, ExhaustionError } from './types.js'
import { KeyPool } from './key-pool.js'
import { ExhaustionDetector, extractCooldown } from './detector.js'
import { AuthInjector } from './auth-injector.js'
import { logger } from './logger.js'

const CACHE_DIR = path.join(os.homedir(), '.config', 'search-mcp-rotator')
const CACHE_FILE = path.join(CACHE_DIR, 'tools-cache.json')

function loadToolsCache(): Record<string, Tool[]> {
  try {
    if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  } catch {}
  return {}
}

function saveToolsCache(cache: Record<string, Tool[]>): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch {}
}

// ── Per-provider state ────────────────────────────────────────────────────────
interface ProviderState {
  name: string
  config: ProviderConfig
  keyPool: KeyPool
  detector: ExhaustionDetector
  authInjector: AuthInjector
  client: Client
  transport: StreamableHTTPClientTransport | null
  currentKey: string
  tools: Tool[]
  connected: boolean
}

// ── Tool name helpers ─────────────────────────────────────────────────────────
// Prefix: "{provider}__{toolname}" — double underscore as separator
// All provider IDs are single words without underscores, making parsing unambiguous.
function prefixTool(provider: string, toolName: string): string {
  return `${provider}__${toolName}`
}

function unprefix(prefixedName: string): { provider: string; toolName: string } | null {
  const idx = prefixedName.indexOf('__')
  if (idx === -1) return null
  return { provider: prefixedName.slice(0, idx), toolName: prefixedName.slice(idx + 2) }
}

// ── MultiProxy ────────────────────────────────────────────────────────────────
export class MultiProxy {
  private server: Server
  private providers: Map<string, ProviderState> = new Map()

  constructor(configs: Record<string, ProviderConfig>) {
    this.server = new Server(
      { name: 'search-mcp-rotator', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    for (const [name, config] of Object.entries(configs)) {
      if (!config.enabled) continue
      this.providers.set(name, {
        name,
        config,
        keyPool: new KeyPool(config),
        detector: new ExhaustionDetector(name, config.exhaustionPatterns),
        authInjector: new AuthInjector(config),
        client: new Client({ name: `${name}-client`, version: '1.0.0' }, { capabilities: {} }),
        transport: null,
        currentKey: '',
        tools: [],
        connected: false,
      })
    }
  }

  async start(): Promise<void> {
    // Load cached tools for all providers — instant, no network
    const cache = loadToolsCache()
    for (const [name, state] of this.providers) {
      if (cache[name]?.length) {
        state.tools = cache[name]
        logger.info(`Loaded ${state.tools.length} cached tools for ${name}`)
      }
    }

    this.registerHandlers()

    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    logger.info(`Multi-provider proxy started`, {
      providers: [...this.providers.keys()],
    })
  }

  // ── Lazy upstream connection per provider ────────────────────────────────
  private async ensureConnected(state: ProviderState): Promise<void> {
    if (state.connected) return

    state.currentKey = state.keyPool.next()
    const { url, headers } = state.authInjector.inject(state.currentKey, state.config.url)

    state.transport = new StreamableHTTPClientTransport(
      new URL(url),
      { requestInit: { headers } }
    )
    await state.client.connect(state.transport)
    state.connected = true

    // Refresh tools from upstream and update cache
    const { tools } = await state.client.listTools()
    state.tools = tools
    const cache = loadToolsCache()
    cache[state.name] = tools
    saveToolsCache(cache)

    logger.info(`Connected to upstream for ${state.name}`, {
      toolCount: tools.length,
      currentKey: state.currentKey.slice(0, 8) + '...',
    })
  }

  // ── Reconnect with a different key ───────────────────────────────────────
  private async reconnect(state: ProviderState, key: string): Promise<void> {
    try { await state.client.close() } catch {}
    state.connected = false

    const { url, headers } = state.authInjector.inject(key, state.config.url)
    state.transport = new StreamableHTTPClientTransport(
      new URL(url),
      { requestInit: { headers } }
    )
    await state.client.connect(state.transport)
    state.connected = true
    state.currentKey = key
  }

  // ── Inject strategy param into tool schema ───────────────────────────────
  private injectStrategyParam(schema: any): any {
    return {
      ...schema,
      properties: {
        ...schema.properties,
        strategy: {
          type: 'string',
          enum: ['round-robin', 'priority', 'random'],
          description: 'Key rotation strategy for this call. Overrides provider default.',
        },
      },
    }
  }

  // ── Register MCP handlers ────────────────────────────────────────────────
  private registerHandlers(): void {
    // tools/list — serve all providers' tools from cache instantly
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools: Tool[] = []

      for (const [name, state] of this.providers) {
        // If no cache yet, connect upstream now (first-ever run)
        if (state.tools.length === 0) {
          try { await this.ensureConnected(state) } catch (e) {
            logger.warn(`Could not fetch tools for ${name}: ${(e as Error).message}`)
          }
        }
        for (const tool of state.tools) {
          allTools.push({
            ...tool,
            name: prefixTool(name, tool.name),
            inputSchema: this.injectStrategyParam(tool.inputSchema),
          })
        }
      }

      return { tools: allTools }
    })

    // tools/call — route to correct provider with key rotation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const prefixedName = request.params.name
      const parsed = unprefix(prefixedName)

      if (!parsed) throw new Error(`Unknown tool: ${prefixedName}`)

      const state = this.providers.get(parsed.provider)
      if (!state) throw new Error(`Unknown provider: ${parsed.provider}`)

      return this.handleToolCall(state, parsed.toolName, request)
    })
  }

  // ── Tool call with key rotation ──────────────────────────────────────────
  private async handleToolCall(
    state: ProviderState,
    originalToolName: string,
    request: any
  ): Promise<CallToolResult> {
    await this.ensureConnected(state)

    if (state.keyPool.allDegraded()) {
      throw new Error(`All API keys for ${state.name} are exhausted. Please add more keys or wait for cooldown.`)
    }

    const args = { ...request.params.arguments }
    const strategyOverride = args.strategy as RotationStrategy | undefined
    delete args.strategy

    // Forward with original (unprefixed) tool name
    const cleanRequest = {
      ...request,
      params: { ...request.params, name: originalToolName, arguments: args },
    }

    const maxAttempts = Math.max(1, state.keyPool.getHealthyCount())
    let lastError: any = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          const nextKey = state.keyPool.next(strategyOverride)
          if (!nextKey || nextKey === state.currentKey) break
          await this.reconnect(state, nextKey)
        } else {
          const key = state.keyPool.next(strategyOverride)
          if (key !== state.currentKey) await this.reconnect(state, key)
        }

        const result = await state.client.callTool(cleanRequest.params)

        const mcpError = this.extractMcpError(state.name, result)
        if (mcpError && state.detector.isExhausted(mcpError)) {
          const cooldown = extractCooldown(mcpError, state.name, state.config.cooldownMs)
          state.keyPool.markDegraded(state.currentKey, cooldown)
          lastError = mcpError
          continue
        }

        state.keyPool.markSuccess(state.currentKey)
        return result as CallToolResult

      } catch (err: any) {
        const exhaustionError: ExhaustionError = {
          statusCode: err.statusCode ?? err.status,
          code: err.code,
          message: err.message ?? String(err),
          body: err.body ?? err.responseBody,
          headers: err.headers ?? err.responseHeaders,
        }

        if (state.detector.isExhausted(exhaustionError)) {
          const cooldown = extractCooldown(exhaustionError, state.name, state.config.cooldownMs)
          state.keyPool.markDegraded(state.currentKey, cooldown)
          lastError = err
          continue
        }

        throw err
      }
    }

    throw new Error(
      `All keys for ${state.name} exhausted. Last error: ${lastError?.message ?? 'unknown'}`
    )
  }

  private extractMcpError(providerName: string, result: any): ExhaustionError | null {
    if (result?.isError === true) {
      const text = result?.content?.[0]?.text ?? ''
      return { isError: true, mcpResultText: text, toolErrorText: text, message: text }
    }
    if (providerName === 'tavily' && result?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(result.content[0].text)
        if (parsed?.error && parsed?.detail) {
          return { isError: false, mcpResultText: result.content[0].text, message: parsed.detail }
        }
      } catch {}
    }
    if (providerName === 'dappier' && result?.content?.[0]?.text?.startsWith('Error:')) {
      const text = result.content[0].text
      return { isError: true, mcpResultText: text, message: text }
    }
    return null
  }
}
