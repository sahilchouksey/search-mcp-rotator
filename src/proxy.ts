import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool, 
  CallToolResult, 
  ListToolsResult 
} from '@modelcontextprotocol/sdk/types.js'

import type { ProviderConfig, RotationStrategy, ExhaustionError } from './types.js'
import { KeyPool } from './key-pool.js'
import { ExhaustionDetector, extractCooldown } from './detector.js'
import { AuthInjector } from './auth-injector.js'
import { logger } from './logger.js'

export class MCPProxy {
  private server: Server
  private upstreamClient: Client
  private upstreamTransport: StreamableHTTPClientTransport | null = null
  private currentKey: string = ''
  private tools: Tool[] = []
  
  constructor(
    private readonly providerName: string,
    private readonly config: ProviderConfig,
    private readonly keyPool: KeyPool,
    private readonly detector: ExhaustionDetector,
    private readonly authInjector: AuthInjector,
  ) {
    this.server = new Server(
      { name: `${providerName}-rotator`, version: '1.0.0' },
      { capabilities: { tools: {} } }
    )
    this.upstreamClient = new Client(
      { name: `${providerName}-rotator-client`, version: '1.0.0' },
      { capabilities: {} }
    )
  }
  
  async start(): Promise<void> {
    // Register handlers immediately — upstream connects lazily on first tool call
    this.registerHandlers()

    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    logger.info(`MCP proxy started for ${this.providerName}`)
  }
  
  private async connectUpstream(key: string): Promise<void> {
    if (this.upstreamTransport) {
      try { 
        await this.upstreamClient.close() 
      } catch {}
    }
    
    const { url, headers } = this.authInjector.inject(key, this.config.url)
    
    this.upstreamTransport = new StreamableHTTPClientTransport(
      new URL(url), 
      { requestInit: { headers } }
    )
    await this.upstreamClient.connect(this.upstreamTransport)
    this.currentKey = key
    
    logger.debug(`Connected to upstream with key: ${this.maskKey(key)}`, { url })
  }
  
  private async discoverTools(): Promise<Tool[]> {
    const result = await this.upstreamClient.listTools()
    logger.debug(`Discovered ${result.tools.length} tools from upstream`)
    return result.tools
  }
  
  private async ensureConnected(): Promise<void> {
    if (this.upstreamTransport) return
    this.currentKey = this.keyPool.next()
    await this.connectUpstream(this.currentKey)
    this.tools = await this.discoverTools()
    logger.info(`Connected to upstream for ${this.providerName}`, {
      toolCount: this.tools.length,
      currentKey: this.maskKey(this.currentKey)
    })
  }

  private registerHandlers(): void {
    // tools/list — connect lazily on first call
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      await this.ensureConnected()
      const toolsWithStrategy = this.tools.map(tool => ({
        ...tool,
        inputSchema: this.injectStrategyParam(tool.inputSchema),
      }))
      return { tools: toolsWithStrategy }
    })
    
    // tools/call — forward with key rotation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.handleToolCall(request)
    })
  }
  
  private injectStrategyParam(schema: any): any {
    // Add optional 'strategy' enum param to every tool's input schema
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
      // strategy is NOT required
    }
  }
  
  private async handleToolCall(request: any): Promise<CallToolResult> {
    await this.ensureConnected()

    // Check if all keys are degraded early
    if (this.keyPool.allDegraded()) {
      throw new Error(
        `All API keys for ${this.providerName} are exhausted or degraded. ` +
        `Please add more keys or wait for cooldown.`
      )
    }
    
    // Extract and remove strategy from args (don't forward to upstream)
    const args = { ...request.params.arguments }
    const strategyOverride = args.strategy as RotationStrategy | undefined
    delete args.strategy
    
    const cleanRequest = { ...request, params: { ...request.params, arguments: args } }
    
    const maxAttempts = Math.max(1, this.keyPool.getHealthyCount())
    let lastError: any = null
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Get key for this attempt
        if (attempt > 0) {
          // Rotate to next key
          const nextKey = this.keyPool.next(strategyOverride)
          if (!nextKey || nextKey === this.currentKey) break
          await this.connectUpstream(nextKey)
        } else {
          // First attempt: use current key or get new one with strategy
          const key = this.keyPool.next(strategyOverride)
          if (key !== this.currentKey) {
            await this.connectUpstream(key)
          }
        }
        
        const result = await this.upstreamClient.callTool(cleanRequest.params)
        
        // CHECK: Does the result look like an exhaustion error hidden inside HTTP 200?
        const mcpError = this.extractMcpLevelError(result)
        if (mcpError && this.detector.isExhausted(mcpError)) {
          const cooldown = this.extractCooldownFromResult(result, mcpError)
          this.keyPool.markDegraded(this.currentKey, cooldown)
          lastError = mcpError
          continue  // retry with next key
        }
        
        // Success
        this.keyPool.markSuccess(this.currentKey)
        return result as CallToolResult
        
      } catch (err: any) {
        // HTTP-level or MCP transport error
        const exhaustionError: ExhaustionError = {
          statusCode: err.statusCode ?? err.status,
          code: err.code,
          message: err.message ?? String(err),
          body: err.body ?? err.responseBody,
          headers: err.headers ?? err.responseHeaders,
        }
        
        if (this.detector.isExhausted(exhaustionError)) {
          const cooldown = extractCooldown(exhaustionError, this.providerName, this.config.cooldownMs)
          this.keyPool.markDegraded(this.currentKey, cooldown)
          lastError = err
          // reconnect with next key on next iteration
          continue
        }
        
        // Hard error (bad input, etc.) — don't rotate
        throw err
      }
    }
    
    // All keys exhausted
    throw new Error(
      `All API keys for ${this.providerName} are exhausted or degraded. ` +
      `Last error: ${lastError?.message ?? 'unknown'}. ` +
      `Please add more keys or wait for cooldown.`
    )
  }
  
  private extractMcpLevelError(result: any): ExhaustionError | null {
    // Handle isError: true (most providers)
    if (result?.isError === true) {
      const text = result?.content?.[0]?.text ?? ''
      return { 
        isError: true, 
        mcpResultText: text, 
        toolErrorText: text, 
        message: text 
      }
    }
    
    // Handle Tavily: isError: false but content[0].text is JSON with error/detail fields
    if (this.providerName === 'tavily' && result?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(result.content[0].text)
        if (parsed?.error && parsed?.detail) {
          return { 
            isError: false, 
            mcpResultText: result.content[0].text, 
            message: parsed.detail 
          }
        }
      } catch {}
    }
    
    // Handle Dappier: content[0].text starts with "Error:"
    if (this.providerName === 'dappier' && result?.content?.[0]?.text) {
      const text: string = result.content[0].text
      if (text.startsWith('Error:')) {
        return { 
          isError: true, 
          mcpResultText: text, 
          message: text 
        }
      }
    }
    
    return null
  }
  
  private extractCooldownFromResult(result: any, error: ExhaustionError): number {
    return extractCooldown(error, this.providerName, this.config.cooldownMs)
  }
  
  private maskKey(key: string): string {
    return key.length > 8 ? `${key.substring(0, 8)}...` : key
  }
}