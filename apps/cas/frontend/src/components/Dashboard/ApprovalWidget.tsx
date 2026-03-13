'use client';

/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * ApprovalWidget — modal panel showing per-token ERC-20 allowances granted to
 * the AutomationManager, broken down by active jobs, with Revoke / Set Exact.
 */

import type {
  DCAJob,
  Job,
  LimitOrderJob,
} from '@cfxdevkit/executor/automation';
import { useAuthContext } from '@cfxdevkit/wallet-connect';
import { ChevronDown, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Address, createPublicClient, formatUnits, http } from 'viem';
import { confluxESpace, confluxESpaceTestnet } from 'viem/chains';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import {
  AUTOMATION_MANAGER_ADDRESS,
  ERC20_ABI,
  MAX_UINT256,
} from '../../lib/contracts';

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;
const CACHE_KEY = 'cas_pool_meta_v2';

interface TokenMeta {
  symbol: string;
  decimals: number;
  logoURI?: string;
}

function loadTokenCache(): Map<string, TokenMeta> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    const c = JSON.parse(raw) as {
      tokens: Array<{
        address: string;
        symbol: string;
        decimals: number;
        logoURI?: string;
      }>;
    };
    return new Map(
      c.tokens.map((t) => [
        t.address.toLowerCase(),
        { symbol: t.symbol, decimals: t.decimals ?? 18, logoURI: t.logoURI },
      ])
    );
  } catch {
    return new Map();
  }
}

function makeReadClient() {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'testnet') as
    | 'testnet'
    | 'mainnet';
  const rpcUrl =
    network === 'testnet'
      ? 'https://evmtestnet.confluxrpc.com'
      : 'https://evm.confluxrpc.com';
  const chain = network === 'testnet' ? confluxESpaceTestnet : confluxESpace;
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

interface TokenAllowanceRow {
  token: string;
  meta: TokenMeta;
  allowance: bigint;
  committed: bigint;
  jobs: { id: string; type: string; amount: bigint; status: string }[];
}

