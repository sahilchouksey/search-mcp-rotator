import * as os from "os";
import * as path from "path";

/** Per-call timeout (ms) for upstream connect + listTools during discovery. */
export const DISCOVERY_TIMEOUT_MS = 12_000;

/** Default disk-cache TTL: 7 days. */
export const TOOL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Extra grace (ms) added to the outer tools/list wait beyond the timeout. */
export const DISCOVERY_GRACE_MS = 500;

export const CONFIG_DIR = path.join(
  os.homedir(),
  ".config",
  "search-mcp-rotator",
);

export const TOOL_CACHE_PATH = path.join(CONFIG_DIR, "tool-cache.json");
