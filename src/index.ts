#!/usr/bin/env node

import { loadConfig } from './config.js'
import { KeyPool } from './key-pool.js'
import { ExhaustionDetector } from './detector.js'
import { AuthInjector } from './auth-injector.js'
import { MCPProxy } from './proxy.js'
import { logger, setLogLevel, setProvider } from './logger.js'
import { runSetup } from './setup.js'

function parseArgs(argv: string[]): { provider?: string; config?: string; setup?: boolean } {
  const args: { provider?: string; config?: string; setup?: boolean } = {}
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--setup') {
      args.setup = true
    } else if (arg.startsWith('--provider=')) {
      args.provider = arg.split('=')[1]
    } else if (arg.startsWith('--config=')) {
      args.config = arg.split('=')[1]
    } else if (arg === '--provider' && i + 1 < argv.length) {
      args.provider = argv[++i]
    } else if (arg === '--config' && i + 1 < argv.length) {
      args.config = argv[++i]
    }
  }
  
  return args
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv)

    if (args.setup) {
      await runSetup(args.config)
      return
    }

    const providerName = args.provider
    
    if (!providerName) {
      throw new Error('--provider argument required. Usage: search-mcp-rotator --provider=<name>')
    }
    
    const configPath = args.config || process.env.MCP_ROTATOR_CONFIG || './config.json'
    const config = await loadConfig(configPath)
    
    // Set up logging
    setLogLevel(config.logLevel)
    setProvider(providerName)
    
    const providerConfig = config.providers[providerName]
    
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Provider ${providerName} not found or disabled in config`)
    }
    
    logger.info(`Starting Search MCP Rotator for ${providerName}`, {
      url: providerConfig.url,
      authPattern: providerConfig.authPattern,
      keyCount: providerConfig.keys.length,
      strategy: providerConfig.strategy,
      cooldownMs: providerConfig.cooldownMs
    })
    
    // Initialize components
    const keyPool = new KeyPool(providerConfig)
    const detector = new ExhaustionDetector(providerName, providerConfig.exhaustionPatterns)
    const authInjector = new AuthInjector(providerConfig)
    
    // Create and start proxy
    const proxy = new MCPProxy(providerName, providerConfig, keyPool, detector, authInjector)
    await proxy.start()
    
    // Handle graceful shutdown
    const cleanup = () => {
      logger.info(`Shutting down Search MCP Rotator for ${providerName}`)
      keyPool.stop()
      process.exit(0)
    }
    
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    
  } catch (error) {
    logger.error('Failed to start Search MCP Rotator', {
      error: (error as Error).message,
      stack: (error as Error).stack
    })
    process.exit(1)
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}