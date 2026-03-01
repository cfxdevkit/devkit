'use client'

import { useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react'
// sandpackDark is bundled with sandpack-react
const sandpackDark = 'dark' as const

// Conflux network configs
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

interface PlaygroundProps {
  /** The active code file name, e.g. "index.ts" */
  file?: string
  /** Record of filename → code content */
  files?: Record<string, string>
  /** Template: "vanilla-ts" | "nextjs" | "node" */
  template?: 'vanilla-ts' | 'node'
  /** Show console instead of preview */
  showConsole?: boolean
  /** Extra npm dependencies beyond the defaults */
  extraDeps?: Record<string, string>
}

const DEFAULT_DEPS: Record<string, string> = {
  viem: '^2.0.0',
  '@cfxdevkit/core': 'latest',
  '@cfxdevkit/contracts': 'latest',
}

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
        gap: '8px',
        padding: '6px 12px',
        borderBottom: '1px solid var(--sp-colors-surface2)',
        background: 'var(--sp-colors-surface1)',
        fontSize: '12px',
        fontFamily: 'var(--sp-font-mono)',
      }}
    >
      <span style={{ color: 'var(--sp-colors-fg-inactive)' }}>network:</span>
      {(Object.keys(NETWORKS) as Network[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '2px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '11px',
            background:
              network === key
                ? 'var(--sp-colors-accent)'
                : 'var(--sp-colors-surface2)',
            color:
              network === key
                ? '#fff'
                : 'var(--sp-colors-fg-inactive)',
          }}
        >
          {NETWORKS[key].label}
        </button>
      ))}
      <span
        style={{
          marginLeft: 'auto',
          color: 'var(--sp-colors-fg-inactive)',
          fontSize: '10px',
        }}
      >
        chainId: {NETWORKS[network].chainId} · {NETWORKS[network].rpcUrl}
      </span>
    </div>
  )
}

export function Playground({
  files = {},
  template = 'vanilla-ts',
  showConsole = true,
  extraDeps = {},
  file = 'index.ts',
}: PlaygroundProps) {
  const [network, setNetwork] = useState<Network>('testnet')

  const networkConfig = NETWORKS[network]

  // Inject a network-config helper that examples can import
  const networkFile = `// Auto-generated — re-renders when you toggle network above
export const NETWORK = {
  chainId: ${networkConfig.chainId},
  rpcUrl: '${networkConfig.rpcUrl}',
  blockExplorer: '${networkConfig.blockExplorer}',
} as const
`

  const mergedFiles = {
    '/network-config.ts': { code: networkFile, readOnly: true },
    ...Object.fromEntries(
      Object.entries(files).map(([name, code]) => [
        name.startsWith('/') ? name : `/${name}`,
        { code },
      ])
    ),
  }

  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden' }}>
      <SandpackProvider
        key={network} // remount on network change to reset execution
        template={template}
        theme={sandpackDark}
        files={mergedFiles}
        options={{
          activeFile: file.startsWith('/') ? file : `/${file}`,
          visibleFiles: Object.keys(mergedFiles),
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
        customSetup={{
          dependencies: {
            ...DEFAULT_DEPS,
            ...extraDeps,
          },
        }}
      >
        <NetworkToggle network={network} onChange={setNetwork} />
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: 400 }}
          />
          {showConsole ? (
            <SandpackConsole style={{ height: 400 }} />
          ) : (
            <SandpackPreview style={{ height: 400 }} />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
