'use client'

import { useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  useSandpack,
  useSandpackNavigation,
} from '@codesandbox/sandpack-react'

// Hard-coded dark toolbar colors — CSS vars are only scoped inside SandpackLayout
const T = {
  bg: '#1c1c1e',
  border: '#3a3a3c',
  muted: '#888',
  text: '#ccc',
  activeBg: '#0070f3',
  activeText: '#fff',
  pillBg: '#2a2a2c',
  runBg: '#22c55e',
  runText: '#fff',
  runDisabledBg: '#2a2a2c',
  runDisabledText: '#666',
} as const

// ── Conflux network configs ──────────────────────────────────────────────────
const NETWORKS = {
  testnet: {
    label: 'Testnet',
    chainId: 71,
    rpcUrl: 'https://evmtestnet.confluxrpc.com',
    blockExplorer: 'https://evmtestnet.confluxscan.io',
  },
  local: {
    label: 'Local (localhost:8545)',
    chainId: 2030,
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
  },
} as const

type Network = keyof typeof NETWORKS

// ── Run button — must be inside SandpackProvider ─────────────────────────────
function RunButton() {
  const { sandpack } = useSandpack()
  const { refresh } = useSandpackNavigation()
  const busy = sandpack.status === 'initial' || sandpack.status === 'timeout'

  return (
    <button
      onClick={refresh}
      disabled={busy}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 14px',
        borderRadius: '4px',
        border: 'none',
        cursor: busy ? 'not-allowed' : 'pointer',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '12px',
        fontWeight: 600,
        background: busy ? T.runDisabledBg : T.runBg,
        color: busy ? T.runDisabledText : T.runText,
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
    >
      ▶ Run
    </button>
  )
}

// ── Network toggle ────────────────────────────────────────────────────────────
function NetworkToggle({
  network,
  onChange,
}: {
  network: Network
  onChange: (n: Network) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
        color: T.muted,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>network:</span>
      {(Object.keys(NETWORKS) as Network[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '2px 9px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            background: network === key ? T.activeBg : T.pillBg,
            color: network === key ? T.activeText : T.text,
          }}
        >
          {NETWORKS[key].label}
        </button>
      ))}
      <span
        style={{
          color: T.muted,
          fontSize: '10px',
          whiteSpace: 'nowrap',
        }}
      >
        · chain {NETWORKS[network].chainId}
      </span>
    </div>
  )
}

// ── Props ────────────────────────────────────────────────────────────────────
interface PlaygroundProps {
  file?: string
  files?: Record<string, string>
  template?: 'vanilla-ts' | 'node'
  showConsole?: boolean
  extraDeps?: Record<string, string>
}

const DEFAULT_DEPS: Record<string, string> = {
  viem: '^2.0.0',
  '@cfxdevkit/core': 'latest',
  '@cfxdevkit/contracts': 'latest',
}

// ── Main component ────────────────────────────────────────────────────────────
export function Playground({
  files = {},
  template = 'vanilla-ts',
  showConsole = true,
  extraDeps = {},
  file = 'index.ts',
}: PlaygroundProps) {
  const [network, setNetwork] = useState<Network>('testnet')

  const networkConfig = NETWORKS[network]

  const networkFile = `// Auto-generated — changes when you toggle network\nexport const NETWORK = {\n  chainId: ${networkConfig.chainId},\n  rpcUrl: '${networkConfig.rpcUrl}',\n  blockExplorer: '${networkConfig.blockExplorer}',\n} as const\n`

  const mergedFiles = {
    '/network-config.ts': { code: networkFile, readOnly: true },
    ...Object.fromEntries(
      Object.entries(files).map(([name, code]) => [
        name.startsWith('/') ? name : `/${name}`,
        { code },
      ])
    ),
  }

  const activeFile = file.startsWith('/') ? file : `/${file}`

  return (
    <div
      style={{
        margin: '1.5rem 0',
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${T.border}`,
      }}
    >
      <SandpackProvider
        key={network}
        template={template}
        theme="dark"
        files={mergedFiles}
        options={{
          activeFile,
          visibleFiles: Object.keys(mergedFiles),
          recompileMode: 'delayed',
          recompileDelay: 600,
          autorun: true,
        }}
        customSetup={{
          // Override the template's default entry (/src/index.ts) so our /index.ts is used
          entry: '/index.ts',
          dependencies: { ...DEFAULT_DEPS, ...extraDeps },
        }}
      >
        {/* Toolbar — inside Provider to access sandpack context, outside Layout to control bg */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gap: '8px',
          }}
        >
          <NetworkToggle network={network} onChange={setNetwork} />
          <RunButton />
        </div>

        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: 380 }}
          />
          {showConsole ? (
            <SandpackConsole showHeader style={{ height: 380 }} />
          ) : (
            <SandpackPreview style={{ height: 380 }} showNavigator={false} />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
