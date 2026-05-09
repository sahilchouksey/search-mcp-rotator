#!/usr/bin/env node

import { loadConfig } from './config.js'
import { KeyPool } from './key-pool.js'
import { ExhaustionDetector } from './detector.js'
import { AuthInjector } from './auth-injector.js'
import { MCPProxy } from './proxy.js'
import { MultiProxy } from './multi-proxy.js'
import { logger, setLogLevel, setProvider } from './logger.js'
import * as os from 'os'
import * as path from 'path'

const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.config', 'search-mcp-rotator', 'config.json')

function parseArgs(argv: string[]): { provider?: string; config?: string; setup?: boolean; warmup?: boolean } {
  const args: { provider?: string; config?: string; setup?: boolean; warmup?: boolean } = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--setup')                              args.setup = true
    else if (arg === '--warmup')                        args.warmup = true
    else if (arg.startsWith('--provider='))             args.provider = arg.split('=')[1]
    else if (arg.startsWith('--config='))               args.config = arg.split('=')[1]
    else if (arg === '--provider' && i + 1 < argv.length) args.provider = argv[++i]
    else if (arg === '--config'   && i + 1 < argv.length) args.config   = argv[++i]
  }
  return args
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv)
    const configPath = args.config || process.env.MCP_ROTATOR_CONFIG || DEFAULT_CONFIG_PATH

    // ── Setup ──────────────────────────────────────────────────────────────
    if (args.setup) {
      const { runSetup } = await import('./setup.js')
      await runSetup(args.config)
      // Auto-warmup cache after setup so first MCP start is instant
      try {
        const config = await loadConfig(configPath)
        process.stdout.write('\nWarming tools cache for faster MCP startup...\n')
        const { warmupCache } = await import('./proxy.js')
        await warmupCache(config.providers)
        process.stdout.write('Cache ready.\n')
      } catch {}
      return
    }

    // ── Warmup ─────────────────────────────────────────────────────────────
    if (args.warmup) {
      const config = await loadConfig(configPath)
      process.stdout.write('Warming tools cache...\n')
      const { warmupCache } = await import('./proxy.js')
      await warmupCache(config.providers)
      process.stdout.write('Done.\n')
      return
    }

    const config = await loadConfig(configPath)
    setLogLevel(config.logLevel)

    // ── Single-provider mode (--provider=X) ────────────────────────────────
    if (args.provider) {
      const providerName = args.provider
      setProvider(providerName)
      const providerConfig = config.providers[providerName]
      if (!providerConfig || !providerConfig.enabled) {
        throw new Error(`Provider ${providerName} not found or disabled in config`)
      }
      const keyPool = new KeyPool(providerConfig)
      const detector = new ExhaustionDetector(providerName, providerConfig.exhaustionPatterns)
      const authInjector = new AuthInjector(providerConfig)
      const proxy = new MCPProxy(providerName, providerConfig, keyPool, detector, authInjector)
      await proxy.start()
      const cleanup = () => { keyPool.stop(); process.exit(0) }
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
      return
    }

    // ── Multi-provider mode (default) ──────────────────────────────────────
    const proxy = new MultiProxy(config.providers)
    await proxy.start()
    process.on('SIGINT',  () => process.exit(0))
    process.on('SIGTERM', () => process.exit(0))

  } catch (error) {
    logger.error('Failed to start', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    })
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})