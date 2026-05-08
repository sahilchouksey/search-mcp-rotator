import React, { useState, useCallback } from 'react'
import { render, Box, Text, useInput, useApp } from 'ink'
import TextInput from 'ink-text-input'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { exec } from 'child_process'

// ─── Universal config path ────────────────────────────────────────────────────
export const DEFAULT_CONFIG_DIR = path.join(os.homedir(), '.config', 'search-mcp-rotator')
export const DEFAULT_CONFIG_PATH = path.join(DEFAULT_CONFIG_DIR, 'config.json')

// ─── Providers ────────────────────────────────────────────────────────────────
const PROVIDERS = [
  { id: 'exa',        name: 'Exa',        description: 'Neural/semantic web search, code search',           url: 'https://mcp.exa.ai/mcp',          authPattern: 'bearer',      cooldownMs: 60000,  keyHint: 'exa.ai → Dashboard → API Keys',                          keyUrl: 'https://exa.ai' },
  { id: 'firecrawl',  name: 'Firecrawl',  description: 'Web scraping, deep crawl, structured extraction',   url: 'https://mcp.firecrawl.dev/mcp',   authPattern: 'bearer',      cooldownMs: 60000,  keyHint: 'firecrawl.dev → Dashboard (prefix: fc-)',                keyUrl: 'https://firecrawl.dev' },
  { id: 'tavily',     name: 'Tavily',     description: 'Real-time web search, extract, map, crawl',         url: 'https://mcp.tavily.com/mcp/',     authPattern: 'queryparam',  cooldownMs: 60000,  keyHint: 'app.tavily.com → API Keys (prefix: tvly-)',               keyUrl: 'https://tavily.com',    queryParamName: 'tavilyApiKey' },
  { id: 'linkup',     name: 'Linkup',     description: 'Real-time web search, source-cited answers',        url: 'https://mcp.linkup.so/mcp',       authPattern: 'bearer',      cooldownMs: 60000,  keyHint: 'app.linkup.so → API Keys',                               keyUrl: 'https://linkup.so' },
  { id: 'brightdata', name: 'Bright Data',description: 'Google SERP + 40 scraping tools (5k free/mo)',      url: 'https://mcp.brightdata.com/mcp',  authPattern: 'bearer',      cooldownMs: 60000,  keyHint: 'brightdata.com → Settings → API Token',                  keyUrl: 'https://brightdata.com' },
  { id: 'olostep',    name: 'Olostep',    description: 'Search + extract + AI answers with citations',       url: 'https://mcp.olostep.com/mcp',     authPattern: 'bearer',      cooldownMs: 300000, keyHint: 'olostep.com → Dashboard → API Keys',                     keyUrl: 'https://olostep.com' },
  { id: 'dappier',    name: 'Dappier',    description: 'Real-time news, finance, sports, weather',          url: 'https://mcp.dappier.com/mcp',     authPattern: 'queryparam',  cooldownMs: 300000, keyHint: 'dappier.com → Dashboard → API Keys',                     keyUrl: 'https://dappier.com',   queryParamName: 'apiKey' },
  { id: 'parallel',   name: 'Parallel',   description: 'Highest-accuracy general web search',               url: 'https://search.parallel.ai/mcp',  authPattern: 'customheader',cooldownMs: 60000,  keyHint: 'platform.parallel.ai → API Keys',                        keyUrl: 'https://parallel.ai',   headerName: 'x-api-key' },
] as const

type ProviderId = typeof PROVIDERS[number]['id']
type Provider   = typeof PROVIDERS[number]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function openUrl(url: string) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  exec(`${cmd} "${url}"`, () => {})
}

function buildEntry(p: Provider, keys: string[]): Record<string, unknown> {
  const e: Record<string, unknown> = { enabled: true, url: p.url, authPattern: p.authPattern, keys: [...keys], strategy: 'round-robin', cooldownMs: p.cooldownMs }
  if (p.authPattern === 'queryparam')   (e as any).queryParamName = (p as any).queryParamName
  if (p.authPattern === 'customheader') (e as any).headerName     = (p as any).headerName
  return e
}

function syncConfig(configPath: string, configs: Record<string, unknown>) {
  if (!Object.keys(configs).length) return
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify({ logLevel: 'info', providers: configs }, null, 2))
}

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider: React.FC = () => (
  <Box marginY={0}><Text dimColor>{'─'.repeat(60)}</Text></Box>
)

