'use client';

import Editor from '@monaco-editor/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  FileCode2,
  Hammer,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  type AccountInfo,
  accountsApi,
  type BootstrapDeployableEntry,
  type BootstrapEntry,
  bootstrapApi,
  type CallResult,
  type CompileResult,
  type ContractTemplate,
  contractsApi,
  nodeApi,
  type StoredContract,
} from '@/lib/api';

const DEFAULT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message = "Hello, Conflux!";

    function setMessage(string calldata _msg) external {
        message = _msg;
    }
}
`;

// Static per-template metadata (tags, constructor hint) displayed in the UI
const TEMPLATE_META: Record<
  string,
  {
    tags: string[];
    ctor?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }
> = {
  HelloWorld: {
    tags: ['state', 'string'],
    ctor: 'none',
    difficulty: 'beginner',
  },
  SimpleStorage: {
    tags: ['state', 'ownership', 'events'],
    ctor: 'initialValue (uint256)',
    difficulty: 'beginner',
  },
  Counter: {
    tags: ['state', 'ownership', 'events', 'modifier'],
    ctor: 'none',
    difficulty: 'beginner',
  },
  TestToken: {
    tags: ['ERC-20', 'token', 'mint', 'burn'],
    ctor: 'name, symbol, initialSupply',
    difficulty: 'beginner',
  },
  BasicNFT: {
    tags: ['ERC-721', 'NFT', 'token', 'approval'],
    ctor: 'name, symbol',
    difficulty: 'intermediate',
  },
  Voting: {
    tags: ['governance', 'struct', 'delegation'],
    ctor: 'proposalNames (string[])',
    difficulty: 'intermediate',
  },
  Escrow: {
    tags: ['payments', 'payable', 'state machine'],
    ctor: 'arbiter (address), beneficiary (address)',
    difficulty: 'intermediate',
  },
  MultiSigWallet: {
    tags: ['multisig', 'governance', 'wallet'],
    ctor: 'owners (address[]), required (uint256)',
    difficulty: 'advanced',
  },
  Registry: {
    tags: ['registry', 'mapping', 'hashing'],
    ctor: 'none',
    difficulty: 'intermediate',
  },
};

const DIFFICULTY_COLOR = {
  beginner: 'text-green-400 bg-green-900/30 border-green-800',
  intermediate: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  advanced: 'text-orange-400 bg-orange-900/30 border-orange-800',
};

// ── ABI types ──────────────────────────────────────────────────────────────
interface AbiFunction {
  type: string;
  name?: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
  stateMutability?: string;
}

// ── Per-function call form ───────────────────────────────────────────────────
function FunctionCallForm({
  fn,
  contractId,
  chain,
  accounts,
  isRead,
}: {
  fn: AbiFunction;
  contractId: string;
  chain: 'evm' | 'core';
  accounts: AccountInfo[];
  isRead: boolean;
}) {
  const [args, setArgs] = useState<string[]>(fn.inputs?.map(() => '') ?? []);
  const [accountIndex, setAccountIndex] = useState(0);
  const [result, setResult] = useState<
    null | { ok: true; value: CallResult } | { ok: false; error: string }
  >(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      // Parse each arg: try JSON.parse first, fall back to raw string
      const parsed = args.map((a) => {
        if (a.trim() === '') return '';
        try {
          return JSON.parse(a);
        } catch {
          return a;
        }
      });
      const r = await contractsApi.call(
        contractId,
        fn.name ?? '',
        parsed,
        isRead ? undefined : accountIndex
      );
      setResult({ ok: true, value: r });
    } catch (e: unknown) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border border-[#2a3147] bg-[#0d1117]/40 p-3 space-y-2">
      <div className="font-mono text-sm text-white">
        {fn.name}
        <span className="ml-1 text-slate-500 text-xs">
          ({fn.inputs?.map((i) => i.type).join(', ') ?? ''})
          {fn.outputs && fn.outputs.length > 0
            ? ` → ${fn.outputs.map((o) => o.type).join(', ')}`
            : ''}
        </span>
      </div>

      {(fn.inputs?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          {(fn.inputs ?? []).map((input, i) => (
            <div key={`${input.name}-${i}`}>
              <label className="label">
                {input.name || `arg${i}`}{' '}
                <span className="text-slate-600">({input.type})</span>
              </label>
              <input
                className="input"
                placeholder={input.type}
                value={args[i]}
                onChange={(e) =>
                  setArgs((prev) => {
                    const a = [...prev];
                    a[i] = e.target.value;
                    return a;
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {!isRead && accounts.length > 0 && (
        <div>
          <label className="label">Caller account</label>
          <select
            className="input"
            value={accountIndex}
            onChange={(e) => setAccountIndex(Number(e.target.value))}
          >
            {accounts.map((acc) => (
              <option key={acc.index} value={acc.index}>
                #{acc.index} —{' '}
                {chain === 'evm' ? acc.evmAddress : acc.coreAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        className={isRead ? 'btn-secondary' : 'btn-primary'}
        disabled={loading}
        onClick={submit}
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {isRead ? 'Reading…' : 'Sending…'}
          </span>
        ) : isRead ? (
          'Call'
        ) : (
          'Send'
        )}
      </button>

      {result && (
        <pre
          className={`text-xs font-mono break-all whitespace-pre-wrap p-2 rounded ${
            result.ok
              ? 'bg-[#0d1117] text-green-300'
              : 'bg-red-950/50 text-red-400'
          }`}
        >
          {result.ok ? JSON.stringify(result.value, null, 2) : result.error}
        </pre>
      )}
    </div>
  );
}

// ── Contract interaction panel ────────────────────────────────────────────────
function ContractInteractPanel({
  contract,
  accounts,
}: {
  contract: StoredContract;
  accounts: AccountInfo[];
}) {
  const abiFs = (contract.abi as AbiFunction[]).filter(
    (f) => f.type === 'function'
  );
  const reads = abiFs.filter(
    (f) => f.stateMutability === 'view' || f.stateMutability === 'pure'
  );
  const writes = abiFs.filter(
    (f) => f.stateMutability !== 'view' && f.stateMutability !== 'pure'
  );

  return (
    <div className="mt-3 pt-3 border-t border-[#2a3147] space-y-4">
      {reads.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-green-500">
              Read
            </span>
            <span className="text-[10px] text-slate-600">
              (view / pure — no tx required)
            </span>
          </div>
          <div className="space-y-2">
            {reads.map((fn) => (
              <FunctionCallForm
                key={fn.name}
                fn={fn}
                contractId={contract.id}
                chain={contract.chain}
                accounts={accounts}
                isRead
              />
            ))}
          </div>
        </div>
      )}
      {writes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-400">
              Write
            </span>
            <span className="text-[10px] text-slate-600">
              (state-changing — sends a tx + auto-mines)
            </span>
          </div>
          <div className="space-y-2">
            {writes.map((fn) => (
              <FunctionCallForm
                key={fn.name}
                fn={fn}
                contractId={contract.id}
                chain={contract.chain}
                accounts={accounts}
                isRead={false}
              />
            ))}
          </div>
        </div>
      )}
      {abiFs.length === 0 && (
        <p className="text-sm text-slate-500">
          No callable functions found in ABI.
        </p>
      )}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      className="ml-1 rounded p-0.5 text-slate-500 hover:text-slate-300"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? (
        <CheckCheck className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

export default function ContractsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<
    'templates' | 'custom' | 'deployed' | 'bootstrap'
  >('templates');
  // ── Bootstrap state ───────────────────────────────────────────────────────
  const [bootstrapDeploy, setBootstrapDeploy] =
    useState<BootstrapDeployableEntry | null>(null);
  const [bootstrapArgs, setBootstrapArgs] = useState<string[]>([]);
  const [bootstrapChain, setBootstrapChain] = useState<'evm' | 'core'>('evm');
  const [bootstrapAccountIndex, setBootstrapAccountIndex] = useState(0);
  const [bootstrapResult, setBootstrapResult] = useState('');
  const [bootstrapCategoryFilter, setBootstrapCategoryFilter] =
    useState<string>('all');
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [contractName, setContractName] = useState('HelloWorld');
  const [compiled, setCompiled] = useState<CompileResult | null>(null);
  const [deployChain, setDeployChain] = useState<'evm' | 'core'>('evm');
  const [deployAccountIndex, setDeployAccountIndex] = useState(0);
  const [deployConstructorArgs, setDeployConstructorArgs] = useState<string[]>(
    []
  );
  const [deployResult, setDeployResult] = useState('');
  const [loadError, setLoadError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: nodeStatus } = useQuery({
    queryKey: ['node', 'status'],
    queryFn: nodeApi.status,
    refetchInterval: 3000,
  });

  const nodeRunning = nodeStatus?.server === 'running';

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.list,
    enabled: nodeRunning,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['contracts', 'templates'],
    queryFn: contractsApi.templates,
  });

  const { data: deployed = [], isLoading: deployedLoading } = useQuery({
    queryKey: ['contracts', 'deployed'],
    queryFn: () => contractsApi.deployed(),
    refetchInterval: 5000,
  });

  const { data: bootstrapCatalog = [] } = useQuery({
    queryKey: ['bootstrap', 'catalog'],
    queryFn: bootstrapApi.catalog,
    staleTime: 60_000,
  });

  const compileMutation = useMutation({
    mutationFn: () => contractsApi.compile(source, contractName),
    onSuccess: (d) => {
      setCompiled(d);
      // Reset constructor arg inputs to match new ABI
      const ctorInputs =
        (d.abi as AbiFunction[]).find((e) => e.type === 'constructor')
          ?.inputs ?? [];
      setDeployConstructorArgs(ctorInputs.map(() => ''));
      setDeployResult('');
    },
  });

  const deployMutation = useMutation({
    mutationFn: () => {
      if (!compiled) throw new Error('Compile first');
      if (!nodeRunning)
        throw new Error(
          'Node is not running. Start it from the Dashboard first.'
        );
      // Map per-param string inputs to parsed values
      const ctorInputs =
        (compiled.abi as AbiFunction[]).find((e) => e.type === 'constructor')
          ?.inputs ?? [];
      const args: unknown[] = ctorInputs.map((_input, i) => {
        const raw = (deployConstructorArgs[i] ?? '').trim();
        if (!raw) return '';
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      });
      return contractsApi.deploy({
        bytecode: compiled.bytecode,
        abi: compiled.abi,
        args,
        chain: deployChain,
        accountIndex: deployAccountIndex,
        contractName: compiled.contractName,
      });
    },
    onSuccess: (d) => {
      setDeployResult(`✓ Deployed at ${d.address} (tx: ${d.txHash})`);
      qc.invalidateQueries({ queryKey: ['contracts', 'deployed'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setDeployResult(`✗ ${msg}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contractsApi.deleteDeployed,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['contracts', 'deployed'] }),
  });

  const bootstrapDeployMutation = useMutation({
    mutationFn: () => {
      if (!bootstrapDeploy) throw new Error('No contract selected');
      if (!nodeRunning)
        throw new Error(
          'Node is not running. Start it from the Dashboard first.'
        );
      const args: unknown[] = (bootstrapDeploy.constructorArgs ?? []).map(
        (_argDef, i) => {
          const raw = (bootstrapArgs[i] ?? '').trim();
          if (!raw) return '';
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
      );
      return bootstrapApi.deploy({
        name: bootstrapDeploy.name,
        args,
        chain: bootstrapChain,
        accountIndex: bootstrapAccountIndex,
      });
    },
    onSuccess: (d) => {
      setBootstrapResult(`✓ Deployed at ${d.address} (tx: ${d.txHash})`);
      qc.invalidateQueries({ queryKey: ['contracts', 'deployed'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setBootstrapResult(`✗ ${msg}`);
    },
  });

  async function loadTemplate(name: string) {
    setLoadError('');
    try {
      const t = await contractsApi.template(name);
      setSource(t.source);
      setContractName(name);
      setTab('custom');
      setCompiled(null);
      setDeployResult('');

      // Flash a little success state (optional, just good UX feel)
      const btn = document.getElementById(`btn-use-${name}`);
      if (btn) {
        const oldText = btn.innerText;
        btn.innerText = 'Loaded!';
        btn.classList.add('text-cfx-400');
        setTimeout(() => {
          btn.innerText = oldText;
          btn.classList.remove('text-cfx-400');
        }, 1500);
      }
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load template');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Contracts</h1>
        <p className="mt-1 text-sm text-slate-400">
          Compile, deploy, and track Solidity contracts
        </p>
      </div>

      {/* Node not running warning */}
      {nodeStatus && !nodeRunning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-800 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Node is not running — deploy will fail. Start the node from the
          Dashboard.
        </div>
      )}

      {loadError && (
        <div className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-400">
          {loadError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[#2a3147] bg-[#161b27] p-1 w-fit">
        {(['templates', 'custom', 'deployed', 'bootstrap'] as const).map(
          (t) => (
            <button
              key={t}
              type="button"
              className={`rounded-md px-4 py-1.5 text-sm capitalize transition-colors ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'deployed'
                ? `Deployed${deployed.length > 0 ? ` (${deployed.length})` : ''}`
                : t === 'bootstrap'
                  ? 'Bootstrap'
                  : t}
            </button>
          )
        )}
      </div>

      {/* ── Templates ── */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Click <span className="text-slate-300">Use</span> to load a template
            into the Editor. All contracts are pure Solidity — no external
            dependencies.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(templates as ContractTemplate[]).map((tpl) => {
              const meta = TEMPLATE_META[tpl.name];
              return (
                <div key={tpl.name} className="card flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <FileCode2 className="h-4 w-4 shrink-0 text-blue-400" />
                        <span className="text-sm font-semibold text-white">
                          {tpl.name}
                        </span>
                        {meta && (
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${DIFFICULTY_COLOR[meta.difficulty]}`}
                          >
                            {meta.difficulty}
                          </span>
                        )}
                      </div>
                      {tpl.description && (
                        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}
                    </div>
                    <Button
                      id={`btn-use-${tpl.name}`}
                      variant="secondary"
                      size="sm"
                      className="shrink-0 text-xs transition-all"
                      onClick={() => loadTemplate(tpl.name)}
                    >
                      Use template
                    </Button>
                  </div>

                  {/* Tags */}
                  {meta?.tags && (
                    <div className="flex flex-wrap gap-1">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[#1e2535] px-1.5 py-0.5 text-[10px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Constructor hint */}
                  {meta?.ctor && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-mono text-slate-600">
                        constructor
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono">{meta.ctor}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Custom / Editor ── */}
      {tab === 'custom' && (
        <div className="space-y-4">
          {/* Editor */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-200">
              Solidity Source
            </Label>
            <div className="h-[500px] rounded-lg border border-slate-800 overflow-hidden shadow-sm">
              <Editor
                height="100%"
                defaultLanguage="solidity"
                theme="vs-dark"
                value={source}
                onChange={(val) => {
                  setSource(val || '');
                  setCompiled(null);
                }}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  tabSize: 4,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  fontFamily:
                    "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
                }}
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="w-48">
              <label className="label">Contract Name</label>
              <input
                className="input"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={compileMutation.isPending}
              onClick={() => compileMutation.mutate()}
            >
              <Hammer className="h-4 w-4" />
              {compileMutation.isPending ? 'Compiling…' : 'Compile'}
            </button>
          </div>

          {compileMutation.error && (
            <div className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {compileMutation.error.message}
            </div>
          )}

          {/* Deploy section */}
          {compiled &&
            (() => {
              const ctorInputs =
                (compiled.abi as AbiFunction[]).find(
                  (e) => e.type === 'constructor'
                )?.inputs ?? [];
              const missingRequired = ctorInputs.some(
                (_inp, i) => !(deployConstructorArgs[i] ?? '').trim()
              );
              return (
                <div className="card space-y-3">
                  <div className="text-sm font-medium text-green-400">
                    ✓ Compiled: {compiled.contractName} ({compiled.abi.length}{' '}
                    ABI entries)
                  </div>

                  {/* Constructor args — one labeled input per parameter */}
                  {ctorInputs.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-400">
                        Constructor arguments
                      </div>
                      {ctorInputs.map((inp, i) => (
                        <div key={`${inp.name}-${i}`}>
                          <label className="label">
                            {inp.name || `arg${i}`}{' '}
                            <span className="text-slate-600">({inp.type})</span>
                          </label>
                          <input
                            className="input"
                            placeholder={inp.type}
                            value={deployConstructorArgs[i] ?? ''}
                            onChange={(e) =>
                              setDeployConstructorArgs((prev) => {
                                const a = [...prev];
                                a[i] = e.target.value;
                                return a;
                              })
                            }
                          />
                        </div>
                      ))}
                      {missingRequired && (
                        <div className="flex items-start gap-2 rounded border border-yellow-800 bg-yellow-950/40 px-3 py-2 text-xs text-yellow-400">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            Fill all constructor arguments before deploying.
                            Missing:{' '}
                            {ctorInputs
                              .filter(
                                (_inp, i) =>
                                  !(deployConstructorArgs[i] ?? '').trim()
                              )
                              .map(
                                (inp, _i, _arr) =>
                                  `${inp.name || 'arg'} (${inp.type})`
                              )
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      No constructor arguments required.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <div>
                      <label className="label">Chain</label>
                      <select
                        className="input"
                        value={deployChain}
                        onChange={(e) =>
                          setDeployChain(e.target.value as 'evm' | 'core')
                        }
                      >
                        <option value="evm">EVM (eSpace)</option>
                        <option value="core">Core Space</option>
                      </select>
                    </div>
                    {nodeRunning && (accounts as AccountInfo[]).length > 0 && (
                      <div className="flex-1 min-w-[200px]">
                        <label className="label">Deployer account</label>
                        <select
                          className="input"
                          value={deployAccountIndex}
                          onChange={(e) =>
                            setDeployAccountIndex(Number(e.target.value))
                          }
                        >
                          {(accounts as AccountInfo[]).map((acc) => (
                            <option key={acc.index} value={acc.index}>
                              #{acc.index} —{' '}
                              {deployChain === 'evm'
                                ? acc.evmAddress
                                : acc.coreAddress}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={
                          deployMutation.isPending ||
                          !nodeRunning ||
                          (ctorInputs.length > 0 && missingRequired)
                        }
                        title={
                          !nodeRunning
                            ? 'Start the node first'
                            : missingRequired
                              ? 'Fill all constructor arguments first'
                              : undefined
                        }
                        onClick={() => deployMutation.mutate()}
                      >
                        <Upload className="h-4 w-4" />
                        {deployMutation.isPending ? 'Deploying…' : 'Deploy'}
                      </button>
                    </div>
                  </div>
                  {deployResult && (
                    <p
                      className={`break-all text-sm ${
                        deployResult.startsWith('✓')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {deployResult}
                    </p>
                  )}
                </div>
              );
            })()}
        </div>
      )}

      {/* ── Deployed ── */}
      {tab === 'deployed' && (
        <div className="space-y-3">
          {deployedLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : deployed.length === 0 ? (
            <div className="card text-center text-sm text-slate-500 py-8">
              No deployed contracts yet. Deploy one from the Editor tab.
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Contracts are persisted per wallet in the node data directory.
                They survive node restarts (but not Wipe &amp; Restart).
              </p>
              <div className="space-y-2">
                {(deployed as StoredContract[]).map((c) => {
                  const isExpanded = expanded.has(c.id);
                  const rpcUrl =
                    c.chain === 'evm'
                      ? 'http://localhost:8545'
                      : 'http://localhost:12537';
                  return (
                    <div key={c.id} className="card space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <FileCode2 className="h-4 w-4 text-blue-400" />
                            {c.name}
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                                c.chain === 'evm'
                                  ? 'bg-purple-900/50 text-purple-300'
                                  : 'bg-cyan-900/50 text-cyan-300'
                              }`}
                            >
                              {c.chain === 'evm' ? 'eSpace' : 'Core'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <code className="max-w-[300px] truncate text-xs text-blue-300">
                              {c.address}
                            </code>
                            <CopyBtn text={c.address} />
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-[10px] text-slate-500">
                            <span>Chain ID: {c.chainId}</span>
                            <span>•</span>
                            <span>
                              {new Date(c.deployedAt).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>{c.abi.length} ABI entries</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {/* Copy RPC URL — replaces the broken ExternalLink button */}
                          <div title={`Copy JSON-RPC URL: ${rpcUrl}`}>
                            <CopyBtn text={rpcUrl} />
                          </div>
                          <span className="text-[10px] text-slate-600 -ml-0.5 mr-1">
                            RPC
                          </span>
                          <button
                            type="button"
                            title="Remove from tracking"
                            className="rounded p-1 text-slate-500 hover:text-red-400"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#2a3147] pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500">
                            tx:
                          </span>
                          <code className="max-w-[240px] truncate text-[10px] text-slate-400">
                            {c.txHash}
                          </code>
                          <CopyBtn text={c.txHash} />
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-400 hover:text-white hover:bg-[#2a3147] transition-colors"
                          onClick={() =>
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id);
                              else next.add(c.id);
                              return next;
                            })
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Close
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Interact
                            </>
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <ContractInteractPanel
                          contract={c}
                          accounts={accounts as AccountInfo[]}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Bootstrap ── */}
      {tab === 'bootstrap' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Production-ready contracts from the{' '}
            <span className="text-slate-300">@cfxdevkit/contracts</span>{' '}
            library. Select a contract, fill in any constructor arguments, then
            deploy directly — no compilation step required.
          </p>

          {/* Category filter */}
          {bootstrapCatalog.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {[
                'all',
                ...Array.from(
                  new Set(
                    (bootstrapCatalog as BootstrapEntry[])
                      .filter(
                        (e): e is BootstrapDeployableEntry =>
                          e.type === 'deployable'
                      )
                      .map((e) => e.category)
                  )
                ),
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBootstrapCategoryFilter(cat)}
                  className={`rounded px-2.5 py-0.5 text-xs capitalize transition-colors ${
                    bootstrapCategoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'border border-[#2a3147] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Deployable contracts */}
            {(bootstrapCatalog as BootstrapEntry[])
              .filter(
                (e): e is BootstrapDeployableEntry =>
                  e.type === 'deployable' &&
                  (bootstrapCategoryFilter === 'all' ||
                    e.category === bootstrapCategoryFilter)
              )
              .map((e) => {
                const isSelected = bootstrapDeploy?.name === e.name;
                return (
                  <div
                    key={e.name}
                    className={`card space-y-3 cursor-pointer transition-shadow ${
                      isSelected ? 'ring-1 ring-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        setBootstrapDeploy(e);
                        setBootstrapArgs(
                          (e.constructorArgs ?? []).map(() => '')
                        );
                        setBootstrapChain(e.chains[0] ?? 'evm');
                        setBootstrapAccountIndex(0);
                        setBootstrapResult('');
                      }
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">
                            {e.name}
                          </span>
                          <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider border-slate-700 text-slate-400">
                            {e.category}
                          </span>
                          {e.chains.map((c) => (
                            <span
                              key={c}
                              className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                                c === 'evm'
                                  ? 'border-violet-800 text-violet-400'
                                  : 'border-cyan-800 text-cyan-400'
                              }`}
                            >
                              {c === 'evm' ? 'eSpace' : 'Core'}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {e.description}
                        </p>
                      </div>
                    </div>

                    {/* Deploy form — only visible when selected */}
                    {isSelected && (
                      <div
                        className="space-y-3 pt-1 border-t border-[#2a3147]"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {/* Constructor args */}
                        {(e.constructorArgs ?? []).length > 0 && (
                          <div className="space-y-1.5">
                            {(e.constructorArgs ?? []).map((arg, i) => (
                              <div key={arg.name}>
                                <label className="label">
                                  {arg.name}{' '}
                                  <span className="text-slate-600">
                                    ({arg.type})
                                  </span>
                                </label>
                                <input
                                  className="input"
                                  placeholder={arg.placeholder ?? arg.type}
                                  value={bootstrapArgs[i] ?? ''}
                                  onChange={(ev) =>
                                    setBootstrapArgs((prev) => {
                                      const next = [...prev];
                                      next[i] = ev.target.value;
                                      return next;
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Chain + account + deploy row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {e.chains.length > 1 && (
                            <select
                              className="input w-auto"
                              value={bootstrapChain}
                              onChange={(ev) =>
                                setBootstrapChain(
                                  ev.target.value as 'evm' | 'core'
                                )
                              }
                            >
                              {e.chains.map((c) => (
                                <option key={c} value={c}>
                                  {c === 'evm' ? 'eSpace' : 'Core Space'}
                                </option>
                              ))}
                            </select>
                          )}

                          {(accounts as AccountInfo[]).length > 0 && (
                            <select
                              className="input flex-1"
                              value={bootstrapAccountIndex}
                              onChange={(ev) =>
                                setBootstrapAccountIndex(
                                  Number(ev.target.value)
                                )
                              }
                            >
                              {(accounts as AccountInfo[]).map((acc) => (
                                <option key={acc.index} value={acc.index}>
                                  #{acc.index} —{' '}
                                  {bootstrapChain === 'evm'
                                    ? `${acc.evmAddress.slice(0, 10)}…`
                                    : `${acc.coreAddress.slice(0, 10)}…`}
                                </option>
                              ))}
                            </select>
                          )}

                          <button
                            type="button"
                            className="btn-primary shrink-0"
                            disabled={
                              bootstrapDeployMutation.isPending || !nodeRunning
                            }
                            title={
                              !nodeRunning ? 'Start the node first' : undefined
                            }
                            onClick={() => {
                              setBootstrapResult('');
                              bootstrapDeployMutation.mutate();
                            }}
                          >
                            <Upload className="h-4 w-4" />
                            {bootstrapDeployMutation.isPending
                              ? 'Deploying…'
                              : 'Deploy'}
                          </button>
                        </div>

                        {bootstrapResult && (
                          <p
                            className={`break-all text-xs ${
                              bootstrapResult.startsWith('✓')
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {bootstrapResult}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Precompiles section */}
            {(bootstrapCatalog as BootstrapEntry[]).filter(
              (e) => e.type === 'precompile'
            ).length > 0 &&
              (bootstrapCategoryFilter === 'all' ||
                bootstrapCategoryFilter === 'precompile') && (
                <div className="col-span-full space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Core Space Precompiles
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(bootstrapCatalog as BootstrapEntry[])
                      .filter((e) => e.type === 'precompile')
                      .map((entry) => (
                        <div key={entry.name} className="card">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {entry.name}
                            </span>
                            <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider border-cyan-800 text-cyan-400">
                              precompile
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {entry.description}
                          </p>
                          {'address' in entry && entry.address && (
                            <code className="mt-2 block text-xs text-blue-300">
                              {String(entry.address)}
                            </code>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
