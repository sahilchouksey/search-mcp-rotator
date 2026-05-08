# Search MCP Rotator

<p align="center">
  <img src="https://raw.githubusercontent.com/sahilchouksey/search-mcp-rotator/main/poster.png" alt="Search MCP Rotator" width="100%" />
</p>

A local MCP (Model Context Protocol) proxy server that provides transparent API key rotation for search providers. When one key is exhausted, rate-limited, or returns any server-side error, the proxy automatically rotates to the next available key and retries the request — transparently, without the MCP client knowing a rotation occurred.

## Features

- **Transparent Key Rotation**: Automatic failover between API keys
- **Multi-Provider Support**: Supports 9 search providers with different auth patterns
- **Flexible Rotation Strategies**: Round-robin, priority, and random selection
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Configurable Cooldowns**: Smart recovery timing per provider
- **Strategy-as-Tool-Argument**: LLMs can choose rotation strategy per request
- **Comprehensive Error Detection**: Provider-specific exhaustion patterns

## Supported Providers

| Provider | Auth Pattern | Specialty |
|----------|--------------|-----------|
| **Exa** | Bearer header | Neural/semantic web search, code search |
| **Firecrawl** | Bearer header | Web scraping, deep crawl, structured extraction |
| **Linkup** | Bearer header | Real-time web search, source-cited answers |
| **Bright Data** | Bearer header | 40+ scraping tools, Google SERP, Amazon |
| **Olostep** | Bearer header | Search + extract + AI answers with citations |
| **Tavily** | Query param | Real-time web search, extract, map, crawl |
| **Dappier** | Query param | Real-time news, finance, sports, weather |
| **Parallel** | Custom header | Highest-accuracy general web search |

## Installation

```bash
npm install
npm run build
```

## Configuration

Copy `config.example.json` to `config.json` and add your API keys:

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

### Environment Variable Overrides

Keys can be overridden via environment variables:

```bash
export EXA_KEYS="key1,key2,key3"
export FIRECRAWL_KEYS="key1,key2"
```

## Usage

Start a rotator for a specific provider:

```bash
# Using built binary
node dist/index.js --provider=exa --config=config.json

# Or using npm script
npm run dev -- --provider=exa --config=config.json
```

## OpenCode Integration

Register each rotator as a local MCP server in `~/.config/opencode/opencode.json`:

```json
{
  "mcpServers": {
    "exa-rotator": {
      "type": "local",
      "command": "node",
      "args": [
        "/path/to/search-mcp-rotator/dist/index.js",
        "--provider=exa"
      ],
      "env": {
        "MCP_ROTATOR_CONFIG": "/path/to/config.json"
      },
      "enabled": true
    }
  }
}
```

## Rotation Strategies

Every tool call accepts an optional `strategy` parameter:

- **`round-robin`** (default): Distribute requests evenly across keys
- **`priority`**: Always use first healthy key, fallback to others
- **`random`**: Random key selection to avoid patterns

```typescript
// Example tool call with strategy override
{
  "query": "AI news",
  "strategy": "priority"  // Optional: overrides provider default
}
```

## Architecture

```
OpenCode (MCP client)
        │  stdio transport
        ▼
┌─────────────────────────┐
│   Search MCP Rotator Proxy     │
│  (local stdio server)   │
│                         │
│  ┌─────────────────┐    │
│  │   KeyPool       │    │
│  │  [key1, key2,   │    │
│  │   key3, key4]   │    │
│  │  activeIdx = 0  │    │
│  │  degraded: Map  │    │
│  └─────────────────┘    │
│                         │
│  On tool call:          │
│  1. pick active key     │
│  2. inject into request │
│  3. forward upstream    │
│  4. on rate-limit:      │
│     mark degraded       │
│     rotate key          │
│     retry same call     │
└─────────────────────────┘
        │  HTTP (Streamable HTTP transport)
        ▼
  Remote MCP Provider
  (Exa / Firecrawl / etc.)
```

## Error Detection

The rotator detects exhaustion signals specific to each provider:

- **HTTP Status Codes**: 401, 402, 429, etc.
- **JSON-RPC Error Codes**: Provider-specific codes
- **Message Patterns**: "rate limit", "quota", "credits exhausted"
- **Special Cases**: Provider-specific error formats

## Development

```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev -- --provider=exa

# Type checking
npm run typecheck

# Build for production
npm run build
```

## License

MIT