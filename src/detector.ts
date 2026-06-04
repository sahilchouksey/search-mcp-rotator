import type { ExhaustionError, ExhaustionPatternConfig } from "./types.js";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const YEAR_MS = 365 * DAY_MS;

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function getTextSources(error: ExhaustionError): string[] {
  return [
    error.message,
    error.mcpResultText,
    error.toolErrorText,
    stringifyValue(error.body),
  ].filter((text): text is string => Boolean(text));
}

function getCombinedText(error: ExhaustionError): string {
  return getTextSources(error).join(" ");
}

function getLowerText(error: ExhaustionError): string {
  return getCombinedText(error).toLowerCase();
}

function parseStatusCodeFromText(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(?:status code|http|error)\s*(?:\(|:)?\s*(\d{3})/i);
  return match ? Number(match[1]) : undefined;
}

function getStatusCode(error: ExhaustionError): number | undefined {
  return error.statusCode ?? parseStatusCodeFromText(getCombinedText(error));
}

function includesAny(text: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function getHeader(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;

  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return String(value);
  }
  return undefined;
}

function parseRetryAfterText(text: string): number | undefined {
  const match = text.match(
    /retry after\s+(\d+)\s*(ms|milliseconds?|s|sec|secs|seconds?|m|mins|minutes?)?/i,
  );
  if (!match) return undefined;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return undefined;

  const unit = (match[2] ?? "s").toLowerCase();
  if (unit.startsWith("ms") || unit.startsWith("millisecond")) return value;
  if (unit.startsWith("m") && !unit.startsWith("ms")) return value * MINUTE_MS;
  return value * 1000;
}

// Provider-specific exhaustion patterns from PROVIDERS.md
export const PROVIDER_EXHAUSTION_CONFIG = {
  exa: {
    httpStatusCodes: [401, 402, 429],
    jsonRpcErrorCodes: [-32000],
    messagePatterns: [
      "invalid api key",
      "no_more_credits",
      "api_key_budget_exceeded",
      "team_budget_exceeded",
      "x402_payment_required",
      "credits exhausted",
      "payment required",
      "account credits",
      "spending budget",
      "rate limit",
      "too many requests",
      "you've exceeded your exa rate limit",
      "you've hit exa's free mcp rate limit",
      "quota",
    ],
    cooldownOverrides: { 402: HOUR_MS, 401: YEAR_MS },
    hasRetryAfterHeader: true,
  },

  firecrawl: {
    httpStatusCodes: [401, 402, 429, 500, 502, 503, 504],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "rate limit exceeded",
      "request rate limit exceeded",
      "concurrency limit reached",
      "payment required",
      "insufficient credits",
      "payment required to access",
      "unauthorized: invalid token",
      "unauthorized: token missing",
      "unauthorized",
      "retry after",
      "error creating server",
    ],
    cooldownOverrides: { 402: DAY_MS, 401: 7 * DAY_MS },
    hasRetryAfterHeader: true,
  },

  tavily: {
    httpStatusCodes: [401, 429, 432, 433],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "authentication required",
      "unauthorized",
      "invalid api key",
      "missing or invalid",
      "excessive requests",
      "rate of requests",
      "usage limit",
      "pay-as-you-go",
      "paygo limit",
    ],
    cooldownOverrides: { 432: DAY_MS, 433: HOUR_MS, 401: YEAR_MS },
    hasRetryAfterHeader: true,
  },

  linkup: {
    httpStatusCodes: [401, 403, 429],
    jsonRpcErrorCodes: [-32000],
    messagePatterns: [
      "unauthorized action",
      "api key is required",
      "insufficient_funds_credits",
      "too_many_requests",
      "too many requests",
      "out of credit",
      "insufficient funds",
      "rate limit",
    ],
    cooldownOverrides: {},
    hasRetryAfterHeader: false,
  },

  brightdata: {
    httpStatusCodes: [401, 402, 407, 429],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "auth method is not supported",
      "token expired",
      "5,000 request monthly limit",
      "monthly limit for bright data mcp",
      "usage limit",
      "zone has reached usage limit",
      "client_10100",
      "client_10110",
      "policy_20130",
      "policy_20140",
      "policy_20220",
      "policy_20221",
      "policy_20222",
      "account is suspended",
      "kyc required",
    ],
    cooldownOverrides: {},
    hasRetryAfterHeader: false,
  },

  olostep: {
    httpStatusCodes: [401, 402, 403],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "invalid_api_key",
      "invalid api key",
      "your api key is invalid",
      "credits exhausted",
      "payment required",
      "olostep api error: 401",
      "olostep api error: 402",
      "olostep api error: 403",
      "access denied",
      "feature approval required",
      "feature not enabled",
    ],
    cooldownOverrides: {},
    hasRetryAfterHeader: false,
  },

  dappier: {
    httpStatusCodes: [401, 402],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "error: failed to retrieve real-time information",
      "error: failed to retrieve",
      "error: unable to retrieve",
      "error: authentication",
      "error: unauthorized",
      "error: invalid",
      "quota",
      "rate limit",
      "credits",
      "billing",
      "missing authentication",
    ],
    cooldownOverrides: {},
    hasRetryAfterHeader: false,
  },

  parallel: {
    httpStatusCodes: [401, 402, 429],
    jsonRpcErrorCodes: [],
    messagePatterns: [
      "oauth.v2.invalidapikey",
      "steps.oauth.v2.failedtoresolveapikey",
      "oauth.v2.invalidapikeyforgivenresource",
      "oauth.v2.apikeyexpired",
      "oauth.v2.apikeynotapproved",
      "invalid apikey",
      "failedtoresolveapikey",
      "failed to resolve api key",
      "invalid api key",
      "invalid api key (c.1)",
      "rate limit exceeded",
      "too many requests",
      "insufficient credit",
      "insufficient credits",
      "payment required",
      "account balance depleted",
      "quota exceeded",
      'code":16',
      'code": 16',
    ],
    cooldownOverrides: {},
    hasRetryAfterHeader: false,
  },
} as const;

