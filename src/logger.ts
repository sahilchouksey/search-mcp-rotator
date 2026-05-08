import type { LogLevel } from './types.js'

let currentLevel: LogLevel = 'info'
let providerContext: string = ''

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level
}

export function setProvider(name: string): void {
  providerContext = name
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function log(level: LogLevel, message: string, data?: object): void {
  if (!shouldLog(level)) return
  
  // Always write to stderr (not stdout — stdout is the MCP stdio stream!)
  const logEntry = {
    level,
    ts: new Date().toISOString(),
    provider: providerContext || undefined,
    message,
    ...data
  }
  
  process.stderr.write(JSON.stringify(logEntry) + '\n')
}

function debug(message: string, data?: object): void {
  log('debug', message, data)
}

function info(message: string, data?: object): void {
  log('info', message, data)
}

function warn(message: string, data?: object): void {
  log('warn', message, data)
}

function error(message: string, data?: object): void {
  log('error', message, data)
}

export const logger = { debug, info, warn, error }