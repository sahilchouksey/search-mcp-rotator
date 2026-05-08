import type { ExhaustionError, ExhaustionPatternConfig } from './types.js'

// Provider-specific exhaustion patterns from PROVIDERS.md
export const PROVIDER_EXHAUSTION_CONFIG = {
  exa: {
    httpStatusCodes: [401, 402, 429],
    jsonRpcErrorCodes: [-32000],
    messagePatterns: [
      'invalid api key', 'no_more_credits', 'api_key_budget_exceeded', 'team_budget_exceeded',
      'credits exhausted', 'payment required', 'account credits', 'spending budget',
      'rate limit', 'too many requests', "you've exceeded your exa rate limit",
      "you've hit exa's free mcp rate limit", 'quota',
    ],
    cooldownOverrides: { 402: 3600000, 401: 31536000000 },
    hasRetryAfterHeader: true, // free-tier MCP 429 only
  },

  firecrawl: {
    httpStatusCodes: [401, 402, 429, 500, 502, 503, 504],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'rate limit exceeded', 'request rate limit exceeded', 'concurrency limit reached',
      'payment required', 'insufficient credits', 'payment required to access',
      'unauthorized: invalid token', 'unauthorized: token missing', 'unauthorized',
      'retry after', 'error creating server',
    ],
    cooldownOverrides: { 402: 86400000, 401: 604800000 },
    hasRetryAfterHeader: true, // 429 REST API
  },

  tavily: {
    httpStatusCodes: [401, 429, 432, 433],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'authentication required', 'unauthorized', 'invalid api key', 'missing or invalid',
      'excessive requests', 'rate of requests', 'usage limit', 'pay-as-you-go',
      'paygo limit', 'search failed',
    ],
    cooldownOverrides: { 432: 86400000, 433: 3600000, 401: 31536000000 },
    hasRetryAfterHeader: true, // 429 REST API
  },

  linkup: {
    httpStatusCodes: [401, 403, 429],
    jsonRpcErrorCodes: [-32000],
    messagePatterns: [
      'unauthorized action', 'api key is required', 'insufficient', 'too many requests',
      'out of credit', 'credit', 'rate limit',
    ],
    cooldownOverrides: {}, // no Retry-After; use x-ratelimit-reset (seconds) when available
    hasRetryAfterHeader: false,
  },

  brightdata: {
    httpStatusCodes: [401, 402, 407, 429],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'http 401: auth method is not supported', 'http 401: token expired', 'http 401',
      '5,000 request monthly limit',
      'monthly limit for bright data mcp', 'usage limit', 'zone has reached usage limit',
      'http 502', 'http 429', 'http 407', 'account is suspended', 'kyc required', 'http 402',
    ],
    cooldownOverrides: {}, // use toolErrorText to distinguish (see isBrightDataExhausted)
    hasRetryAfterHeader: false, // not at MCP layer
  },

  olostep: {
    httpStatusCodes: [401, 402, 403],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'invalid_api_key', 'invalid api key', 'your api key is invalid',
      'credits exhausted', 'payment required',
      'olostep api error: 401', 'olostep api error: 402', 'olostep api error: 403',
    ],
    cooldownOverrides: {}, // no headers; fixed 300000 ms default
    hasRetryAfterHeader: false,
  },

  dappier: {
    httpStatusCodes: [401, 402],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'error: failed to retrieve real-time information', 'error: failed to retrieve',
      'error: unable to retrieve', 'error: authentication', 'error: unauthorized',
      'missing authentication',
    ],
    cooldownOverrides: {}, // no headers; fixed 300000 ms default
    hasRetryAfterHeader: false,
  },

  parallel: {
    httpStatusCodes: [401, 402, 429],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      'oauth.v2.invalidapikey', 'steps.oauth.v2.failedtoresolveapikey', 'oauth.v2.apikeyexpired',
      'oauth.v2.apikeynotapproved', 'invalid apikey', 'failedtoresolveapikey',
      'invalid api key', 'rate limit', 'too many requests', 'insufficient credit',
      'quota exceeded', 'code":16',
    ],
    cooldownOverrides: {}, // no headers; fixed 60000 ms default
    hasRetryAfterHeader: false,
  },
} as const

