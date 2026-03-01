'use client'

import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  LoadingOverlay,
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

// ── Run button — must be inside SandpackProvider ─────────────────────────────
function RunButton() {
  const { sandpack } = useSandpack()
  const { refresh } = useSandpackNavigation()
  const busy = sandpack.status === 'initial' || sandpack.status === 'timeout'

  return (
    <button
      type="button"
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

// ── Network label ─────────────────────────────────────────────────────────────
function NetworkLabel() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
        color: T.muted,
      }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>network:</span>
      <span
        style={{
          padding: '2px 9px',
          borderRadius: '4px',
          background: T.activeBg,
          color: T.activeText,
          fontSize: '11px',
          whiteSpace: 'nowrap',
        }}
      >
        Testnet
      </span>
      <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
        · chain 71
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
  '@cfxdevkit/core': '^1.0.16',
}

// ── Main component ────────────────────────────────────────────────────────────
export function Playground({
  files = {},
  template = 'vanilla-ts',
  showConsole = true,
  extraDeps = {},
  file = 'index.ts',
}: PlaygroundProps) {
  const mergedFiles = {
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
        template={template}
        theme="dark"
        files={mergedFiles}
        options={{
          activeFile,
          visibleFiles: Object.entries(mergedFiles)
            .filter(([, v]) => !(v as { hidden?: boolean }).hidden)
            .map(([k]) => k),
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
          <NetworkLabel />
          <RunButton />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: T.bg,
            position: 'relative',
          }}
        >
          <LoadingOverlay showOpenInCodeSandbox={false} />
          <SandpackCodeEditor
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: 340, minWidth: 0 }}
          />
          <div style={{ height: 1, background: T.border }} />
          {showConsole ? (
            <SandpackConsole showHeader style={{ height: 260, minWidth: 0 }} />
          ) : (
            <SandpackPreview style={{ height: 260, minWidth: 0 }} showNavigator={false} />
          )}
        </div>

        {/* SandpackConsole needs a running iframe (SandpackPreview) to execute code.
            When only the console is shown, render a hidden preview to provide that client. */}
        {showConsole && (
          <div aria-hidden="true" style={{ height: 0, overflow: 'hidden' }}>
            <SandpackPreview />
          </div>
        )}
      </SandpackProvider>
    </div>
  )
}
