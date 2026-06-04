import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  ProviderConfig,
  RotationStrategy,
  ExhaustionError,
} from "./types.js";
import { KeyPool } from "./key-pool.js";
import { ExhaustionDetector, extractCooldown } from "./detector.js";
import { AuthInjector } from "./auth-injector.js";
import { logger } from "./logger.js";

// ── Per-provider state ────────────────────────────────────────────────────────
interface ProviderState {
  name: string;
  config: ProviderConfig;
  keyPool: KeyPool;
  detector: ExhaustionDetector;
  authInjector: AuthInjector;
  client: Client;
  transport: StreamableHTTPClientTransport | null;
  currentKey: string;
  tools: Tool[];
  connected: boolean;
  connectionPromise: Promise<void> | null;
  callLock: Promise<void>;
}

// ── Tool name helpers ─────────────────────────────────────────────────────────
// Prefix: "{provider}__{toolname}" — double underscore as separator
// All provider IDs are single words without underscores, making parsing unambiguous.
function prefixTool(provider: string, toolName: string): string {
  return `${provider}__${toolName}`;
}

function unprefix(
  prefixedName: string,
): { provider: string; toolName: string } | null {
  const idx = prefixedName.indexOf("__");
  if (idx === -1) return null;
  return {
    provider: prefixedName.slice(0, idx),
    toolName: prefixedName.slice(idx + 2),
  };
}

// ── MultiProxy ────────────────────────────────────────────────────────────────
export class MultiProxy {
  private server: Server;
  private providers: Map<string, ProviderState> = new Map();

  constructor(configs: Record<string, ProviderConfig>) {
    this.server = new Server(
      { name: "search-mcp-rotator", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );

    for (const [name, config] of Object.entries(configs)) {
      if (!config.enabled) continue;
      this.providers.set(name, {
        name,
        config,
        keyPool: new KeyPool(config),
        detector: new ExhaustionDetector(name, config.exhaustionPatterns),
        authInjector: new AuthInjector(config),
        client: new Client(
          { name: `${name}-client`, version: "1.0.0" },
          { capabilities: {} },
        ),
        transport: null,
        currentKey: "",
        tools: [],
        connected: false,
        connectionPromise: null,
        callLock: Promise.resolve(),
      });
    }
  }

  async start(): Promise<void> {
    this.registerHandlers();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info(`Multi-provider proxy started`, {
      providers: [...this.providers.keys()],
    });
  }

  // ── Lazy upstream connection per provider (race-safe) ────────────────────
  private async ensureConnected(state: ProviderState): Promise<void> {
    if (state.connected) return;
    // Concurrent callers share the same connection attempt
    if (state.connectionPromise) return state.connectionPromise;

    state.connectionPromise = (async () => {
      try {
        state.currentKey = state.keyPool.next();
        const { url, headers } = state.authInjector.inject(
          state.currentKey,
          state.config.url,
        );

        state.transport = new StreamableHTTPClientTransport(new URL(url), {
          requestInit: { headers },
        });
        await state.client.connect(state.transport);
        state.connected = true;

        // Always fetch fresh tools from upstream — no disk cache. Providers can
        // change/add/remove tools at any time; a stale cache would expose
        // wrong schemas and missing tools to the LLM client.
        const { tools } = await state.client.listTools();
        state.tools = tools;

        logger.info(`Connected to upstream for ${state.name}`, {
          toolCount: tools.length,
          currentKey: state.currentKey.slice(0, 8) + "...",
        });
      } finally {
        state.connectionPromise = null;
      }
    })();

    return state.connectionPromise;
  }

  // ── Reconnect with a different key ───────────────────────────────────────
  // NOTE: MCP SDK Client cannot be reused after close() — create a fresh instance.
  private async reconnect(state: ProviderState, key: string): Promise<void> {
    try {
      await state.client.close();
    } catch {}
    state.connected = false;

    state.client = new Client(
      { name: `${state.name}-client`, version: "1.0.0" },
      { capabilities: {} },
    );

    const { url, headers } = state.authInjector.inject(key, state.config.url);
    state.transport = new StreamableHTTPClientTransport(new URL(url), {
      requestInit: { headers },
    });
    await state.client.connect(state.transport);
    state.connected = true;
    state.currentKey = key;
  }

  // ── Inject strategy param into tool schema ───────────────────────────────
  private injectStrategyParam(schema: any): any {
    return {
      ...schema,
      properties: {
        ...schema.properties,
        strategy: {
          type: "string",
          enum: ["round-robin", "priority", "random"],
          description:
            "Key rotation strategy for this call. Overrides provider default.",
        },
      },
    };
  }

  // ── Register MCP handlers ────────────────────────────────────────────────
  private registerHandlers(): void {
    // tools/list — fetch fresh from all providers in parallel.
    // Tools are kept in memory for the lifetime of this process (per-call
    // refresh would be wasteful), but NEVER persisted to disk so we always
    // pick up upstream tool changes on next process start.
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Connect all providers that haven't been connected yet — in parallel.
      await Promise.allSettled(
        [...this.providers.entries()]
          .filter(([, state]) => state.tools.length === 0)
          .map(async ([name, state]) => {
            try {
              await this.ensureConnected(state);
            } catch (e) {
              logger.warn(
                `Could not fetch tools for ${name}: ${(e as Error).message}`,
              );
            }
          }),
      );

      const allTools: Tool[] = [];
      for (const [name, state] of this.providers) {
        for (const tool of state.tools) {
          allTools.push({
            ...tool,
            name: prefixTool(name, tool.name),
            inputSchema: this.injectStrategyParam(tool.inputSchema),
          });
        }
      }

      return { tools: allTools };
    });

