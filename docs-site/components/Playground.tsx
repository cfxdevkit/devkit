'use client'

import {
  SandpackProvider,
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
  const cfg = NETWORKS.testnet
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
        {cfg.label}
      </span>
      <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
        · chain {cfg.chainId}
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
}

// ── Browser-compatible shim ────────────────────────────────────────────────
// @cfxdevkit/core uses node:events (via ClientManager) which Sandpack's bundler
// cannot polyfill. This shim re-implements the same public API surface using
// viem directly. In a real project you import from '@cfxdevkit/core'.
const CFXDEVKIT_SHIM = `// cfxdevkit.ts — browser shim for @cfxdevkit/core
// Real project: replace './cfxdevkit' with '@cfxdevkit/core'
import {
  createPublicClient, createWalletClient, http,
  formatEther, formatUnits, parseEther, parseUnits, defineChain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export { formatEther, formatUnits, parseEther, parseUnits } from 'viem'

export const ERC20_ABI = [
  { name: 'name',        type: 'function', stateMutability: 'view',        inputs: [],                                                                                outputs: [{ type: 'string'  }] },
  { name: 'symbol',      type: 'function', stateMutability: 'view',        inputs: [],                                                                                outputs: [{ type: 'string'  }] },
  { name: 'decimals',    type: 'function', stateMutability: 'view',        inputs: [],                                                                                outputs: [{ type: 'uint8'   }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view',        inputs: [],                                                                                outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf',   type: 'function', stateMutability: 'view',        inputs: [{ name: 'account', type: 'address' }],                                            outputs: [{ type: 'uint256' }] },
  { name: 'allowance',   type: 'function', stateMutability: 'view',        inputs: [{ name: 'owner',   type: 'address' }, { name: 'spender', type: 'address' }],      outputs: [{ type: 'uint256' }] },
  { name: 'transfer',    type: 'function', stateMutability: 'nonpayable',   inputs: [{ name: 'to',      type: 'address' }, { name: 'amount',  type: 'uint256' }],      outputs: [{ type: 'bool'    }] },
  { name: 'approve',     type: 'function', stateMutability: 'nonpayable',   inputs: [{ name: 'spender', type: 'address' }, { name: 'amount',  type: 'uint256' }],      outputs: [{ type: 'bool'    }] },
  { name: 'transferFrom',type: 'function', stateMutability: 'nonpayable',   inputs: [{ name: 'from',    type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

function makeChain(chainId, rpcUrl) {
  const names = { 71: 'Conflux eSpace Testnet', 1030: 'Conflux eSpace' }
  return defineChain({
    id: chainId,
    name: names[chainId] || 'Conflux eSpace (' + chainId + ')',
    nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  })
}

export class EspaceClient {
  public publicClient
  public chainId
  public rpcUrl
  public address = ''

  constructor({ chainId, rpcUrl }) {
    this.chainId = chainId
    this.rpcUrl  = rpcUrl
    this.publicClient = createPublicClient({
      chain:     makeChain(chainId, rpcUrl),
      transport: http(rpcUrl),
    })
  }

  async getBlockNumber()    { return this.publicClient.getBlockNumber() }
  async getChainId()        { return this.publicClient.getChainId() }
  async getGasPrice()       { return this.publicClient.getGasPrice() }
  async isConnected()       { try { await this.publicClient.getBlockNumber(); return true } catch { return false } }

  async getBalance(address) {
    const wei = await this.publicClient.getBalance({ address })
    return formatEther(wei)
  }

  async getTokenBalance(address, tokenAddress) {
    const bal = await this.publicClient.readContract({
      address: tokenAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [address],
    })
    return String(bal)
  }

  async readContract({ address, abi, functionName, args = [] }) {
    return this.publicClient.readContract({ address, abi, functionName, args })
  }

  async estimateGas({ to, value, data }) {
    return this.publicClient.estimateGas({ to, value, data })
  }

  async waitForTransaction(hash) {
    const r = await this.publicClient.waitForTransactionReceipt({ hash })
    return {
      hash: r.transactionHash, blockNumber: r.blockNumber,
      gasUsed: r.gasUsed, status: r.status, contractAddress: r.contractAddress ?? undefined,
    }
  }
}

export class EspaceWalletClient extends EspaceClient {
  _account
  _walletClient

  constructor({ chainId, rpcUrl, privateKey }) {
    super({ chainId, rpcUrl })
    this._account     = privateKeyToAccount(privateKey)
    this.address      = this._account.address
    this._walletClient = createWalletClient({
      account: this._account, chain: makeChain(chainId, rpcUrl), transport: http(rpcUrl),
    })
  }

  getAddress() { return this.address }

  async sendTransaction({ to, value, data }) {
    return this._walletClient.sendTransaction({
      account: this._account, chain: makeChain(this.chainId, this.rpcUrl),
      to, value, data,
    })
  }

  async signMessage(message) {
    return this._walletClient.signMessage({ account: this._account, message })
  }

  async deployContract(abi, bytecode, args = []) {
    const hash = await this._walletClient.deployContract({
      account: this._account, chain: makeChain(this.chainId, this.rpcUrl),
      abi, bytecode, args,
    })
    const r = await this.waitForTransaction(hash)
    return r.contractAddress
  }
}
`

// ── Main component ────────────────────────────────────────────────────────────
export function Playground({
  files = {},
  template = 'vanilla-ts',
  showConsole = true,
  extraDeps = {},
  file = 'index.ts',
}: PlaygroundProps) {
  const networkConfig = NETWORKS.testnet

  const networkFile = `// Auto-generated network config\nexport const NETWORK = {\n  chainId: ${networkConfig.chainId},\n  rpcUrl: '${networkConfig.rpcUrl}',\n  blockExplorer: '${networkConfig.blockExplorer}',\n} as const\n`

  const mergedFiles = {
    '/cfxdevkit.ts': { code: CFXDEVKIT_SHIM, hidden: true, readOnly: true },
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
          }}
        >
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