export class ExhaustionDetector {
  private patterns: ExhaustionPatternConfig
  private providerName: string

  constructor(providerName: string, customPatterns?: Partial<ExhaustionPatternConfig>) {
    this.providerName = providerName
    
    // Get default patterns for this provider
    const defaultPatterns = (PROVIDER_EXHAUSTION_CONFIG as any)[providerName] || {
      httpStatusCodes: [429, 402, 403, 401],
      jsonRpcErrorCodes: [],
      messagePatterns: ['rate limit', 'quota', 'credits', 'exhausted', 'too many requests', 'billing'],
      cooldownOverrides: {},
      hasRetryAfterHeader: false
    }
    
    // Merge with custom patterns
    this.patterns = {
      httpStatusCodes: customPatterns?.httpStatusCodes || defaultPatterns.httpStatusCodes,
      jsonRpcErrorCodes: customPatterns?.jsonRpcErrorCodes || defaultPatterns.jsonRpcErrorCodes,
      messagePatterns: customPatterns?.messagePatterns || defaultPatterns.messagePatterns,
      cooldownOverrides: { ...defaultPatterns.cooldownOverrides, ...customPatterns?.cooldownOverrides },
      hasRetryAfterHeader: customPatterns?.hasRetryAfterHeader ?? defaultPatterns.hasRetryAfterHeader
    }
  }

  /**
   * Determine if an error indicates key exhaustion
   */
  isExhausted(error: ExhaustionError): boolean {
    // Provider-specific logic
    switch (this.providerName) {
      case 'exa':
        return this.isExaExhausted(error)
      case 'firecrawl':
        return this.isFirecrawlExhausted(error)
      case 'tavily':
        return this.isTavilyExhausted(error)
      case 'linkup':
        return this.isLinkupExhausted(error)
      case 'brightdata':
        return this.isBrightDataExhausted(error)
      case 'olostep':
        return this.isOlostepExhausted(error)
      case 'dappier':
        return this.isDappierExhausted(error)
      case 'parallel':
        return this.isParallelExhausted(error)
      default:
        return this.isGenericExhausted(error)
    }
  }

  private isExaExhausted(error: ExhaustionError): boolean {
    const ROTATE_STATUSES = [401, 402, 429]
    const ROTATE_PATTERNS = [
      'invalid api key', 'no_more_credits', 'api_key_budget_exceeded',
      'team_budget_exceeded', 'credits exhausted', 'payment required',
      'account credits', 'spending budget', 'rate limit', 'too many requests',
      "you've exceeded your exa rate limit", "you've hit exa's free mcp rate limit", 'quota',
    ]
    
    if (error.statusCode && ROTATE_STATUSES.includes(error.statusCode)) return true
    if (error.code === -32000) return true
    
    const msg = (error.message ?? '').toLowerCase()
    const statusMatch = msg.match(/error \((\d{3})\):/i)
    if (statusMatch && ROTATE_STATUSES.includes(+statusMatch[1])) return true
    if (ROTATE_PATTERNS.some(p => msg.includes(p))) return true
    
    const body = typeof error.body === 'string' ? error.body.toLowerCase() : JSON.stringify(error.body ?? '').toLowerCase()
    return ROTATE_PATTERNS.some(p => body.includes(p))
  }

  private isFirecrawlExhausted(error: ExhaustionError): boolean {
    const ROTATE_STATUSES = new Set([429, 402, 401, 500, 502, 503, 504])
    const ROTATE_PATTERNS = [
      'rate limit exceeded', 'concurrency limit reached', 'payment required',
      'insufficient credits', 'unauthorized: invalid token', 'unauthorized: token missing',
      'unauthorized', 'retry after', 'error creating server',
    ]
    const HARD_STATUSES = new Set([400, 404, 408, 409, 413, 422])
    
    const msg = (error.message ?? error.mcpResultText ?? JSON.stringify(error.body ?? '')).toLowerCase()
    if (error.statusCode && HARD_STATUSES.has(error.statusCode)) return false
    if (error.statusCode && ROTATE_STATUSES.has(error.statusCode)) return true
    return ROTATE_PATTERNS.some(p => msg.includes(p))
  }

