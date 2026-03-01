'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Droplets,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddNetworkButton } from '@/components/AddNetworkButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type AccountInfo,
  accountsApi,
  keystoreApi,
  miningApi,
  networkApi,
  nodeApi,
  settingsApi,
} from '@/lib/api';
import { getSocket, type NodeStatusEvent } from '@/lib/socket';

/* ─── helpers ────────────────────────────────────────────────────── */

function truncateHex(hex?: string) {
  if (!hex || hex.length < 14) return hex || '';
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
}

function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      className={`rounded text-slate-500 hover:text-slate-300 ${small ? 'p-0.5' : 'ml-1.5 px-1.5 py-1 btn-secondary'}`}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? (
        <CheckCheck
          className={
            small ? 'h-3 w-3 text-green-400' : 'h-3.5 w-3.5 text-green-400'
          }
        />
      ) : (
        <Copy className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      )}
    </button>
  );
}

/* ─── Security panel ─────────────────────────────────────────────── */
function SecurityPanel() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 30_000,
  });

  const [open, setOpen] = useState(false);

  if (!settings) return null;

  const isSecure = !settings.isPublic || settings.authEnabled;

  return (
    <div
      className={`card border ${isSecure ? 'border-[#2a3147]' : 'border-yellow-800'}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {settings.isPublic && !settings.authEnabled ? (
            <ShieldAlert className="h-4 w-4 text-yellow-400" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-400" />
          )}
          <span className="text-sm font-medium text-slate-300">Security</span>
          {settings.isPublic && !settings.authEnabled && (
            <span className="rounded bg-yellow-900/50 px-1.5 py-0.5 text-[10px] text-yellow-400">
              exposed without auth
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-[#2a3147] pt-3 text-xs">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                ['Bind address', `${settings.host}:${settings.port}`],
                ['Public', settings.isPublic ? 'Yes' : 'No (localhost)'],
                ['API auth', settings.authEnabled ? '✓ Enabled' : '✗ Disabled'],
                ['Rate limit', `${settings.rateLimit.maxRequests} req / min`],
                [
                  'CORS',
                  Array.isArray(settings.corsOrigins)
                    ? settings.corsOrigins.join(', ') || 'none'
                    : settings.corsOrigins,
                ],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k}>
                <div className="text-slate-500">{k}</div>
                <div
                  className={`mt-0.5 font-medium ${k === 'API auth' && !settings.authEnabled && settings.isPublic ? 'text-yellow-400' : 'text-slate-200'}`}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {settings.isPublic && !settings.authEnabled && (
            <div className="rounded border border-yellow-800 bg-yellow-950/40 px-3 py-2 text-yellow-400">
              <p className="font-semibold">
                ⚠ Running on a public interface without auth
              </p>
              <p className="mt-1 text-yellow-500">
                Anyone who can reach this host can control the node and read
                private keys. Restart with{' '}
                <code className="rounded bg-yellow-900/60 px-1">
                  --api-key &lt;secret&gt;
                </code>{' '}
                to enable Bearer token auth.
              </p>
            </div>
          )}

          <div className="rounded border border-[#2a3147] bg-[#0e1117] px-3 py-2 text-slate-400">
            <p className="font-semibold text-slate-300">
              Public-host hardening checklist
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-500">
              <li>
                Pass{' '}
                <code className="text-slate-400">--api-key &lt;secret&gt;</code>{' '}
                on startup
              </li>
              <li>
                Restrict <code className="text-slate-400">--cors-origin</code>{' '}
                to your frontend origin
              </li>
              <li>
                Put a TLS-terminating reverse proxy (nginx/caddy) in front
              </li>
              <li>
                Limit firewall ingress to port {settings.port} from known IPs
              </li>
              <li>Never expose a wallet that holds real funds</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Fund modal ─────────────────────────────────────────────────── */
function FundModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');

  const fundMutation = useMutation({
    mutationFn: () => accountsApi.fund(address, amount || undefined),
    onSuccess: (d) => {
      setResult(`✓ tx: ${d.txHash}`);
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (e) => setResult(`✗ ${e.message}`),
  });

  // Detect chain from address format for display hint
  const detectedChain = address.trim().toLowerCase().startsWith('0x')
    ? 'EVM (eSpace)'
    : address.trim()
      ? 'Core Space'
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-cfx-500/20">
        <CardHeader>
          <CardTitle>Fund Address</CardTitle>
          <CardDescription>Send CFX from faucet to address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Address
              {detectedChain && (
                <span className="ml-2 text-xs text-cfx-400">
                  — detected: {detectedChain}
                </span>
              )}
            </Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x… or cfx:…"
            />
          </div>
          <div className="space-y-2">
            <Label>Amount (optional)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
          {result && <p className="text-sm text-cfx-300">{result}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!address || fundMutation.isPending}
            onClick={() => fundMutation.mutate()}
          >
            {fundMutation.isPending ? 'Sending…' : 'Fund'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const qc = useQueryClient();
  const [rtStatus, setRtStatus] = useState<NodeStatusEvent | null>(null);

  // network config draft for editing when node is stopped
  const [configDraft, setConfigDraft] = useState<Record<string, string> | null>(
    null
  );
  const [configSaved, setConfigSaved] = useState('');

  // accounts UI state
  const [showKeys, setShowKeys] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState(false);

  // mining UI state
  const [mineBlocksInput, setMineBlocksInput] = useState('1');
  const [mineIntervalInput, setMineIntervalInput] = useState('1000');
  const [mineResult, setMineResult] = useState('');

  // RPC section collapse state
  const [showRpc, setShowRpc] = useState(false);

  /* ── queries ──────────────────────────────────────────────────── */
  const { data: status } = useQuery({
    queryKey: ['node', 'status'],
    queryFn: nodeApi.status,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['keystore', 'wallets'],
    queryFn: keystoreApi.wallets,
    refetchInterval: 5000,
  });

  const { data: config } = useQuery({
    queryKey: ['network', 'config'],
    queryFn: networkApi.config,
  });

  const isRunning = (rtStatus ?? status)?.server === 'running';

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.list,
    enabled: isRunning,
    refetchInterval: isRunning ? 8000 : false,
  });

  const { data: faucet } = useQuery({
    queryKey: ['accounts', 'faucet'],
    queryFn: accountsApi.faucet,
    enabled: isRunning,
  });

  const { data: miningStatus } = useQuery({
    queryKey: ['mining', 'status'],
    queryFn: miningApi.status,
    enabled: isRunning,
    refetchInterval: isRunning ? 3000 : false,
  });

  /* ── socket ──────────────────────────────────────────────────── */
  useEffect(() => {
    const socket = getSocket();
    const handler = (evt: NodeStatusEvent) => {
      setRtStatus(evt);
      qc.setQueryData(['node', 'status'], evt);
    };
    socket.on('node:status', handler);
    return () => {
      socket.off('node:status', handler);
    };
  }, [qc]);

  // Populate config draft once fetched
  useEffect(() => {
    if (config && !configDraft) {
      setConfigDraft({
        coreRpcPort: String(config.coreRpcPort),
        evmRpcPort: String(config.evmRpcPort),
        wsPort: String(config.wsPort),
        evmWsPort: String(config.evmWsPort),
        chainId: String(config.chainId),
        evmChainId: String(config.evmChainId),
      });
    }
  }, [config, configDraft]);

  // Sync interval input when auto-mine turns on
  useEffect(() => {
    if (miningStatus?.isRunning && miningStatus.interval !== undefined) {
      setMineIntervalInput(String(miningStatus.interval));
    }
  }, [miningStatus?.isRunning, miningStatus?.interval]);

  /* ── mutations ───────────────────────────────────────────────── */
  const startMutation = useMutation({
    mutationFn: nodeApi.start,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['node'] }),
  });
  const stopMutation = useMutation({
    mutationFn: nodeApi.stop,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['node'] }),
  });
  const restartMutation = useMutation({
    mutationFn: nodeApi.restart,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['node'] }),
  });
  const restartWipeMutation = useMutation({
    mutationFn: nodeApi.restartWipe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['node'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['mining'] });
    },
  });

  const wipeMutation = useMutation({
    mutationFn: nodeApi.wipe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['node'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['contracts', 'deployed'] });
      qc.invalidateQueries({ queryKey: ['mining'] });
    },
  });

  const activateWalletMutation = useMutation({
    mutationFn: keystoreApi.activateWallet,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['keystore', 'wallets'] }),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (d: Record<string, string>) =>
      networkApi.updateConfig({
        coreRpcPort: Number(d.coreRpcPort),
        evmRpcPort: Number(d.evmRpcPort),
        wsPort: Number(d.wsPort),
        evmWsPort: Number(d.evmWsPort),
        chainId: Number(d.chainId),
        evmChainId: Number(d.evmChainId),
      }),
    onSuccess: () => {
      setConfigSaved('✓ Saved');
      setTimeout(() => setConfigSaved(''), 2500);
      qc.invalidateQueries({ queryKey: ['network'] });
    },
    onError: (e) => setConfigSaved(`✗ ${e.message}`),
  });

  const mineMutation = useMutation({
    mutationFn: () => miningApi.mine(Number(mineBlocksInput)),
    onSuccess: (d) => {
      setMineResult(`✓ Mined ${d.mined} block(s)`);
      qc.invalidateQueries({ queryKey: ['mining'] });
    },
    onError: (e) => setMineResult(`✗ ${e.message}`),
  });
  const startMiningMutation = useMutation({
    mutationFn: () => miningApi.start(Number(mineIntervalInput)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mining'] }),
  });
  const stopMiningMutation = useMutation({
    mutationFn: miningApi.stop,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mining'] }),
  });

  /* ── derived state ───────────────────────────────────────────── */
  const current = rtStatus ?? status;
  const serverState = current?.server ?? 'stopped';

  const isBusy =
    serverState === 'starting' ||
    serverState === 'stopping' ||
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending ||
    restartWipeMutation.isPending ||
    wipeMutation.isPending;

  const dotClass = isRunning
    ? 'status-dot-green'
    : isBusy
      ? 'status-dot-yellow'
      : 'status-dot-red';

  const statusLabel = startMutation.isPending
    ? 'Starting…'
    : stopMutation.isPending
      ? 'Stopping…'
      : restartMutation.isPending || restartWipeMutation.isPending
        ? 'Restarting…'
        : wipeMutation.isPending
          ? 'Wiping…'
          : serverState === 'starting'
            ? 'Starting…'
            : serverState === 'stopping'
              ? 'Stopping…'
              : serverState === 'running'
                ? 'Running'
                : 'Stopped';

  const activeWallet = wallets.find((w) => w.isActive);
  const rpcUrls = current?.rpcUrls;
  const displayedAccounts = expandedAccounts ? accounts : accounts.slice(0, 5);
  const miningBusy =
    mineMutation.isPending ||
    startMiningMutation.isPending ||
    stopMiningMutation.isPending;

  async function handleUpdateInterval() {
    try {
      await stopMiningMutation.mutateAsync();
      startMiningMutation.mutate();
    } catch {
      /* error tracked in stopMiningMutation.error */
    }
  }

  return (
    <div className="space-y-6">
      {showFund && <FundModal onClose={() => setShowFund(false)} />}

      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Local Conflux development node
        </p>
      </div>

      {/* ── Status + Controls ─────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardContent className="p-5 space-y-4">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`relative flex h-3.5 w-3.5 ${dotClass === 'status-dot-green' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : dotClass === 'status-dot-yellow' ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]'} rounded-full`}
              />
              <div>
                <div className="text-base font-semibold text-white tracking-wide">
                  {statusLabel}
                </div>
                {isRunning && current?.epochNumber !== undefined && (
                  <div className="text-xs font-medium text-cfx-400 mt-0.5">
                    Epoch #{current.epochNumber}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2.5">
              {!isRunning ? (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-500 text-white shadow shadow-green-900/20"
                    disabled={isBusy}
                    onClick={() => startMutation.mutate()}
                  >
                    <Play className="mr-2 h-4 w-4" /> Start Node
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isBusy}
                    title="Delete all chain data for this wallet (cannot be undone)"
                    onClick={() => {
                      if (
                        confirm(
                          'Wipe all chain data for this wallet? This cannot be undone.'
                        )
                      ) {
                        wipeMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Wipe Data
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => restartMutation.mutate()}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Restart
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isBusy}
                    title="Wipe this wallet's data directory and restart from block 0"
                    onClick={() => {
                      if (
                        confirm(
                          'Wipe all chain data for this wallet and restart from block 0?'
                        )
                      ) {
                        restartWipeMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isBusy}
                    onClick={() => stopMutation.mutate()}
                  >
                    <Square className="mr-2 h-4 w-4" /> Stop
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* RPC Endpoints — collapsible, hidden by default, accessible when running */}
          {isRunning && rpcUrls && (
            <div className="border-t border-[#2a3147] pt-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
                onClick={() => setShowRpc((v) => !v)}
              >
                <span>RPC Endpoints</span>
                {showRpc ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {showRpc && (
                <div className="mt-3 space-y-2">
                  {(
                    [
                      ['Core RPC', rpcUrls.core],
                      ['EVM / ETH RPC', rpcUrls.evm],
                      ['Core WebSocket', rpcUrls.coreWs ?? rpcUrls.ws],
                      ['EVM WebSocket', rpcUrls.evmWs ?? ''],
                    ] as [string, string][]
                  )
                    .filter(([, url]) => url)
                    .map(([label, url]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span className="w-32 text-xs text-slate-500">
                          {label}
                        </span>
                        <div className="flex flex-1 items-center overflow-hidden">
                          <code className="flex-1 truncate rounded bg-[#0e1117] px-2 py-1 text-xs text-blue-300">
                            {url}
                          </code>
                          <CopyButton text={url} />
                        </div>
                      </div>
                    ))}
                  {configDraft && (
                    <div className="flex gap-8 border-t border-[#2a3147] pt-2">
                      <div>
                        <div className="text-[10px] text-slate-500">
                          Core Chain ID
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-300">
                            {configDraft.chainId}
                          </span>
                          <CopyButton text={configDraft.chainId} small />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">
                          EVM Chain ID
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-300">
                            {configDraft.evmChainId}
                          </span>
                          <CopyButton text={configDraft.evmChainId} small />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add eSpace network to browser wallet */}
                  <div className="border-t border-[#2a3147] pt-2 flex justify-end">
                    <AddNetworkButton
                      evmChainId={
                        configDraft?.evmChainId
                          ? Number(configDraft.evmChainId)
                          : undefined
                      }
                      evmRpcUrl={rpcUrls?.evm}
                      chainName="Conflux DevKit eSpace"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet selector — only when node is not running */}
          {!isRunning && wallets.length > 0 && (
            <div className="border-t border-[#2a3147] pt-4">
              <label className="label flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" /> Wallet
              </label>
              {wallets.length === 1 ? (
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-xs text-blue-300">
                    {activeWallet?.label ?? wallets[0].label}
                  </code>
                  <span className="rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] text-blue-400">
                    active
                  </span>
                </div>
              ) : (
                <select
                  className="input mt-1 w-full max-w-xs"
                  value={activeWallet?.id ?? ''}
                  onChange={(e) =>
                    activateWalletMutation.mutate(e.target.value)
                  }
                  disabled={activateWalletMutation.isPending}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                      {w.isActive ? ' (active)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Network config — only when stopped */}
          {!isRunning && configDraft && (
            <div className="border-t border-slate-800 pt-6 mt-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">
                Network Configuration
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {(
                    [
                      ['Core RPC Port', 'coreRpcPort'],
                      ['EVM RPC Port', 'evmRpcPort'],
                      ['Core WS Port', 'wsPort'],
                      ['EVM WS Port', 'evmWsPort'],
                      ['Core Chain ID', 'chainId'],
                      ['EVM Chain ID', 'evmChainId'],
                    ] as [string, string][]
                  ).map(([label, key]) => (
                    <div key={key} className="space-y-1.5">
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        value={configDraft[key] ?? ''}
                        onChange={(e) =>
                          setConfigDraft((d) =>
                            d ? { ...d, [key]: e.target.value } : d
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    disabled={updateConfigMutation.isPending || isBusy}
                    onClick={() =>
                      configDraft && updateConfigMutation.mutate(configDraft)
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateConfigMutation.isPending ? 'Saving…' : 'Save Config'}
                  </Button>
                  {configSaved && (
                    <span
                      className={`text-sm font-medium ${configSaved.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {configSaved}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* ── Mining ─────────────────────────────────────── */}
      {isRunning && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Single compact row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Title */}
              <span className="text-sm font-medium text-slate-300 shrink-0">
                Mining
              </span>

              {/* Blocks mined badge — prominent */}
              <span className="rounded-md bg-slate-950 border border-slate-800 px-3 py-1 text-sm font-semibold tabular-nums text-white shrink-0 shadow-inner">
                {(miningStatus?.blocksMined ?? 0).toLocaleString()}
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  blocks
                </span>
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {miningStatus?.isRunning ? (
                /* Auto-mine ON: interval input inline */
                <>
                  <Label className="text-xs text-slate-500 shrink-0">
                    Interval (ms)
                  </Label>
                  <Input
                    className="w-24 shrink-0 h-9"
                    type="number"
                    min="100"
                    value={mineIntervalInput}
                    onChange={(e) => setMineIntervalInput(e.target.value)}
                  />
                  {Number(mineIntervalInput) !==
                    (miningStatus.interval ?? 0) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      disabled={miningBusy}
                      onClick={handleUpdateInterval}
                    >
                      Apply
                    </Button>
                  )}
                </>
              ) : (
                /* Manual mine: blocks input + Mine button inline */
                <>
                  <Label className="text-xs text-slate-500 shrink-0">
                    Blocks
                  </Label>
                  <Input
                    className="w-20 shrink-0 h-9"
                    type="number"
                    min="1"
                    max="1000"
                    value={mineBlocksInput}
                    onChange={(e) => setMineBlocksInput(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="shrink-0"
                    disabled={miningBusy}
                    onClick={() => mineMutation.mutate()}
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    {mineMutation.isPending ? 'Mining…' : 'Mine'}
                  </Button>
                </>
              )}

              {/* Auto-mine toggle */}
              <div className="flex items-center gap-2 shrink-0 border-l border-slate-800 pl-4 ml-1">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${miningStatus?.isRunning ? 'text-cfx-400' : 'text-slate-500'}`}
                >
                  Auto
                </span>
                <button
                  type="button"
                  disabled={miningBusy}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cfx-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                    miningStatus?.isRunning ? 'bg-cfx-500' : 'bg-slate-700'
                  }`}
                  onClick={() =>
                    miningStatus?.isRunning
                      ? stopMiningMutation.mutate()
                      : startMiningMutation.mutate()
                  }
                  title={
                    miningStatus?.isRunning
                      ? 'Stop auto-mining'
                      : 'Start auto-mining'
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      miningStatus?.isRunning
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Inline result / error feedback */}
            {(mineResult ||
              startMiningMutation.error ||
              stopMiningMutation.error) && (
              <p
                className={`mt-3 text-sm font-medium ${mineResult?.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}
              >
                {mineResult ||
                  String(startMiningMutation.error ?? stopMiningMutation.error)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      {/* ── Accounts ──────────────────────────────────────────────── */}
      {isRunning && (
        <Card className="border-cfx-500/10">
          <CardHeader>
            <CardTitle className="text-lg">Accounts</CardTitle>
            <CardDescription>
              Development accounts derived from mnemonic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Faucet — Core only, with Keys + Fund actions */}
            {faucet && (
              <div className="rounded-xl border border-cfx-500/30 bg-cfx-900/10 p-5 shadow-inner">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cfx-400">
                      Faucet Account (Node Admin)
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium text-slate-200">
                        {truncateHex(faucet.coreAddress)}
                      </code>
                      <CopyButton text={faucet.coreAddress} />
                    </div>
                    <div className="mt-1.5 text-xl font-semibold text-white">
                      {faucet.coreBalance}{' '}
                      <span className="text-sm font-normal text-slate-400">
                        CFX
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Button
                      variant="outline"
                      className="border-cfx-500/30 text-cfx-200 hover:bg-cfx-900/30 hover:text-white"
                      title="Toggle private key visibility"
                      onClick={() => setShowKeys((v) => !v)}
                    >
                      {showKeys ? (
                        <EyeOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      Keys
                    </Button>
                    <Button
                      className="bg-cfx-600 hover:bg-cfx-500 text-white shadow-lg shadow-cfx-500/20"
                      onClick={() => setShowFund(true)}
                    >
                      <Droplets className="mr-2 h-4 w-4" /> Fund Address
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts table */}
            {accountsLoading ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                Loading accounts…
              </p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Core Address</th>
                        <th className="px-4 py-3 text-left">eSpace Address</th>
                        <th className="px-4 py-3 text-right">Core CFX</th>
                        <th className="px-4 py-3 text-right">eSpace CFX</th>
                        {showKeys && (
                          <th className="px-4 py-3 text-left">Private Key</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {displayedAccounts.map((a: AccountInfo) => (
                        <tr
                          key={a.index}
                          className="hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {a.index}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-[13px] text-blue-300 font-medium whitespace-nowrap">
                                {truncateHex(a.coreAddress)}
                              </code>
                              <CopyButton text={a.coreAddress} small />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-[13px] text-blue-300 font-medium whitespace-nowrap">
                                {truncateHex(a.evmAddress)}
                              </code>
                              <CopyButton text={a.evmAddress} small />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] font-medium text-slate-200">
                            {a.coreBalance || '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] font-medium text-slate-200">
                            {a.evmBalance || '—'}
                          </td>
                          {showKeys && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <code className="text-[13px] text-slate-400 whitespace-nowrap">
                                  {truncateHex(a.privateKey)}
                                </code>
                                <CopyButton text={a.privateKey} small />
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {accounts.length > 5 && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setExpandedAccounts((v) => !v)}
                  >
                    {expandedAccounts ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4 focus:outline-none" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4 focus:outline-none" />
                        Show all {accounts.length} accounts
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Security Info ─────────────────────────────────────────── */}
      <SecurityPanel />

      {/* ── Error display ─────────────────────────────────────────── */}
      {(startMutation.error ||
        stopMutation.error ||
        restartMutation.error ||
        restartWipeMutation.error ||
        wipeMutation.error) && (
        <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">
          {String(
            startMutation.error ??
              stopMutation.error ??
              restartMutation.error ??
              restartWipeMutation.error ??
              wipeMutation.error
          )}
        </div>
      )}
    </div>
  );
}
