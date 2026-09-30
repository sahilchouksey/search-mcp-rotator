import { existsSync, mkdirSync, readFileSync } from "fs";
import { writeFile } from "fs/promises";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "./logger.js";
import { TOOL_CACHE_PATH, TOOL_CACHE_TTL_MS } from "./constants.js";

export interface ToolCacheEntry {
  tools: Tool[];
  fetchedAt: number; // Unix ms
}

export interface ToolCache {
  /** Sync lookup; returns null on miss, expiry, or any error. Never throws. */
  read(provider: string): ToolCacheEntry | null;
  /** Fire-and-forget persist; never throws. Caller must not await. */
  write(provider: string, tools: Tool[]): void;
  /** Remove one provider's entry; never throws. */
  invalidate(provider: string): void;
  /** True when the entry exists but is older than half the TTL. */
  needsRefresh(provider: string): boolean;
}

export function createToolCache(ttlMs: number = TOOL_CACHE_TTL_MS): ToolCache {
  let store: Record<string, ToolCacheEntry> = {};

  try {
    if (existsSync(TOOL_CACHE_PATH)) {
      const raw = readFileSync(TOOL_CACHE_PATH, "utf-8");
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        store = parsed as Record<string, ToolCacheEntry>;
      }
    }
  } catch (e) {
    logger.warn(`Tool cache unreadable, starting empty`, {
      error: (e as Error).message ?? String(e),
    });
    store = {};
  }

  function isExpired(entry: ToolCacheEntry): boolean {
    if (
      typeof entry?.fetchedAt !== "number" ||
      !Array.isArray(entry?.tools)
    ) {
      return true;
    }
    return Date.now() - entry.fetchedAt > ttlMs;
  }

  function persist(): void {
    // Fire-and-forget: never block callers, never throw.
    writeFile(TOOL_CACHE_PATH, JSON.stringify(store), "utf-8").catch((e) =>
      logger.warn(`Tool cache write failed`, {
        error: (e as Error)?.message ?? String(e),
      }),
    );
  }

  function ensureDir(): void {
    try {
      const dir = TOOL_CACHE_PATH.slice(
        0,
        TOOL_CACHE_PATH.lastIndexOf("/"),
      );
      mkdirSync(dir, { recursive: true });
    } catch (e) {
      logger.warn(`Tool cache dir creation failed`, {
        error: (e as Error)?.message ?? String(e),
      });
    }
  }

  return {
    read(provider: string): ToolCacheEntry | null {
      try {
        const entry = store[provider];
        if (!entry || isExpired(entry)) return null;
        return entry;
      } catch {
        return null;
      }
    },

    write(provider: string, tools: Tool[]): void {
      try {
        // Defensive copy so later mutation of state.tools can't corrupt cache.
        store[provider] = {
          tools: JSON.parse(JSON.stringify(tools)) as Tool[],
          fetchedAt: Date.now(),
        };
        ensureDir();
        persist();
      } catch (e) {
        logger.warn(`Tool cache write failed for ${provider}`, {
          error: (e as Error)?.message ?? String(e),
        });
      }
    },

    invalidate(provider: string): void {
      try {
        delete store[provider];
        persist();
      } catch (e) {
        logger.warn(`Tool cache invalidate failed for ${provider}`, {
          error: (e as Error)?.message ?? String(e),
        });
      }
    },

    needsRefresh(provider: string): boolean {
      try {
        const entry = store[provider];
        if (!entry || isExpired(entry)) return false;
        return Date.now() - entry.fetchedAt > ttlMs / 2;
      } catch {
        return false;
      }
    },
  };
}
