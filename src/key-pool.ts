import type { ProviderConfig, RotationStrategy, KeyPoolStatus, KeyState, CircuitBreakerState } from './types.js'
import { logger } from './logger.js'

export class KeyPool {
  private keys: string[]
  private keyStates: Map<string, KeyState> = new Map()
  private activeIndex: number = 0
  private strategy: RotationStrategy
  private cooldownMs: number
  private recoveryTimer: NodeJS.Timeout | null = null
  private circuitBreakerThreshold: number = 3
  private circuitBreakerTimeoutMs: number = 60000

  constructor(config: ProviderConfig) {
    this.keys = config.keys
    this.strategy = config.strategy
    this.cooldownMs = config.cooldownMs
    
    // Initialize key states
    for (const key of this.keys) {
      this.keyStates.set(key, {
        key,
        circuitBreakerState: 'CLOSED',
        degradedUntil: 0,
        failureCount: 0,
        lastUsed: 0,
        lastFailure: 0
      })
    }
    
    // Start background recovery timer
    this.startRecoveryTimer()
  }
  
  /**
   * Get next available key based on strategy (with optional override)
   */
  next(strategyOverride?: RotationStrategy): string {
    const strategy = strategyOverride || this.strategy
    const healthyKeys = this.getHealthyKeys()
    
    if (healthyKeys.length === 0) {
      throw new Error('No healthy keys available')
    }
    
    let selectedKey: string
    
    switch (strategy) {
      case 'round-robin':
        selectedKey = healthyKeys[this.activeIndex % healthyKeys.length]
        this.activeIndex++
        break
        
      case 'priority':
        // Always use first healthy key (keys are ordered by priority)
        selectedKey = healthyKeys[0]
        break
        
      case 'random':
        const randomIndex = Math.floor(Math.random() * healthyKeys.length)
        selectedKey = healthyKeys[randomIndex]
        break
        
      default:
        selectedKey = healthyKeys[0]
    }
    
    // Update last used
    const keyState = this.keyStates.get(selectedKey)!
    keyState.lastUsed = Date.now()
    
    return selectedKey
  }
  
  /**
   * Get current active key (without rotating)
   */
  current(): string {
    const healthyKeys = this.getHealthyKeys()
    if (healthyKeys.length === 0) {
      throw new Error('No healthy keys available')
    }
    return healthyKeys[this.activeIndex % healthyKeys.length]
  }
  
  /**
   * Mark a key as degraded with cooldown period
   */
  markDegraded(key: string, cooldownMs?: number): void {
    const keyState = this.keyStates.get(key)
    if (!keyState) return
    
    const cooldown = cooldownMs || this.cooldownMs
    keyState.degradedUntil = Date.now() + cooldown
    keyState.failureCount++
    keyState.lastFailure = Date.now()
    
    // Update circuit breaker state
    this.updateCircuitBreaker(keyState)
    
    logger.warn(`Key degraded: ${this.maskKey(key)}, cooldown: ${cooldown}ms`, {
      failureCount: keyState.failureCount,
      circuitBreakerState: keyState.circuitBreakerState
    })
  }
  
  /**
   * Mark a key as successful (ensure it's not degraded)
   */
  markSuccess(key: string): void {
    const keyState = this.keyStates.get(key)
    if (!keyState) return
    
    const wasDegraded = keyState.degradedUntil > Date.now() || keyState.circuitBreakerState !== 'CLOSED'
    
    // Clear degradation
    keyState.degradedUntil = 0
    keyState.lastUsed = Date.now()
    
    // Handle circuit breaker success
    if (keyState.circuitBreakerState === 'HALF_OPEN') {
      logger.info(`Circuit breaker closing for key: ${this.maskKey(key)}`)
      keyState.circuitBreakerState = 'CLOSED'
    }
    
    keyState.failureCount = 0
    
    if (wasDegraded) {
      logger.info(`Key recovered: ${this.maskKey(key)}`)
    }
  }
  