    // tools/call — route to correct provider with key rotation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const prefixedName = request.params.name;
      const parsed = unprefix(prefixedName);

      if (!parsed) throw new Error(`Unknown tool: ${prefixedName}`);

      const state = this.providers.get(parsed.provider);
      if (!state) throw new Error(`Unknown provider: ${parsed.provider}`);

      // Serialize calls to the same provider (Client is not concurrent-safe)
      const previousLock = state.callLock;
      let releaseLock!: () => void;
      state.callLock = new Promise<void>((r) => {
        releaseLock = r;
      });
      await previousLock;
      try {
        return await this.handleToolCall(state, parsed.toolName, request);
      } finally {
        releaseLock();
      }
    });
  }

  // ── Tool call with key rotation ──────────────────────────────────────────
  private async handleToolCall(
    state: ProviderState,
    originalToolName: string,
    request: any,
  ): Promise<CallToolResult> {
    await this.ensureConnected(state);

    if (state.keyPool.allDegraded()) {
      throw new Error(
        `All API keys for ${state.name} are exhausted. Please add more keys or wait for cooldown.`,
      );
    }

    const args = { ...request.params.arguments };
    const strategyOverride = args.strategy as RotationStrategy | undefined;
    delete args.strategy;

    // Forward with original (unprefixed) tool name
    const cleanRequest = {
      ...request,
      params: { ...request.params, name: originalToolName, arguments: args },
    };

    const maxAttempts = Math.max(1, state.keyPool.getHealthyCount());
    let lastError: any = null;

    const sessionRetryKeys = new Set<string>();

    for (let attempt = 0; attempt < maxAttempts; ) {
      try {
        // First attempt: use existing connection.
        // Retry: rotate to next healthy key.
        if (attempt > 0) {
          const nextKey = state.keyPool.next(strategyOverride);
          if (!nextKey || nextKey === state.currentKey) break;
          logger.info(`Retrying ${state.name} with next key`, {
            attempt: attempt + 1,
            currentKey: state.currentKey.slice(0, 8) + "...",
            nextKey: nextKey.slice(0, 8) + "...",
          });
          await this.reconnect(state, nextKey);
        }

        // Long timeout (5 min) — heavy ops like research, page fetch, agent jobs
        // need more than the SDK's 60s default. The MCP client wrapping us can
        // still apply its own shorter timeout if desired.
        const result = await state.client.callTool(
          cleanRequest.params,
          undefined,
          { timeout: 300000 },
        );

        const mcpError = this.extractMcpError(state.name, result);
        if (
          mcpError &&
          this.isInvalidSessionError(mcpError) &&
          !sessionRetryKeys.has(state.currentKey)
        ) {
          sessionRetryKeys.add(state.currentKey);
          logger.warn(
            `Upstream session expired for ${state.name}; reconnecting same key`,
            {
              currentKey: state.currentKey.slice(0, 8) + "...",
            },
          );
          await this.reconnect(state, state.currentKey);
          continue;
        }

        if (mcpError && state.detector.isExhausted(mcpError)) {
          const cooldown = extractCooldown(
            mcpError,
            state.name,
            state.config.cooldownMs,
          );
          state.keyPool.markDegraded(state.currentKey, cooldown);
          lastError = mcpError;
          attempt++;
          continue;
        }

        state.keyPool.markSuccess(state.currentKey);
        return result as CallToolResult;
      } catch (err: any) {
        if (
          this.isInvalidSessionError(err) &&
          !sessionRetryKeys.has(state.currentKey)
        ) {
          sessionRetryKeys.add(state.currentKey);
          logger.warn(
            `Upstream session expired for ${state.name}; reconnecting same key`,
            {
              currentKey: state.currentKey.slice(0, 8) + "...",
            },
          );
          await this.reconnect(state, state.currentKey);
          continue;
        }

        const exhaustionError: ExhaustionError = {
          statusCode: err.statusCode ?? err.status,
          code: err.code,
          message: err.message ?? String(err),
          body: err.body ?? err.responseBody,
          headers: err.headers ?? err.responseHeaders,
        };

        if (state.detector.isExhausted(exhaustionError)) {
          const cooldown = extractCooldown(
            exhaustionError,
            state.name,
            state.config.cooldownMs,
          );
          state.keyPool.markDegraded(state.currentKey, cooldown);
          lastError = err;
          attempt++;
          continue;
        }

        throw err;
      }
    }

    throw new Error(
      `All keys for ${state.name} exhausted. Last error: ${lastError?.message ?? "unknown"}`,
    );
  }

  private isInvalidSessionError(error: any): boolean {
    const text = [
      error?.message,
      error?.mcpResultText,
      error?.toolErrorText,
      typeof error?.body === "string"
        ? error.body
        : JSON.stringify(error?.body ?? ""),
      String(error),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      text.includes("no valid session id") ||
      text.includes("mcp-session-id header is required") ||
      text.includes("session not found")
    );
  }

  private extractMcpError(
    providerName: string,
    result: any,
  ): ExhaustionError | null {
    if (result?.isError === true) {
      const text = result?.content?.[0]?.text ?? "";
      return {
        isError: true,
        mcpResultText: text,
        toolErrorText: text,
        message: text,
      };
    }
    if (providerName === "tavily" && result?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(result.content[0].text);
        if (parsed?.error && parsed?.detail) {
          return {
            isError: false,
            mcpResultText: result.content[0].text,
            message: parsed.detail,
          };
        }
      } catch {}
    }
    if (
      providerName === "dappier" &&
      result?.content?.[0]?.text?.startsWith("Error:")
    ) {
      const text = result.content[0].text;
      return { isError: true, mcpResultText: text, message: text };
    }
    return null;
  }
}
