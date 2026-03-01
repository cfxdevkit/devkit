'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Copy, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddNetworkButton } from '@/components/AddNetworkButton';
import { networkApi, nodeApi } from '@/lib/api';

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      className="rounded p-1 text-slate-500 hover:text-slate-300"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setC(true);
        setTimeout(() => setC(false), 1500);
      }}
    >
      {c ? (
        <CheckCheck className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

type ConfigDraft = {
  coreRpcPort: string;
  evmRpcPort: string;
  wsPort: string;
  evmWsPort: string;
  chainId: string;
  evmChainId: string;
};

export default function NetworkPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ConfigDraft | null>(null);
  const [saved, setSaved] = useState('');

  const { data: nodeStatus } = useQuery({
    queryKey: ['node', 'status'],
    queryFn: nodeApi.status,
    refetchInterval: 3000,
  });

  const { data: config } = useQuery({
    queryKey: ['network', 'config'],
    queryFn: networkApi.config,
  });

  const { data: rpcUrls } = useQuery({
    queryKey: ['network', 'rpc-urls'],
    queryFn: networkApi.rpcUrls,
  });

  useEffect(() => {
    if (config && !draft) {
      setDraft({
        coreRpcPort: String(config.coreRpcPort),
        evmRpcPort: String(config.evmRpcPort),
        wsPort: String(config.wsPort),
        evmWsPort: String(config.evmWsPort),
        chainId: String(config.chainId),
        evmChainId: String(config.evmChainId),
      });
    }
  }, [config, draft]);

  const updateMutation = useMutation({
    mutationFn: (d: ConfigDraft) =>
      networkApi.updateConfig({
        coreRpcPort: Number(d.coreRpcPort),
        evmRpcPort: Number(d.evmRpcPort),
        wsPort: Number(d.wsPort),
        evmWsPort: Number(d.evmWsPort),
        chainId: Number(d.chainId),
        evmChainId: Number(d.evmChainId),
      }),
    onSuccess: () => {
      setSaved('✓ Saved');
      setTimeout(() => setSaved(''), 2500);
      qc.invalidateQueries({ queryKey: ['network'] });
    },
    onError: (e) => setSaved(`✗ ${e.message}`),
  });

  const isRunning = nodeStatus?.server === 'running';

  const field = (label: string, key: keyof ConfigDraft) => (
    <div key={key}>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        disabled={isRunning}
        value={draft?.[key] ?? ''}
        onChange={(e) =>
          setDraft((d) => (d ? { ...d, [key]: e.target.value } : d))
        }
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Network</h1>
        <p className="mt-1 text-sm text-slate-400">
          RPC ports and chain IDs — editable only when node is stopped
        </p>
      </div>

      {isRunning && (
        <div className="rounded-md border border-yellow-800 bg-yellow-950/50 px-4 py-2 text-sm text-yellow-400">
          Stop the node before changing configuration.
        </div>
      )}

      {/* Config form */}
      {draft && (
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {field('Core RPC Port', 'coreRpcPort')}
            {field('EVM RPC Port', 'evmRpcPort')}
            {field('Core WS Port', 'wsPort')}
            {field('EVM WS Port', 'evmWsPort')}
            {field('Core Chain ID', 'chainId')}
            {field('EVM Chain ID', 'evmChainId')}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={isRunning || updateMutation.isPending}
              onClick={() => draft && updateMutation.mutate(draft)}
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            {saved && (
              <span
                className={`text-sm ${
                  saved.startsWith('✓') ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {saved}
              </span>
            )}
          </div>
        </div>
      )}

      {/* RPC URLs */}
      {rpcUrls && (
        <div className="card space-y-3">
          <h2 className="text-sm font-medium text-slate-300">
            Active RPC URLs
          </h2>
          {(
            [
              ['Core RPC', rpcUrls.core],
              ['EVM RPC', rpcUrls.evm],
              ['Core WebSocket', rpcUrls.coreWs],
              ['EVM WebSocket', rpcUrls.evmWs],
            ] as [string, string][]
          ).map(([label, url]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <span className="w-28 text-xs text-slate-500">{label}</span>
              <div className="flex flex-1 items-center overflow-hidden">
                <code className="flex-1 truncate rounded bg-[#0e1117] px-2 py-1 text-xs text-blue-300">
                  {url}
                </code>
                <CopyBtn text={url} />
              </div>
            </div>
          ))}

          {/* Add eSpace to browser wallet */}
          <div className="border-t border-[#2a3147] pt-3 flex justify-end">
            <AddNetworkButton
              evmChainId={config?.evmChainId}
              evmRpcUrl={rpcUrls?.evm}
              chainName="Conflux DevKit eSpace"
            />
          </div>
        </div>
      )}
    </div>
  );
}
