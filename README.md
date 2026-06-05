# Search MCP Rotator

<p align="center">
  <img src="https://raw.githubusercontent.com/sahilchouksey/search-mcp-rotator/main/poster.png" alt="Search MCP Rotator" width="100%" />
</p>

A local MCP proxy that transparently rotates API keys across search providers. When a key is rate-limited, exhausted, or errors, it automatically switches to the next key and retries — invisible to the MCP client.

---

## Quick Start

### Step 1 — Add your API keys

Run the interactive setup CLI to select providers and enter your keys:

```bash
npx search-mcp-rotator --setup
```

The wizard walks through each provider, lets you paste multiple keys at once (comma-separated), and writes config to `~/.config/search-mcp-rotator/config.json` automatically.

> Press `Ctrl+O` on any provider screen to open its API key dashboard in your browser.

### Step 2 — Add to your MCP client

One entry covers all your configured providers.

#### OpenCode — `~/.config/opencode/opencode.json`

```json
{
  "mcp": {
    "search": {
      "type": "local",
      "command": ["npx", "-y", "search-mcp-rotator"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

#### Pi agent — `~/.pi/agent/mcp.json`

```json
{
  "mcpServers": {
    "search": {
      "command": "npx",
      "args": ["-y", "search-mcp-rotator"],
      "lifecycle": "lazy"
    }
  }
}
```

> No `--config` flag needed — reads from `~/.config/search-mcp-rotator/config.json` automatically. Restart your client after editing.

> Tools are exposed as `{provider}__{toolname}` (e.g. `exa__web_search_exa`, `tavily__web_search`).

---

## Supported Providers

| Provider        | Auth Pattern  | Specialty                                       |
| --------------- | ------------- | ----------------------------------------------- |
| **Exa**         | Bearer header | Neural/semantic web search, code search         |
| **Firecrawl**   | Bearer header | Web scraping, deep crawl, structured extraction |
| **Linkup**      | Bearer header | Real-time web search, source-cited answers      |
| **Bright Data** | Bearer header | 40+ scraping tools, Google SERP                 |
| **Olostep**     | Bearer header | Search + extract + AI answers with citations    |
| **Tavily**      | Query param   | Real-time web search, extract, map, crawl       |
| **Dappier**     | Query param   | Real-time news, finance, sports, weather        |
| **Parallel**    | Custom header | Highest-accuracy general web search             |

---

## Features

- **Transparent Key Rotation** — automatic failover between API keys
- **Multi-Provider Support** — 8 providers, different auth patterns handled automatically
- **Flexible Rotation Strategies** — round-robin, priority, random per tool call
- **Circuit Breaker** — prevents cascading failures
- **Configurable Cooldowns** — smart recovery timing per provider
- **Bulk Key Entry** — paste comma-separated keys during setup

---

## Manual Configuration

Prefer editing config directly instead of `--setup`? Copy the example and add your keys:

```bash
cp config.example.json ~/.config/search-mcp-rotator/config.json
```

```json
{
  "logLevel": "info",
  "providers": {
    "exa": {
      "enabled": true,
      "url": "https://mcp.exa.ai/mcp",
      "authPattern": "bearer",
      "keys": ["your_exa_key_1", "your_exa_key_2"],
      "strategy": "round-robin",
      "cooldownMs": 60000
    }
  }
}
```

Keys can also be set via environment variables:

```bash
export EXA_KEYS="key1,key2,key3"
export FIRECRAWL_KEYS="key1,key2"
```

---

## Rotation Strategies

Every tool call accepts an optional `strategy` parameter:

| Strategy                | Behavior                                         |
| ----------------------- | ------------------------------------------------ |
| `round-robin` (default) | Distribute requests evenly across keys           |
| `priority`              | Always use first healthy key, fallback to others |
| `random`                | Random key selection                             |

---

## Architecture

```
MCP Client (OpenCode / Pi / etc.)
        │  stdio transport
        ▼
┌─────────────────────────┐
│   Search MCP Rotator    │
│   (local stdio proxy)   │
│                         │
│  KeyPool [k1, k2, k3]  │
│  activeIdx = 0          │
│  degraded: Map          │
│                         │
│  1. pick active key     │
│  2. inject into request │
│  3. forward upstream    │
│  4. on rate-limit:      │
│     mark degraded       │
│     rotate key, retry   │
└─────────────────────────┘
        │  HTTP (Streamable HTTP)
        ▼
  Remote MCP Provider
```

---

## Development

```bash
npm install
npm run build
npm run dev -- --provider=exa   # watch mode
npm run typecheck
```

### Static Tool Registry

The package ships a generated snapshot of upstream MCP tool schemas so client `tools/list` can return immediately without connecting to every provider on startup. Tool execution still connects to the live upstream provider and uses the normal key rotation/retry logic.

Regenerate the registry from your configured providers:

```bash
npm run generate:tools
```

Check whether live provider schemas drifted from the committed snapshot:

```bash
npm run check:tools
```

Run `generate:tools`, review the diff, then rebuild before publishing when providers add, remove, or change tools.

---

## License

MIT