  /**
   * Manually restore a degraded key
   */
  restore(key: string): void {
    const keyState = this.keyStates.get(key)
    if (!keyState) return
    
    keyState.degradedUntil = 0
    keyState.circuitBreakerState = 'CLOSED'
    keyState.failureCount = 0
    
    logger.info(`Key manually restored: ${this.maskKey(key)}`)
  }
  
  /**
   * Check if all keys are degraded
   */
  allDegraded(): boolean {
    return this.getHealthyKeys().length === 0
  }
  
  /**
   * Get count of healthy (non-degraded) keys
   */
  getHealthyCount(): number {
    return this.getHealthyKeys().length
  }
  
  /**
   * Get all healthy keys (not degraded and circuit breaker allows)
   */
  private getHealthyKeys(): string[] {
    const now = Date.now()
    return this.keys.filter(key => {
      const keyState = this.keyStates.get(key)!
      
      // Check if degraded
      if (keyState.degradedUntil > now) {
        return false
      }
      
      // Check circuit breaker
      return this.canExecute(keyState)
    })
  }
  
  /**
   * Check if circuit breaker allows execution for this key
   */
  private canExecute(keyState: KeyState): boolean {
    switch (keyState.circuitBreakerState) {
      case 'CLOSED':
        return true
        
      case 'OPEN':
        const now = Date.now()
        const lastFailure = keyState.lastFailure || keyState.lastUsed
        if (now - lastFailure >= this.circuitBreakerTimeoutMs) {
          logger.info(`Circuit breaker transitioning to HALF_OPEN for key: ${this.maskKey(keyState.key)}`)
          keyState.circuitBreakerState = 'HALF_OPEN'
          return true
        }
        return false
        
      case 'HALF_OPEN':
        return true
        
      default:
        return false
    }
  }
  
  /**
   * Update circuit breaker state after failure
   */
  private updateCircuitBreaker(keyState: KeyState): void {
    if (keyState.circuitBreakerState === 'HALF_OPEN') {
      logger.warn(`Circuit breaker reopening for key: ${this.maskKey(keyState.key)}`)
      keyState.circuitBreakerState = 'OPEN'
    } else if (
      keyState.circuitBreakerState === 'CLOSED' &&
      keyState.failureCount >= this.circuitBreakerThreshold
    ) {
      logger.warn(`Circuit breaker opening for key: ${this.maskKey(keyState.key)} after ${keyState.failureCount} failures`)
      keyState.circuitBreakerState = 'OPEN'
    }
  }
  
  /**
   * Background timer to check for expired degraded keys
   */
  private startRecoveryTimer(): void {
    this.recoveryTimer = setInterval(() => {
      const now = Date.now()
      const recovered: string[] = []
      
      for (const [key, keyState] of this.keyStates.entries()) {
        if (keyState.degradedUntil > 0 && keyState.degradedUntil <= now) {
          keyState.degradedUntil = 0
          recovered.push(this.maskKey(key))
        }
      }
      
      if (recovered.length > 0) {
        logger.info(`Keys auto-recovered: ${recovered.join(', ')}`)
      }
    }, 10000) // Check every 10 seconds
  }
  
  /**
   * Stop the recovery timer (cleanup)
   */
  stop(): void {
    if (this.recoveryTimer) {
      clearInterval(this.recoveryTimer)
      this.recoveryTimer = null
    }
  }
  
  /**
   * Mask key for logging (show first 8 chars only)
   */
  private maskKey(key: string): string {
    return key.length > 8 ? `${key.substring(0, 8)}...` : key
  }
  
  /**
   * Get pool status for debugging
   */
  getStatus(): KeyPoolStatus {
    const healthyKeys = this.getHealthyKeys()
    return {
      totalKeys: this.keys.length,
      healthyKeys: healthyKeys.length,
      degradedKeys: this.keys.length - healthyKeys.length,
      strategy: this.strategy,
      activeIndex: this.activeIndex
    }
  }
}