export class ExhaustionDetector {
  private patterns: ExhaustionPatternConfig;
  private providerName: string;

  constructor(
    providerName: string,
    customPatterns?: Partial<ExhaustionPatternConfig>,
  ) {
    this.providerName = providerName;

    const defaultPatterns = (PROVIDER_EXHAUSTION_CONFIG as any)[
      providerName
    ] || {
      httpStatusCodes: [429, 402, 403, 401],
      jsonRpcErrorCodes: [],
      messagePatterns: [
        "rate limit",
        "quota",
        "credits",
        "exhausted",
        "too many requests",
        "billing",
      ],
      cooldownOverrides: {},
      hasRetryAfterHeader: false,
    };

    this.patterns = {
      httpStatusCodes:
        customPatterns?.httpStatusCodes || defaultPatterns.httpStatusCodes,
      jsonRpcErrorCodes:
        customPatterns?.jsonRpcErrorCodes || defaultPatterns.jsonRpcErrorCodes,
      messagePatterns:
        customPatterns?.messagePatterns || defaultPatterns.messagePatterns,
      cooldownOverrides: {
        ...defaultPatterns.cooldownOverrides,
        ...customPatterns?.cooldownOverrides,
      },
      hasRetryAfterHeader:
        customPatterns?.hasRetryAfterHeader ??
        defaultPatterns.hasRetryAfterHeader,
    };
  }

  isExhausted(error: ExhaustionError): boolean {
    switch (this.providerName) {
      case "exa":
        return this.isExaExhausted(error);
      case "firecrawl":
        return this.isFirecrawlExhausted(error);
      case "tavily":
        return this.isTavilyExhausted(error);
      case "linkup":
        return this.isLinkupExhausted(error);
      case "brightdata":
        return this.isBrightDataExhausted(error);
      case "olostep":
        return this.isOlostepExhausted(error);
      case "dappier":
        return this.isDappierExhausted(error);
      case "parallel":
        return this.isParallelExhausted(error);
      default:
        return this.isGenericExhausted(error);
    }
  }

  private isExaExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (status && [400, 403, 404, 422, 500, 502, 503, 504].includes(status)) {
      return false;
    }
    if (status && [401, 402, 429].includes(status)) return true;

    if (
      error.code === -32000 &&
      text.includes("exa") &&
      text.includes("rate limit")
    ) {
      return true;
    }

