'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Copy, CheckCheck, Droplets, Eye, EyeOff } from 'lucide-react';
import { accountsApi, type AccountInfo } from '@/lib/api';

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      className="rounded p-0.5 text-slate-500 hover:text-slate-300"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setC(true);
        setTimeout(() => setC(false), 1500);
      }}
    >
      {c ? (
        <CheckCheck className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

function FundModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState<'core' | 'evm'>('evm');
  const [result, setResult] = useState('');

  const fundMutation = useMutation({
    mutationFn: () => accountsApi.fund(address, amount || undefined, chain),
    onSuccess: (d) => {
      setResult(`✓ tx: ${d.txHash}`);
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (e) => setResult(`✗ ${e.message}`),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md space-y-4">
        <h2 className="font-medium text-white">Fund Address</h2>
        <div>
          <label className="label">Address</label>
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x… or cfx:…"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Amount (optional)</label>
            <input
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <label className="label">Chain</label>
            <select
              className="input"
              value={chain}
              onChange={(e) => setChain(e.target.value as 'core' | 'evm')}
            >
              <option value="evm">EVM</option>
              <option value="core">Core</option>
            </select>
          </div>
        </div>
        {result && (
          <p className="text-sm text-slate-300">{result}</p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!address || fundMutation.isPending}
            onClick={() => fundMutation.mutate()}
          >
            {fundMutation.isPending ? 'Sending…' : 'Fund'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const [showKeys, setShowKeys] = useState(false);
  const [showFund, setShowFund] = useState(false);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.list,
  });

  const { data: faucet } = useQuery({
    queryKey: ['accounts', 'faucet'],
    queryFn: accountsApi.faucet,
  });

  return (
    <div className="space-y-6">
      {showFund && <FundModal onClose={() => setShowFund(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Accounts</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pre-funded development accounts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowKeys((v) => !v)}
            title="Toggle private key visibility"
          >
            {showKeys ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Keys
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowFund(true)}
          >
            <Droplets className="h-4 w-4" /> Fund
          </button>
        </div>
      </div>

      {/* Faucet card */}
      {faucet && (
        <div className="card">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Faucet Account
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500">Core</div>
              <div className="flex items-center gap-1">
                <code className="truncate text-xs text-blue-300">
                  {faucet.coreAddress}
                </code>
                <CopyBtn text={faucet.coreAddress} />
              </div>
              <div className="text-sm text-slate-300">{faucet.coreBalance} CFX</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">EVM</div>
              <div className="flex items-center gap-1">
                <code className="truncate text-xs text-blue-300">
                  {faucet.evmAddress}
                </code>
                <CopyBtn text={faucet.evmAddress} />
              </div>
              <div className="text-sm text-slate-300">{faucet.evmBalance} CFX</div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts table */}
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#2a3147]">
          <table className="w-full text-sm">
            <thead className="bg-[#161b27] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Core Address</th>
                <th className="px-4 py-2 text-left">EVM Address</th>
                <th className="px-4 py-2 text-right">Core Balance</th>
                <th className="px-4 py-2 text-right">EVM Balance</th>
                {showKeys && (
                  <th className="px-4 py-2 text-left">Private Key</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3147]">
              {accounts.map((a: AccountInfo) => (
                <tr
                  key={a.index}
                  className="bg-[#0e1117] transition-colors hover:bg-[#161b27]"
                >
                  <td className="px-4 py-2 text-slate-500">{a.index}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <code className="max-w-[200px] truncate text-xs text-blue-300">
                        {a.coreAddress}
                      </code>
                      <CopyBtn text={a.coreAddress} />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <code className="max-w-[160px] truncate text-xs text-blue-300">
                        {a.evmAddress}
                      </code>
                      <CopyBtn text={a.evmAddress} />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {a.coreBalance}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {a.evmBalance}
                  </td>
                  {showKeys && (
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <code className="max-w-[140px] truncate text-xs text-slate-400">
                          {a.privateKey}
                        </code>
                        <CopyBtn text={a.privateKey} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