  private isTavilyExhausted(error: ExhaustionError): boolean {
    const status = error?.statusCode
    if (status !== undefined) {
      if ([429, 432, 433, 401].includes(status)) return true
      return false
    }
    
    // Check MCP content for Tavily's special case (isError: false but content has error)
    let inner: any = null
    try { 
      inner = JSON.parse(error?.mcpResultText ?? '') 
    } catch {}
    
    if (inner) {
      const detail = (inner.detail ?? '').toLowerCase()
      if (detail.includes('authentication required') || detail.includes('excessive requests') ||
          detail.includes('usage limit') || detail.includes('pay-as-you-go')) return true
    }
    
    const combined = (error?.message ?? '') + JSON.stringify(error?.body ?? '')
    return ['authentication required', 'unauthorized', 'excessive requests',
            'usage limit', 'pay-as-you-go', 'search failed'].some(p => combined.toLowerCase().includes(p))
  }

  private isLinkupExhausted(error: ExhaustionError): boolean {
    if (error.statusCode === 401 || error.statusCode === 403) return true
    if (error.code === -32000) {
      const m = (error.message ?? '').toLowerCase()
      if (m.includes('api key is required') || m.includes('bearer scheme')) return true
    }
    if (error.isError === true) {
      const text = (error.mcpResultText ?? '').toLowerCase()
      return ['unauthorized action', 'insufficient', 'too many requests',
              'out of credit', 'credit', 'rate limit'].some(p => text.includes(p))
    }
    return false
  }

  private isBrightDataExhausted(error: ExhaustionError): boolean {
    if (error.statusCode === 401 && !error.body) return false // no auth header = config bug
    if (error.statusCode === 400) return false // missing session = protocol error
    
    const t = error.toolErrorText ?? ''
    if (t.includes('HTTP 401')) return true // covers: Auth method is not supported, Token expired, Unauthorized
    if (t.includes('5,000 request monthly limit') || t.includes('monthly limit for Bright Data MCP')) return true
    if (t.includes('usage limit') || t.includes('Zone has reached usage limit') || t.includes('HTTP 502')) return true
    if ((t.includes('HTTP 429') || t.includes('rate limit') || t.includes('rate limits')) &&
        !t.startsWith('Rate limit exceeded:')) return true
    if (t.includes('HTTP 407') || t.includes('Account is suspended') || t.includes('suspended')) return true
    if (t.includes('KYC Required') || t.includes('HTTP 402')) return true
    if (t.includes('HTTP 400') || t.includes('HTTP 403') || t.includes('Forbidden') ||
        t.includes('Timeout after') || t.includes('No valid session ID')) return false
    return false
  }

  private isOlostepExhausted(error: ExhaustionError): boolean {
    if (error.statusCode && [401, 402, 403].includes(error.statusCode)) return true
    if (error.mcpResultText) {
      const lower = error.mcpResultText.toLowerCase()
      if (/olostep api error: 4[012][12]/.test(lower)) return true
      return ['invalid_api_key', 'invalid api key', 'credits exhausted',
              'payment required', 'unauthorized'].some(p => lower.includes(p))
    }
    return false
  }

