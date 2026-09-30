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
import {
  exposeProviderTools,
  getStaticProviderTools,
  unprefixToolName,
} from "./tool-registry.js";
import { createToolCache, type ToolCache } from "./tool-cache.js";
import {
  DISCOVERY_GRACE_MS,
  DISCOVERY_TIMEOUT_MS,
  TOOL_CACHE_TTL_MS,
} from "./constants.js";

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

// ── MultiProxy ────────────────────────────────────────────────────────────────
export class MultiProxy {
  private server: Server;
  private providers: Map<string, ProviderState> = new Map();
  private cache: ToolCache;
  private readonly discoveryTimeoutMs: number;

  constructor(
    configs: Record<string, ProviderConfig>,
    opts?: { discoveryTimeoutMs?: number; toolCacheTtlMs?: number },
  ) {
    this.server = new Server(
      { name: "search-mcp-rotator", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );
    this.discoveryTimeoutMs =
      opts?.discoveryTimeoutMs ?? DISCOVERY_TIMEOUT_MS;
    this.cache = createToolCache(opts?.toolCacheTtlMs ?? TOOL_CACHE_TTL_MS);

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
        tools: getStaticProviderTools(name),
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
        await state.client.connect(state.transport, {
          timeout: this.discoveryTimeoutMs,
        });
        state.connected = true;

        logger.info(`Connected to upstream for ${state.name}`, {
          currentKey: state.currentKey.slice(0, 8) + "...",
        });
      } finally {
        state.connectionPromise = null;
      }
    })();

    return state.connectionPromise;
  }

  private async discoverTools(state: ProviderState): Promise<void> {
    await this.ensureConnected(state);
    const { tools } = await state.client.listTools(undefined, {
      timeout: this.discoveryTimeoutMs,
    });
    state.tools = tools;
    // Fire-and-forget disk cache persist; never blocks the caller.
    this.cache.write(state.name, tools);
    logger.info(`Discovered upstream tools for ${state.name}`, {
      toolCount: tools.length,
      currentKey: state.currentKey.slice(0, 8) + "...",
    });
  }

  /** Best-effort tools/list_changed notification; never throws. */
  private notifyToolsChanged(provider: string): void {
    try {
      const p = this.server.sendToolListChanged();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch((e) =>
          logger.debug(`sendToolListChanged failed for ${provider}`, {
            error: (e as Error)?.message ?? String(e),
          }),
        );
      }
    } catch (e) {
      logger.debug(`sendToolListChanged threw for ${provider}`, {
        error: (e as Error)?.message ?? String(e),
      });
    }
  }

  /**
   * Non-blocking background warmup: live-discover registry-miss providers and
   * refresh the disk cache. Errors are logged; they never propagate.
   * Callers must NOT await this on the startup path.
   */
  async warmup(): Promise<void> {
    const jobs = [...this.providers.entries()]
      .filter(([, state]) => state.tools.length === 0)
      .map(async ([name, state]) => {
        try {
          await this.discoverTools(state);
          this.notifyToolsChanged(name);
        } catch (e) {
          logger.warn(`Warmup discovery failed for ${name}`, {
            error: (e as Error)?.message ?? String(e),
          });
        }
      });
    await Promise.allSettled(jobs);
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

  // ── Register MCP handlers ────────────────────────────────────────────────
  private registerHandlers(): void {
    // tools/list — return static/generated schemas immediately. Providers
    // missing from the bundled registry fall back to cache, then to bounded
    // live discovery. Slow providers finish in the background and trigger a
    // tools/list_changed notification so the client can re-fetch.
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // 1. Synchronous disk-cache fill for registry-miss providers (no I/O wait).
      for (const [name, state] of this.providers) {
        if (state.tools.length > 0) continue;
        const hit = this.cache.read(name);
        if (hit) {
          state.tools = hit.tools;
          logger.info(`Using cached tools for ${name}`, {
            toolCount: hit.tools.length,
            ageMs: Date.now() - hit.fetchedAt,
          });
          if (this.cache.needsRefresh(name)) {
            void this.discoverTools(state)
              .then(() => this.notifyToolsChanged(name))
              .catch(() => {});
          }
        }
      }

      // 2. Bounded live discovery for providers still without tools.
      const missing = [...this.providers.entries()].filter(
        ([, state]) => state.tools.length === 0,
      );
      const inFlight = missing.map(([name, state]) =>
        this.discoverTools(state).then(
          () => ({ name, ok: true as const }),
          (error: unknown) => ({ name, ok: false as const, error }),
        ),
      );
      // Never block the response longer than timeout + grace.
      // Each waiter resolves on EITHER discovery completion or the budget
      // expiring — the timeout must settle the waiter itself, not just win
      // a discarded race.
      const budget = this.discoveryTimeoutMs + DISCOVERY_GRACE_MS;
      await Promise.allSettled(
        inFlight.map(
          (p) =>
            new Promise<null>((resolve) => {
              p.then(
                () => resolve(null),
                () => resolve(null),
              );
              setTimeout(() => resolve(null), budget);
            }),
        ),
      );

      // 3. Late finishers: on success the state is already updated by
      // discoverTools — just notify the client so it re-fetches.
      const emptyAtRespond = new Set(
        missing
          .filter(([, state]) => state.tools.length === 0)
          .map(([name]) => name),
      );
      missing.forEach(([name], i) => {
        if (!emptyAtRespond.has(name)) return;
        void inFlight[i].then((result) => {
          if (!result.ok) {
            logger.warn(
              `Could not fetch tools for ${result.name}: ${(result.error as Error)?.message ?? String(result.error)}`,
            );
            return;
          }
          const current = this.providers.get(name);
          if (current && current.tools.length > 0) {
            this.notifyToolsChanged(name);
          }
        });
      });

      const allTools: Tool[] = [];
      for (const [name, state] of this.providers) {
        allTools.push(...exposeProviderTools(name, state.tools));
      }

      return { tools: allTools };
    });

    // tools/call — route to correct provider with key rotation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const prefixedName = request.params.name;
      const parsed = unprefixToolName(prefixedName);

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
    const transportRetryKeys = new Set<string>();

    for (let attempt = 0; attempt < maxAttempts; ) {
      let attemptedKey = state.currentKey;
      let callStarted = false;

      try {
        // First attempt: use existing connection.
        // Retry: rotate to next healthy key.
        if (attempt > 0) {
          const nextKey = state.keyPool.next(strategyOverride);
          if (!nextKey || nextKey === state.currentKey) break;
          attemptedKey = nextKey;
          logger.info(`Retrying ${state.name} with next key`, {
            attempt: attempt + 1,
            currentKey: state.currentKey.slice(0, 8) + "...",
            nextKey: nextKey.slice(0, 8) + "...",
          });
          await this.reconnect(state, nextKey);
        } else if (!state.connected) {
          const key = state.keyPool.next(strategyOverride);
          attemptedKey = key;
          await this.reconnect(state, key);
        }

        // Long timeout (5 min) — heavy ops like research, page fetch, agent jobs
        // need more than the SDK's 60s default. The MCP client wrapping us can
        // still apply its own shorter timeout if desired.
        callStarted = true;
        const result = await state.client.callTool(
          cleanRequest.params,
          undefined,
          { timeout: 300000 },
        );

        const mcpError = this.extractMcpError(state.name, result);
        if (
          mcpError &&
          this.isReconnectSameKeyError(mcpError) &&
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
        if (!callStarted && this.isTransientTransportError(err)) {
          logger.warn(`Upstream connect failed for ${state.name}; rotating key`, {
            attemptedKey: attemptedKey.slice(0, 8) + "...",
            error: err?.message ?? String(err),
          });
          state.keyPool.markDegraded(attemptedKey, Math.min(state.config.cooldownMs, 60_000));
          lastError = err;
          attempt++;
          continue;
        }

        if (
          this.isReconnectSameKeyError(err) &&
          !sessionRetryKeys.has(attemptedKey)
        ) {
          sessionRetryKeys.add(attemptedKey);
          logger.warn(
            `Upstream session expired for ${state.name}; reconnecting same key`,
            {
              currentKey: attemptedKey.slice(0, 8) + "...",
            },
          );
          try {
            await this.reconnect(state, attemptedKey);
          } catch (reconnectError: any) {
            logger.warn(`Same-key reconnect failed for ${state.name}; rotating key`, {
              currentKey: attemptedKey.slice(0, 8) + "...",
              error: reconnectError?.message ?? String(reconnectError),
            });
            state.keyPool.markDegraded(attemptedKey, Math.min(state.config.cooldownMs, 60_000));
            lastError = reconnectError;
            attempt++;
          }
          continue;
        }

        if (
          this.isTransientTransportError(err) &&
          !transportRetryKeys.has(attemptedKey)
        ) {
          transportRetryKeys.add(attemptedKey);
          logger.warn(`Upstream transport failed for ${state.name}; reconnecting same key`, {
            currentKey: attemptedKey.slice(0, 8) + "...",
            error: err?.message ?? String(err),
          });
          try {
            await this.reconnect(state, attemptedKey);
          } catch (reconnectError: any) {
            logger.warn(`Same-key reconnect failed for ${state.name}; rotating key`, {
              currentKey: attemptedKey.slice(0, 8) + "...",
              error: reconnectError?.message ?? String(reconnectError),
            });
            state.keyPool.markDegraded(attemptedKey, Math.min(state.config.cooldownMs, 60_000));
            lastError = reconnectError;
            attempt++;
          }
          continue;
        }

        if (this.isTransientTransportError(err)) {
          logger.warn(`Repeated upstream transport failure for ${state.name}; rotating key`, {
            currentKey: attemptedKey.slice(0, 8) + "...",
            error: err?.message ?? String(err),
          });
          state.keyPool.markDegraded(attemptedKey, Math.min(state.config.cooldownMs, 60_000));
          lastError = err;
          attempt++;
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
          state.keyPool.markDegraded(attemptedKey, cooldown);
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

  private isReconnectSameKeyError(error: any): boolean {
    const text = this.errorText(error);

    return (
      text.includes("no valid session id") ||
      text.includes("mcp-session-id header is required") ||
      text.includes("session not found")
    );
  }

  private isTransientTransportError(error: any): boolean {
    const text = this.errorText(error);

    return (
      text.includes("fetch failed") ||
      text.includes("networkerror") ||
      text.includes("econnreset") ||
      text.includes("etimedout") ||
      text.includes("socket hang up")
    );
  }

  private errorText(error: any): string {
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

    return text;
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
