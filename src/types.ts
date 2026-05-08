export type RotationStrategy = 'round-robin' | 'priority' | 'random'
export type AuthPattern = 'bearer' | 'queryparam' | 'customheader'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CooldownOverrides {
  [statusCode: number]: number  // status → ms
}

export interface ExhaustionPatternConfig {
  httpStatusCodes: number[]
  jsonRpcErrorCodes: number[]
  messagePatterns: string[]
  cooldownOverrides: CooldownOverrides
  hasRetryAfterHeader: boolean
}

export interface ProviderConfig {
  enabled: boolean
  url: string
  authPattern: AuthPattern
  headerName?: string        // for 'customheader'
  queryParamName?: string    // for 'queryparam'
  keys: string[]
  strategy: RotationStrategy
  cooldownMs: number
  exhaustionPatterns?: Partial<ExhaustionPatternConfig>
}

export interface Config {
  logLevel: LogLevel
  providers: Record<string, ProviderConfig>
}

export interface KeyPoolStatus {
  totalKeys: number
  healthyKeys: number
  degradedKeys: number
  strategy: RotationStrategy
  activeIndex: number
}

export interface AuthInjectionResult {
  url: string
  headers: Record<string, string>
}

export interface ExhaustionError {
  statusCode?: number
  code?: number              // JSON-RPC error code
  message?: string
  body?: string | object
  headers?: Record<string, string>
  isError?: boolean          // MCP result.isError flag
  mcpResultText?: string     // result.content[0].text
  toolErrorText?: string     // same as mcpResultText (Bright Data alias)
}

export interface KeyState {
  key: string
  circuitBreakerState: CircuitBreakerState
  degradedUntil: number      // timestamp ms
  failureCount: number
  lastUsed: number          // timestamp ms
  lastFailure: number       // timestamp ms
}