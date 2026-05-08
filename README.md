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

#### OpenCode — `~/.config/opencode/opencode.json`

```json
{
  "mcp": {
    "exa":        { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=exa"],        "enabled": true },
    "firecrawl":  { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=firecrawl"],  "enabled": true },
    "tavily":     { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=tavily"],     "enabled": true },
    "linkup":     { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=linkup"],     "enabled": true },
    "brightdata": { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=brightdata"], "enabled": true },
    "olostep":    { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=olostep"],    "enabled": true },
    "dappier":    { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=dappier"],    "enabled": true },
    "parallel":   { "type": "local", "command": ["npx", "-y", "search-mcp-rotator", "--provider=parallel"],   "enabled": true }
  }
}
```

#### Pi agent — `~/.pi/agent/mcp.json`

```json
{
  "mcpServers": {
    "exa":        { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=exa"],        "lifecycle": "lazy" },
    "firecrawl":  { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=firecrawl"],  "lifecycle": "lazy" },
    "tavily":     { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=tavily"],     "lifecycle": "lazy" },
    "linkup":     { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=linkup"],     "lifecycle": "lazy" },
    "brightdata": { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=brightdata"], "lifecycle": "lazy" },
    "olostep":    { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=olostep"],    "lifecycle": "lazy" },
    "dappier":    { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=dappier"],    "lifecycle": "lazy" },
    "parallel":   { "command": "npx", "args": ["-y", "search-mcp-rotator", "--provider=parallel"],   "lifecycle": "lazy" }
  }
}
```

> Only include providers you configured in Step 1. No `--config` flag needed — reads from `~/.config/search-mcp-rotator/config.json` automatically. Restart your client after editing.

---

## Supported Providers

| Provider | Auth Pattern | Specialty |
|----------|--------------|-----------|
| **Exa** | Bearer header | Neural/semantic web search, code search |
| **Firecrawl** | Bearer header | Web scraping, deep crawl, structured extraction |
| **Linkup** | Bearer header | Real-time web search, source-cited answers |
| **Bright Data** | Bearer header | 40+ scraping tools, Google SERP |
| **Olostep** | Bearer header | Search + extract + AI answers with citations |
| **Tavily** | Query param | Real-time web search, extract, map, crawl |
| **Dappier** | Query param | Real-time news, finance, sports, weather |
| **Parallel** | Custom header | Highest-accuracy general web search |

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

| Strategy | Behavior |
|----------|----------|
| `round-robin` (default) | Distribute requests evenly across keys |
| `priority` | Always use first healthy key, fallback to others |
| `random` | Random key selection |

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

---

## License

MIT