    return includesAny(text, [
      "invalid api key",
      "no_more_credits",
      "api_key_budget_exceeded",
      "team_budget_exceeded",
      "x402_payment_required",
      "account credits exhausted",
      "payment required",
      "spending budget",
      "you've exceeded your exa rate limit",
      "you've hit exa's free mcp rate limit",
      "rate limit",
      "quota",
    ]);
  }

  private isFirecrawlExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (status && [400, 404, 408, 409, 413, 422].includes(status)) return false;
    if (
      includesAny(text, [
        "scrape_all_engines_failed",
        "scrape_ssl_error",
        "scrape_site_error",
        "scrape_dns_resolution_error",
        "scrape_action_error",
        "scrape_pdf_",
        "scrape_zdr_violation_error",
        "scrape_unsupported_file_error",
        "scrape_lockdown_cache_miss",
      ])
    ) {
      return false;
    }

    if (status && [401, 402, 429, 500, 502, 503, 504].includes(status)) {
      return true;
    }

    return includesAny(text, [
      "rate limit exceeded",
      "request rate limit exceeded",
      "concurrency limit reached",
      "payment required",
      "insufficient credits",
      "unauthorized: invalid token",
      "unauthorized: token missing",
      "error creating server",
    ]);
  }

  private isTavilyExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (status === 402) return false;
    if (
      status &&
      [400, 404, 408, 409, 422, 500, 502, 503, 504].includes(status)
    ) {
      return false;
    }
    if (status === 401) {
      if (
        includesAny(text, [
          "invalid_token",
          "bearer token is invalid",
          "authentication failed. the provided bearer token",
        ])
      ) {
        return false;
      }
      return true;
    }
    if (status && [429, 432, 433].includes(status)) return true;

    const hasSearchFailed = text.includes("search failed");
    const hasRotateDetail = includesAny(text, [
      "authentication required",
      "missing or invalid api key",
      "excessive requests",
      "rate of requests",
      "usage limit",
      "pay-as-you-go",
      "paygo limit",
      "paygo",
    ]);

    return hasRotateDetail || (hasSearchFailed && hasRotateDetail);
  }

  private isLinkupExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (status === 402) return false;
    if (status && [400, 409, 500].includes(status)) return false;
    if (status === 401 || status === 403) return true;

    if (
      error.code === -32000 &&
      includesAny(text, ["api key is required", "bearer scheme"])
    ) {
      return true;
    }

    if (status === 429) return true;

    return includesAny(text, [
      "unauthorized action",
      "insufficient_funds_credits",
      "too_many_requests",
      "too many requests",
      "out of credit",
      "insufficient funds",
      "rate limit",
    ]);
  }

  private isBrightDataExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (
      error.statusCode === 401 &&
      !error.body &&
      !error.mcpResultText &&
      !error.toolErrorText
    ) {
      return false;
    }
    if (status === 400 || status === 403) return false;
    if (
      includesAny(text, [
        "no valid session id",
        "no active session",
        "http 400",
        "http 403",
        "forbidden host",
        "forbidden: target blocked",
        "no protocol",
        "timeout after",
        "no snapshot id",
      ]) ||
      /(?:^|execution failed:\s*)rate limit exceeded:\s*\d+/i.test(text)
    ) {
      return false;
    }

    if (status === 502) {
      return includesAny(text, [
        "usage limit",
        "zone has reached usage limit",
        "client_10100",
      ]);
    }
    if (status && [401, 402, 407, 429].includes(status)) return true;

    return includesAny(text, [
      "auth method is not supported",
      "5,000 request monthly limit",
      "monthly limit for bright data mcp",
      "zone has reached usage limit",
      "client_10100",
      "client_10110",
      "policy_20130",
      "policy_20140",
      "policy_20220",
      "policy_20221",
      "policy_20222",
      "account is suspended",
      "kyc required",
      "suspended",
    ]);
  }

  private isOlostepExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (text.includes("missing authorization: bearer <olostep_api_key>")) {
      return false;
    }
    if (status && [400, 404, 409, 422, 500, 502, 504].includes(status))
      return false;
    if (status && [401, 402, 403].includes(status)) return true;
    if (/olostep api error:\s*(401|402|403)\b/i.test(text)) return true;

    return includesAny(text, [
      "invalid_api_key",
      '"invalid_api_key":true',
      "your api key is invalid",
      "credits exhausted",
      "payment required",
      "access denied",
      "feature approval required",
      "feature not enabled",
    ]);
  }

  private isDappierExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getCombinedText(error);
    const lower = text.toLowerCase();
    const noRotateCodes = new Set([
      -32000, -32001, -32602, -32600, -32601, -32700,
    ]);

    if (status === 400 || status === 404) return false;
    if (error.code !== undefined && noRotateCodes.has(error.code)) return false;
    if (status === 401 || status === 402) return true;

    const startsWithError = getTextSources(error).some((source) =>
      /^error:/i.test(source.trim()),
    );
    if (startsWithError) return true;

    return (
      matchesAny(text, [
        /Error:\s*Failed to retrieve/i,
        /Error:\s*Unable to (retrieve|fetch|access|process)/i,
        /Error:\s*Authentication/i,
        /Error:\s*Unauthorized/i,
        /Error:\s*Invalid.*key/i,
        /Error:\s*quota/i,
        /Error:\s*rate.?limit/i,
        /Error:\s*credits/i,
        /Error:\s*billing/i,
        /Missing authentication/i,
      ]) || includesAny(lower, ["quota", "rate limit", "credits", "billing"])
    );
  }

  private isParallelExhausted(error: ExhaustionError): boolean {
    const status = getStatusCode(error);
    const text = getLowerText(error);

    if (
      status &&
      [400, 403, 404, 408, 422, 500, 502, 503, 504].includes(status)
    ) {
      return false;
    }
    if (status && [401, 402, 429].includes(status)) return true;

    const apigeePatterns = [
      "oauth.v2.invalidapikey",
      "steps.oauth.v2.failedtoresolveapikey",
      "oauth.v2.invalidapikeyforgivenresource",
      "oauth.v2.apikeyexpired",
      "oauth.v2.apikeynotapproved",
      "invalid apikey",
      "failedtoresolveapikey",
    ];

    if (text.includes('"fault"') && includesAny(text, apigeePatterns))
      return true;
    if (text.includes('"code":16') || text.includes('"code": 16')) return true;

    return includesAny(text, [
      "invalid api key",
      "invalid apikey",
      "failed to resolve api key",
      "invalid api key (c.1)",
      "rate limit exceeded",
      "too many requests",
      "quota exceeded",
      "insufficient credit",
      "insufficient credits",
      "payment required",
      "account balance depleted",
    ]);
  }

  private isGenericExhausted(error: ExhaustionError): boolean {
    const statusCode = getStatusCode(error);
    if (statusCode && this.patterns.httpStatusCodes.includes(statusCode)) {
      return true;
    }

    if (error.code && this.patterns.jsonRpcErrorCodes.includes(error.code)) {
      return true;
    }

    const text = getLowerText(error);
    return this.patterns.messagePatterns.some((pattern) =>
      text.includes(pattern.toLowerCase()),
    );
  }
}