// ─── Screen: Provider Checklist ───────────────────────────────────────────────
const ProviderSelect: React.FC<{
  onConfirm: (ids: ProviderId[]) => void
}> = ({ onConfirm }) => {
  const [cursor, setCursor]   = useState(0)
  const [selected, setSelected] = useState<Set<ProviderId>>(new Set())

  useInput((input, key) => {
    if (key.upArrow)   setCursor(c => Math.max(0, c - 1))
    if (key.downArrow) setCursor(c => Math.min(PROVIDERS.length - 1, c + 1))

    if (input === ' ') {
      setSelected(s => {
        const next = new Set(s)
        const id = PROVIDERS[cursor].id
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }

    if (input === 'a') setSelected(new Set(PROVIDERS.map(p => p.id)))
    if (input === 'i') setSelected(s => new Set(PROVIDERS.map(p => p.id).filter(id => !s.has(id))))

    if (key.return) {
      if (selected.size > 0) onConfirm(PROVIDERS.map(p => p.id).filter(id => selected.has(id)) as ProviderId[])
    }
  })

  return (
    <Box flexDirection="column" gap={0}>
      <Divider />
      <Box marginBottom={1} />
      {PROVIDERS.map((p, i) => (
        <Box key={p.id}>
          <Text color="cyan">{i === cursor ? '›' : ' '} </Text>
          <Text color={selected.has(p.id) ? 'green' : 'white'} bold={selected.has(p.id)}>
            {selected.has(p.id) ? '[x] ' : '[ ] '}
          </Text>
          <Text bold={i === cursor}>{p.name.padEnd(14)}</Text>
          <Text dimColor>{p.description}</Text>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>↑↓ navigate  Space select  a all  i invert  Enter confirm</Text>
      </Box>
    </Box>
  )
}

// ─── Screen: Selected summary ─────────────────────────────────────────────────
const SelectedSummary: React.FC<{ ids: ProviderId[] }> = ({ ids }) => (
  <Box flexDirection="column">
    <Divider />
    <Box marginBottom={1} />
    <Text bold>  Selected providers:</Text>
    <Box marginBottom={1} />
    {ids.map(id => {
      const p = PROVIDERS.find(x => x.id === id)!
      return (
        <Box key={id}>
          <Text color="green">  [x] </Text>
          <Text bold>{p.name.padEnd(14)}</Text>
          <Text dimColor>{p.description}</Text>
        </Box>
      )
    })}
    <Box marginBottom={1} />
  </Box>
)

// ─── Screen: Key Entry (one provider at a time) ───────────────────────────────
const KeyEntryView: React.FC<{
  provider: Provider
  providerIndex: number
  totalProviders: number
  existingKeys: string[]
  prevProvider: Provider | null
  inputMode: string
  modeLocked: boolean
  onKeyAdded:   (keys: string[]) => void
  onUndo:       () => void
  onBack:       () => void
  onSkip:       () => void
  onModeToggle: () => void
}> = ({ provider, providerIndex, totalProviders, existingKeys, prevProvider, inputMode, modeLocked, onKeyAdded, onUndo, onBack, onSkip, onModeToggle }) => {
  const [value,     setValue]     = useState('')
  const [urlOpened, setUrlOpened] = useState(false)
  const [message,   setMessage]   = useState('')

  const keyNum     = existingKeys.length + 1
  const isFirstKey = keyNum === 1
  // Allow mode toggle on Key 1 with no keys for THIS provider —
  // even if mode is globally locked by another provider's entry
  const canToggle  = isFirstKey && existingKeys.length === 0

  useInput((input, key) => {
    // Ctrl+O — open provider site
    if (key.ctrl && input === 'o') {
      openUrl(provider.keyUrl)
      setUrlOpened(true)
    }
    // Tab — toggle mode only on Key 1 before lock, clear any \t ink-text-input added
    if (key.tab && canToggle) {
      setValue('')
      onModeToggle()
    }
  })

  const handleSubmit = useCallback((val: string) => {
    const trimmed = val.trim()
    setValue('')
    setMessage('')

    // Back navigation
    if (trimmed === 'b' || trimmed === 'back') {
      if (isFirstKey && prevProvider) { onBack(); return }
      if (keyNum > 1) { onUndo(); return }
    }

    // Empty — skip or finish
    if (!trimmed) {
      if (isFirstKey && existingKeys.length === 0) { onSkip(); return }
      onSkip()
      return
    }

    // Always split by comma — if multiple keys pasted at any point, parse them all
    const newKeys = trimmed.includes(',')
      ? trimmed.split(',').map(k => k.trim()).filter(Boolean)
      : [trimmed]

    if (newKeys.length > 0) {
      setMessage(`✓ ${newKeys.length > 1 ? newKeys.length + ' keys' : 'Key ' + keyNum} saved`)
      onKeyAdded(newKeys)
      // Multiple keys pasted at once — all provided, advance to next provider
      if (newKeys.length > 1) {
        onSkip()
      }
    }
  }, [value, isFirstKey, keyNum, existingKeys, inputMode, modeLocked, prevProvider])

  // Build hint
  let hint = ''
  if (isFirstKey) {
    const backHint = prevProvider ? `  b = ← ${prevProvider.name}` : ''
    hint = inputMode === 'bulk' ? `comma-separated${backHint}` : `blank to skip${backHint}`
  } else {
    hint = `blank to finish  •  b = undo key ${keyNum - 1}  •  comma-sep for multiple`
  }

  return (
    <Box flexDirection="column">
      <Divider />
      <Box marginBottom={1} />

      {/* Provider header */}
      <Box>
        <Text bold color="cyan">  [ {provider.name} ] </Text>
        <Text dimColor>({providerIndex + 1}/{totalProviders})</Text>
      </Box>
      <Text dimColor>  {provider.description}</Text>
      <Text dimColor>  Key: {provider.keyHint}</Text>

      {/* Ctrl+O hint — updates in place */}
      <Text dimColor>  {urlOpened ? `↗  Opened ${provider.keyUrl}` : `Ctrl+O — open ${provider.keyUrl}`}</Text>

      {/* Mode indicator — always visible, Tab toggle only on Key 1 before lock */}
      <Box>
        <Text dimColor>  Mode: </Text>
        <Text bold color={inputMode === 'bulk' ? 'yellow' : 'white'}>
          {inputMode === 'single' ? 'Single' : 'Bulk'}
        </Text>
        {canToggle
          ? <Text dimColor>  Tab → {inputMode === 'single' ? 'Bulk' : 'Single'}</Text>
          : modeLocked
            ? <Text dimColor>  (locked)</Text>
            : null
        }
      </Box>

      <Box marginBottom={1} />

      {/* Already saved keys for this provider */}
      {existingKeys.map((k, i) => (
        <Box key={i}>
          <Text color="green">  ✓ Key {i + 1} </Text>
          <Text dimColor>{k.slice(0, 8)}{'*'.repeat(8)}</Text>
        </Box>
      ))}

      {/* Input */}
      <Box>
        <Text>  {isFirstKey && inputMode === 'bulk' ? 'Keys' : `API Key ${keyNum}`} </Text>
        <Text dimColor>({hint}): </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>

      {/* Feedback message */}
      {message && <Box marginTop={0}><Text color="green">  {message}</Text></Box>}
    </Box>
  )
}

// ─── Screen: Done ─────────────────────────────────────────────────────────────
const DoneScreen: React.FC<{
  configs: Record<string, unknown>
  configPath: string
}> = ({ configs, configPath }) => {
  const { exit } = useApp()

  useInput((_, key) => { if (key.return || key.escape) exit() })

  return (
    <Box flexDirection="column">
      <Divider />
      <Box marginBottom={1} />
      <Text color="green" bold>  ✓ Config saved to {configPath}</Text>
      <Box marginBottom={1} />
      <Divider />
      <Box marginBottom={1} />
      <Text bold>  Add to ~/.config/opencode/opencode.json:</Text>
      <Box marginBottom={1} />
      <Text dimColor>  {'  "mcp": {'}</Text>
      {Object.keys(configs).map(id => (
        <Box key={id} flexDirection="column">
          <Text dimColor>{'    '}<Text color="white">"{id}"</Text><Text dimColor>: {'{'}</Text></Text>
          <Text dimColor>{'      "type": "local",'}</Text>
          <Text dimColor>{'      "command": ["npx", "-y", "search-mcp-rotator", "--provider='}{id}{'"]},'}</Text>
          <Text dimColor>{'      "enabled": true'}</Text>
          <Text dimColor>{'    },'}</Text>
        </Box>
      ))}
      <Text dimColor>{'  }'}</Text>
      <Box marginBottom={1} />
      <Divider />
      <Box marginBottom={1} />
      <Text color="green" bold>  Setup complete! Restart OpenCode to activate.</Text>
      <Text dimColor>  Press Enter to exit.</Text>
    </Box>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
type Screen = 'select' | 'keys' | 'done'

const App: React.FC<{ configPath: string }> = ({ configPath }) => {
  const { exit } = useApp()
  const [screen,         setScreen]         = useState<Screen>('select')
  const [selectedIds,    setSelectedIds]    = useState<ProviderId[]>([])
  const [providerIndex,  setProviderIndex]  = useState(0)
  const [providerConfigs,setProviderConfigs]= useState<Record<string, unknown>>({})
  const [inputMode,      setInputMode]      = useState<string>('single')
  const [modeLocked,     setModeLocked]     = useState(false)

  // Ctrl+C global handler
  useInput((_, key) => {
    if (key.ctrl && _.toLowerCase() === 'c') exit()
  })

  // ── Provider checklist confirmed ────────────────────────────────────────────
  const handleSelectConfirm = useCallback((ids: ProviderId[]) => {
    setSelectedIds(ids)
    setProviderIndex(0)
    setScreen('keys')
  }, [])

  // ── Key added for current provider ──────────────────────────────────────────
  const handleKeyAdded = useCallback((newKeys: string[]) => {
    setProviderConfigs(prev => {
      const id = selectedIds[providerIndex]
      const provider = PROVIDERS.find(p => p.id === id)!
      const existingKeys = (prev[id] as any)?.keys ?? []
      const merged = [...existingKeys, ...newKeys]
      const updated = { ...prev, [id]: buildEntry(provider, merged) }
      syncConfig(configPath, updated)
      return updated
    })
    if (!modeLocked) setModeLocked(true)
  }, [selectedIds, providerIndex, modeLocked, configPath])

  // ── Undo last key ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setProviderConfigs(prev => {
      const id = selectedIds[providerIndex]
      const provider = PROVIDERS.find(p => p.id === id)!
      const keys = [...((prev[id] as any)?.keys ?? [])]
      keys.pop()
      const updated = { ...prev }
      if (keys.length > 0) updated[id] = buildEntry(provider, keys)
      else delete updated[id]
      syncConfig(configPath, updated)
      return updated
    })
  }, [selectedIds, providerIndex, configPath])

  // ── Go back to previous provider ────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setProviderIndex(i => Math.max(0, i - 1))
  }, [])

  // ── Skip / finish current provider → advance ─────────────────────────────
  const handleSkip = useCallback(() => {
    if (providerIndex + 1 >= selectedIds.length) {
      setScreen('done')
    } else {
      setProviderIndex(i => i + 1)
    }
  }, [providerIndex, selectedIds])

  // ── Mode toggle ────────────────────────────────────────────────────────────
  // canToggle in KeyEntryView is the gatekeeper — no double-check needed here
  const handleModeToggle = useCallback(() => {
    setInputMode(m => m === 'single' ? 'bulk' : 'single')
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1} />
        <Box borderStyle="round" borderColor="cyan" paddingX={2}>
          <Text bold color="cyan">Search MCP Rotator — Setup</Text>
        </Box>
        <Text dimColor>  Config: {configPath}</Text>
        <ProviderSelect onConfirm={handleSelectConfirm} />
      </Box>
    )
  }

  if (screen === 'keys') {
    const id       = selectedIds[providerIndex]
    const provider = PROVIDERS.find(p => p.id === id)!
    const prevId   = providerIndex > 0 ? selectedIds[providerIndex - 1] : null
    const prev     = prevId ? PROVIDERS.find(p => p.id === prevId)! : null
    const existingKeys = (providerConfigs[id] as any)?.keys ?? []

    return (
      <Box flexDirection="column">
        <SelectedSummary ids={selectedIds} />
        <KeyEntryView
          provider={provider}
          providerIndex={providerIndex}
          totalProviders={selectedIds.length}
          existingKeys={existingKeys}
          prevProvider={prev}
          inputMode={inputMode}
          modeLocked={modeLocked}
          onKeyAdded={handleKeyAdded}
          onUndo={handleUndo}
          onBack={handleBack}
          onSkip={handleSkip}
          onModeToggle={handleModeToggle}
        />
      </Box>
    )
  }

  return <DoneScreen configs={providerConfigs} configPath={configPath} />
}

// ─── Entry ────────────────────────────────────────────────────────────────────
export async function runSetup(outputPath?: string): Promise<void> {
  const configPath = outputPath ?? DEFAULT_CONFIG_PATH
  const { waitUntilExit } = render(<App configPath={configPath} />)
  await waitUntilExit()
}