function fmtBig(val: bigint, decimals: number): string {
  if (val >= MAX_UINT256 / 2n) return '∞ (unlimited)';
  const n = Number(formatUnits(val, decimals));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  if (n === 0) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function committedForJob(job: Job): bigint {
  if (job.type === 'limit_order') {
    return BigInt(String((job as LimitOrderJob).params.amountIn));
  }
  const dca = job as DCAJob;
  const remaining = Math.max(
    0,
    dca.params.totalSwaps - dca.params.swapsCompleted
  );
  return BigInt(String(dca.params.amountPerSwap)) * BigInt(remaining);
}

function tokenInOf(job: Job): string {
  if (job.type === 'limit_order') return (job as LimitOrderJob).params.tokenIn;
  return (job as DCAJob).params.tokenIn;
}

const TERMINAL = new Set(['executed', 'cancelled', 'failed']);

export function ApprovalWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const { token } = useAuthContext();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [allowances, setAllowances] = useState<Map<string, bigint>>(new Map());
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const tokenCache = useMemo(() => loadTokenCache(), []);

  const refresh = useCallback(async () => {
    if (!address || !token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { jobs?: Job[] };
      const allJobs = data.jobs ?? [];
      const activeJobs = allJobs.filter((j) => !TERMINAL.has(j.status));
      setJobs(activeJobs);

      const uniqueTokens = [
        ...new Set(allJobs.map((j) => tokenInOf(j).toLowerCase())),
      ];

      if (uniqueTokens.length > 0) {
        const client = makeReadClient();
        const results = await client.multicall({
          contracts: uniqueTokens.map((t) => ({
            address: t as Address,
            abi: ERC20_ABI,
            functionName: 'allowance' as const,
            args: [address, AUTOMATION_MANAGER_ADDRESS],
          })),
          allowFailure: true,
          multicallAddress: MULTICALL3,
        });

        const newAllowances = new Map<string, bigint>();
        uniqueTokens.forEach((t, i) => {
          const r = results[i];
          if (r?.status === 'success') {
            newAllowances.set(t, r.result as bigint);
          }
        });
        setAllowances(newAllowances);
      }
    } finally {
      setLoading(false);
    }
  }, [address, token]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const rows = useMemo<TokenAllowanceRow[]>(() => {
    const byToken = new Map<string, TokenAllowanceRow>();

    for (const [tok, allow] of allowances) {
      if (allow === 0n && !jobs.some((j) => tokenInOf(j).toLowerCase() === tok))
        continue;
      const meta = tokenCache.get(tok) ?? {
        symbol: `${tok.slice(0, 6)}…`,
        decimals: 18,
      };
      byToken.set(tok, {
        token: tok,
        meta,
        allowance: allow,
        committed: 0n,
        jobs: [],
      });
    }

    for (const j of jobs) {
      const tok = tokenInOf(j).toLowerCase();
      if (!byToken.has(tok)) {
        const meta = tokenCache.get(tok) ?? {
          symbol: `${tok.slice(0, 6)}…`,
          decimals: 18,
        };
        byToken.set(tok, {
          token: tok,
          meta,
          allowance: allowances.get(tok) ?? 0n,
          committed: 0n,
          jobs: [],
        });
      }
      const row = byToken.get(tok);
      if (!row) continue;
      const amt = committedForJob(j);
      row.committed += amt;
      row.jobs.push({
        id: j.id,
        type: j.type === 'limit_order' ? 'Limit' : 'DCA',
        amount: amt,
        status: j.status,
      });
    }

    return [...byToken.values()].sort((a, b) => {
      if (a.committed > 0n && b.committed === 0n) return -1;
      if (a.committed === 0n && b.committed > 0n) return 1;
      return a.meta.symbol.localeCompare(b.meta.symbol);
    });
  }, [jobs, allowances, tokenCache]);

  const doApprove = useCallback(
    async (tokenAddr: string, amount: bigint) => {
      if (!publicClient) return;
      setTxPending(tokenAddr);
      try {
        const hash = await writeContractAsync({
          address: tokenAddr as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [AUTOMATION_MANAGER_ADDRESS, amount],
        });
        await publicClient.waitForTransactionReceipt({
          hash,
          pollingInterval: 2_000,
          timeout: 120_000,
        });
        await refresh();
      } finally {
        setTxPending(null);
      }
    },
    [publicClient, writeContractAsync, refresh]
  );

  const toggleExpand = (tok: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(tok)) next.delete(tok);
      else next.add(tok);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Token Approvals"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-conflux-400" />
            Token Approvals
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-conflux-500 border-t-transparent animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No token approvals found.</p>
              <p className="text-xs mt-1 text-slate-600">
                Approvals are created when you set up strategies.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                <span>Token</span>
                <span>Allowance</span>
                <span>Committed</span>
                <span className="w-32 text-right">Actions</span>
              </div>
              {rows.map((row) => {
                const isExpanded = expanded.has(row.token);
                const isPending = txPending === row.token;
                const hasExcess =
                  row.allowance > row.committed && row.committed > 0n;
                const isStale = row.committed === 0n && row.allowance > 0n;
                const isUnderApproved =
                  row.committed > 0n && row.allowance < row.committed;

                return (
                  <div
                    key={row.token}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
                  >
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          row.jobs.length > 0 && toggleExpand(row.token)
                        }
                        className="flex items-center gap-2 text-left"
                      >
                        {row.jobs.length > 0 ? (
                          isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          )
                        ) : (
                          <span className="w-3.5" />
                        )}
                        {row.meta.logoURI ? (
                          // biome-ignore lint/performance/noImgElement: token logos from dynamic external URLs
                          <img
                            src={row.meta.logoURI}
                            alt={row.meta.symbol}
                            className="h-5 w-5 rounded-full bg-slate-800 ring-1 ring-slate-600/50 object-contain"
                          />
                        ) : (
                          <span className="h-5 w-5 rounded-full bg-slate-700 ring-1 ring-slate-600/50 shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-slate-200">
                          {row.meta.symbol}
                        </span>
                        {row.jobs.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            ({row.jobs.length}{' '}
                            {row.jobs.length === 1 ? 'job' : 'jobs'})
                          </span>
                        )}
                      </button>

                      <span
                        className={`text-sm font-medium ${
                          isUnderApproved
                            ? 'text-red-400'
                            : row.allowance === 0n
                              ? 'text-slate-600'
                              : 'text-slate-200'
                        }`}
                      >
                        {fmtBig(row.allowance, row.meta.decimals)}
                      </span>

                      <span
                        className={`text-sm font-medium ${
                          row.committed > 0n
                            ? 'text-blue-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {fmtBig(row.committed, row.meta.decimals)}
                      </span>

                      <div className="flex items-center gap-2 w-32 justify-end">
                        {isPending ? (
                          <span className="text-xs text-conflux-400 animate-pulse">
                            Confirming…
                          </span>
                        ) : (
                          <>
                            {(hasExcess || isUnderApproved) &&
                              row.committed > 0n && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void doApprove(row.token, row.committed)
                                  }
                                  className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-md hover:bg-blue-950/50"
                                >
                                  Set Exact
                                </button>
                              )}
                            {(row.allowance > 0n || isStale) && (
                              <button
                                type="button"
                                onClick={() => void doApprove(row.token, 0n)}
                                className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-md hover:bg-red-950/50"
                              >
                                Revoke
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded && row.jobs.length > 0 && (
                      <div className="border-t border-slate-800 px-4 py-2 space-y-1">
                        {row.jobs.map((j) => (
                          <div
                            key={j.id}
                            className="flex items-center justify-between text-xs text-slate-500"
                          >
                            <span className="font-mono">
                              {j.id.slice(0, 10)}… [{j.type}]
                            </span>
                            <span>
                              {fmtBig(j.amount, row.meta.decimals)}{' '}
                              <span
                                className={
                                  j.status === 'active'
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                }
                              >
                                {j.status}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