export function extractCooldown(
  error: ExhaustionError,
  providerName: string,
  defaultCooldownMs: number,
): number {
  const config = (PROVIDER_EXHAUSTION_CONFIG as any)[providerName];
  const retryAfter = getHeader(error.headers, "retry-after");
  if (config?.hasRetryAfterHeader && retryAfter) {
    const retryAfterSeconds = parseInt(retryAfter, 10);
    if (!isNaN(retryAfterSeconds)) return retryAfterSeconds * 1000;
  }

  const text = getLowerText(error);
  const statusCode = getStatusCode(error);

  if (providerName === "exa") {
    const resetHeader = getHeader(error.headers, "x-ratelimit-reset");
    if (resetHeader) {
      const resetMs = parseInt(resetHeader, 10);
      if (!isNaN(resetMs)) return Math.max(0, resetMs - Date.now());
    }
  }

  if (providerName === "firecrawl") {
    const embeddedRetry = parseRetryAfterText(text);
    if (embeddedRetry !== undefined) return embeddedRetry;
  }

  if (providerName === "linkup") {
    const resetHeader = getHeader(error.headers, "x-ratelimit-reset");
    if (resetHeader) {
      const resetSeconds = parseInt(resetHeader, 10);
      if (!isNaN(resetSeconds)) return resetSeconds * 1000;
    }
  }

  if (providerName === "brightdata") {
    if (
      includesAny(text, [
        "5,000 request monthly limit",
        "monthly limit for bright data mcp",
      ])
    ) {
      return DAY_MS;
    }
    if (includesAny(text, ["zone has reached usage limit", "client_10100"]))
      return HOUR_MS;
    if (
      statusCode === 429 ||
      includesAny(text, [
        "client_10110",
        "policy_20220",
        "policy_20221",
        "policy_20222",
      ])
    ) {
      return MINUTE_MS;
    }
    if (
      statusCode === 401 ||
      includesAny(text, ["auth method is not supported", "kyc required"])
    ) {
      return YEAR_MS;
    }
    if (includesAny(text, ["account is suspended", "suspended"]))
      return 30 * MINUTE_MS;
    if (statusCode === 402 || statusCode === 407) return DAY_MS;
  }

  if (providerName === "olostep") {
    if (statusCode === 401) return YEAR_MS;
    if (statusCode === 402) return DAY_MS;
    if (statusCode === 403) return HOUR_MS;
  }

  if (providerName === "dappier") {
    if (statusCode === 401) return YEAR_MS;
    if (includesAny(text, ["credits", "billing", "quota"])) return HOUR_MS;
  }

  if (statusCode && config?.cooldownOverrides?.[statusCode]) {
    return config.cooldownOverrides[statusCode];
  }

  return defaultCooldownMs;
}
