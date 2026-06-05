import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { AuthInjector } from "../dist/auth-injector.js";
import { loadConfig } from "../dist/config.js";
import { KeyPool } from "../dist/key-pool.js";

const DEFAULT_OUTPUT = path.join(
  process.cwd(),
  "src/generated/tool-registry.ts",
);

function parseArgs(argv) {
  const args = {
    config: process.env.MCP_ROTATOR_CONFIG,
    output: DEFAULT_OUTPUT,
    provider: undefined,
    check: false,
    allowPartial: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check") args.check = true;
    else if (arg === "--allow-partial") args.allowPartial = true;
    else if (arg === "--config" && argv[i + 1]) args.config = argv[++i];
    else if (arg.startsWith("--config="))
      args.config = arg.slice("--config=".length);
    else if (arg === "--output" && argv[i + 1]) args.output = argv[++i];
    else if (arg.startsWith("--output="))
      args.output = arg.slice("--output=".length);
    else if (arg === "--provider" && argv[i + 1]) args.provider = argv[++i];
    else if (arg.startsWith("--provider="))
      args.provider = arg.slice("--provider=".length);
  }

  if (!args.config) {
    args.config = path.join(
      process.env.HOME ?? process.cwd(),
      ".config/search-mcp-rotator/config.json",
    );
  }

  return args;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries
      .map(
        ([key, entryValue]) =>
          `${JSON.stringify(key)}:${stableStringify(entryValue)}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function normalizeTools(tools) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

function redactProviderUrl(url) {
  const parsed = new URL(url);
  for (const key of [...parsed.searchParams.keys()]) {
    if (/key|token|secret|auth/i.test(key))
      parsed.searchParams.set(key, "<redacted>");
  }
  return parsed.toString();
}

async function fetchProviderTools(name, config) {
  const keyPool = new KeyPool(config);
  const authInjector = new AuthInjector(config);
  const key = keyPool.next();
  const { url, headers } = authInjector.inject(key, config.url);
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: { headers },
  });
  const client = new Client(
    { name: `${name}-registry-generator`, version: "1.0.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    return normalizeTools(tools);
  } finally {
    await client.close().catch(() => {});
  }
}

function renderRegistry(entries, generatedAt) {
  const registry = Object.fromEntries(
    entries.map((entry) => [entry.provider, entry]),
  );
  return `import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface StaticProviderToolRegistryEntry {
  provider: string;
  url: string;
  generatedAt: string;
  toolCount: number;
  fingerprint: string;
  tools: Tool[];
}

export const STATIC_TOOL_REGISTRY_GENERATED_AT = ${JSON.stringify(generatedAt)};

export const STATIC_TOOL_REGISTRY: Record<string, StaticProviderToolRegistryEntry> = ${JSON.stringify(registry, null, 2)};
`;
}

function registrySummary(entries) {
  return Object.fromEntries(
    entries.map((entry) => [
      entry.provider,
      {
        toolCount: entry.toolCount,
        fingerprint: entry.fingerprint,
      },
    ]),
  );
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig(args.config);
  const providers = Object.entries(config.providers).filter(
    ([name, providerConfig]) =>
      providerConfig.enabled && (!args.provider || name === args.provider),
  );

  if (providers.length === 0) {
    throw new Error(
      args.provider
        ? `Provider ${args.provider} not found or disabled`
        : "No enabled providers found",
    );
  }

  const generatedAt = new Date().toISOString();
  const results = await Promise.allSettled(
    providers.map(async ([name, providerConfig]) => {
      const tools = await fetchProviderTools(name, providerConfig);
      return {
        provider: name,
        url: redactProviderUrl(providerConfig.url),
        generatedAt,
        toolCount: tools.length,
        fingerprint: fingerprint(tools),
        tools,
      };
    }),
  );

  const entries = [];
  const failures = [];
  results.forEach((result, index) => {
    const [name] = providers[index];
    if (result.status === "fulfilled") {
      entries.push(result.value);
      process.stdout.write(`  ✓ ${name} — ${result.value.toolCount} tools\n`);
    } else {
      failures.push({ name, error: result.reason });
      process.stdout.write(
        `  ✗ ${name} — ${result.reason?.message ?? result.reason}\n`,
      );
    }
  });

  if (failures.length && !args.allowPartial) {
    throw new Error(
      `Failed to generate registry for: ${failures.map((failure) => failure.name).join(", ")}`,
    );
  }

  entries.sort((a, b) => a.provider.localeCompare(b.provider));
  const rendered = renderRegistry(entries, generatedAt);

  if (args.check) {
    const current = await import(
      `../dist/generated/tool-registry.js?check=${Date.now()}`
    );
    if (
      stableStringify(
        registrySummary(Object.values(current.STATIC_TOOL_REGISTRY)),
      ) !== stableStringify(registrySummary(entries))
    ) {
      process.stderr.write(
        "Static tool registry drift detected. Run npm run generate:tools.\n",
      );
      process.exit(1);
    }
    process.stdout.write("Static tool registry is up to date.\n");
    process.exit(0);
  }

  await mkdir(path.dirname(args.output), { recursive: true });
  await writeFile(args.output, rendered, "utf8");
  process.stdout.write(
    `Wrote ${args.output} with ${entries.length} providers.\n`,
  );
  process.exit(0);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
