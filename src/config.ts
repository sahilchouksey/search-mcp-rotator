import { readFile } from 'fs/promises'
import { z } from 'zod'
import type { Config, ProviderConfig, AuthPattern, RotationStrategy, LogLevel } from './types.js'

const AuthPatternSchema = z.enum(['bearer', 'queryparam', 'customheader'])
const RotationStrategySchema = z.enum(['round-robin', 'priority', 'random'])
const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error'])

// JSON object keys are always strings — coerce them to numbers at runtime
const CooldownOverridesSchema = z.record(z.string(), z.number()).transform(
  (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [Number(k), v]))
) as z.ZodType<Record<number, number>>

const ExhaustionPatternSchema = z.object({
  httpStatusCodes: z.array(z.number()).default([]),
  jsonRpcErrorCodes: z.array(z.number()).default([]),
  messagePatterns: z.array(z.string()).default([]),
  cooldownOverrides: CooldownOverridesSchema.default({}),
  hasRetryAfterHeader: z.boolean().default(false)
})

const ProviderConfigSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().url(),
  authPattern: AuthPatternSchema,
  
  // Auth pattern specific fields
  headerName: z.string().optional(),      // For 'customheader'
  queryParamName: z.string().optional(),  // For 'queryparam'
  
  keys: z.array(z.string()).min(1),
  strategy: RotationStrategySchema.default('round-robin'),
  cooldownMs: z.number().default(60000),
  
  exhaustionPatterns: ExhaustionPatternSchema.optional()
})

const ConfigSchema = z.object({
  logLevel: LogLevelSchema.default('info'),
  providers: z.record(ProviderConfigSchema)
})

export async function loadConfig(filePath: string): Promise<Config> {
  // 1. Read config file
  const fileContent = await readFile(filePath, 'utf-8')
  const rawConfig = JSON.parse(fileContent)
  
  // 2. Merge with env vars (keys can be overridden via env)
  const mergedConfig = mergeWithEnv(rawConfig)
  
  // 3. Validate with Zod
  const config = ConfigSchema.parse(mergedConfig)
  
  return config
}

function mergeWithEnv(config: any): any {
  // Allow keys to be overridden via env vars like:
  // EXA_KEYS="key1,key2,key3"
  // FIRECRAWL_KEYS="key1,key2"
  
  for (const providerName in config.providers) {
    const envVarName = `${providerName.toUpperCase()}_KEYS`
    const envValue = process.env[envVarName]
    
    if (envValue) {
      config.providers[providerName].keys = envValue.split(',').map((k: string) => k.trim())
    }
  }
  
  return config
}

export type { Config, ProviderConfig, AuthPattern, RotationStrategy, LogLevel }