  private isDappierExhausted(error: ExhaustionError): boolean {
    const DAPPIER_ROTATE_PATTERNS = [
      /Error:\s*Failed to retrieve/i, /Error:\s*Unable to (retrieve|fetch|access|process)/i,
      /Error:\s*Authentication/i, /Error:\s*Unauthorized/i, /Error:\s*Invalid.*key/i,
      /Error:\s*quota/i, /Error:\s*rate.?limit/i, /Error:\s*credits/i, /Error:\s*billing/i,
      /Missing authentication/i,
    ]
    const DAPPIER_NO_ROTATE_CODES = new Set([-32000, -32001, -32602, -32600, -32601, -32700])
    
    if (error.statusCode === 402 || error.statusCode === 401) return true
    if (error.statusCode === 400 || error.statusCode === 404) return false
    if (error.code !== undefined && DAPPIER_NO_ROTATE_CODES.has(error.code)) return false
    
    const msg = error.message ?? (typeof error.body === 'string' ? error.body : JSON.stringify(error.body ?? ''))
    return DAPPIER_ROTATE_PATTERNS.some(p => p.test(msg))
  }

  private isParallelExhausted(error: ExhaustionError): boolean {
    const status = error.statusCode
    if (status === 401 || status === 402 || status === 429) return true
    
    const body = typeof error.body === 'string' ? error.body : JSON.stringify(error.body ?? '')
    const apigeePatterns = ['oauth.v2.InvalidApiKey', 'steps.oauth.v2.FailedToResolveAPIKey',
      'oauth.v2.ApiKeyExpired', 'oauth.v2.ApiKeyNotApproved', 'Invalid ApiKey', 'FailedToResolveAPIKey']
    if (body.includes('"fault"') && apigeePatterns.some(p => body.includes(p))) return true
    if (body.includes('"code":16') || body.includes('"code": 16')) return true
    
    const msg = (error.message ?? body).toLowerCase()
    return ['invalid api key', 'invalid apikey', 'failed to resolve api key', 'apikey',
            'rate limit', 'too many requests', 'quota exceeded', 'insufficient credit',
            'payment required'].some(p => msg.includes(p))
  }

  private isGenericExhausted(error: ExhaustionError): boolean {
    // 1. Check HTTP status code
    if (error.statusCode && this.patterns.httpStatusCodes.includes(error.statusCode)) {
      return true
    }
    
    // 2. Check JSON-RPC error code
    if (error.code && this.patterns.jsonRpcErrorCodes.includes(error.code)) {
      return true
    }
    
    // 3. Check error message patterns
    if (error.message && this.patterns.messagePatterns.length > 0) {
      const message = error.message.toLowerCase()
      for (const pattern of this.patterns.messagePatterns) {
        if (message.includes(pattern.toLowerCase())) {
          return true
        }
      }
    }
    
    // 4. Check response body (if available)
    if (error.body && this.patterns.messagePatterns.length > 0) {
      const body = typeof error.body === 'string' 
        ? error.body.toLowerCase() 
        : JSON.stringify(error.body).toLowerCase()
      
      for (const pattern of this.patterns.messagePatterns) {
        if (body.includes(pattern.toLowerCase())) {
          return true
        }
      }
    }
    
    return false
  }
}

/**
 * Extract cooldown duration from error (if provider specifies it)
 */
export function extractCooldown(error: ExhaustionError, providerName: string, defaultCooldownMs: number): number {
  const config = (PROVIDER_EXHAUSTION_CONFIG as any)[providerName]
  
  // Check for Retry-After header (in seconds)
  if (config?.hasRetryAfterHeader && error.headers?.['retry-after']) {
    const retryAfter = parseInt(error.headers['retry-after'], 10)
    if (!isNaN(retryAfter)) {
      return retryAfter * 1000 // Convert to ms
    }
  }
  
  // Check for X-RateLimit-Reset header (Unix timestamp for Linkup)
  if (providerName === 'linkup' && error.headers?.['x-ratelimit-reset']) {
    const resetTime = parseInt(error.headers['x-ratelimit-reset'], 10)
    if (!isNaN(resetTime)) {
      const now = Math.floor(Date.now() / 1000)
      const cooldownSeconds = Math.max(0, resetTime - now)
      return cooldownSeconds * 1000 // Convert to ms
    }
  }
  
  // Check for cooldown overrides by HTTP status
  if (error.statusCode && config?.cooldownOverrides?.[error.statusCode]) {
    return config.cooldownOverrides[error.statusCode]
  }
  
  return defaultCooldownMs
}