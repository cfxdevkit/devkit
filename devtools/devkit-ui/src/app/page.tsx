'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Copy, Play, Square, RotateCcw, CheckCheck } from 'lucide-react';
import { nodeApi } from '@/lib/api';
import { getSocket, type NodeStatusEvent } from '@/lib/socket';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className="btn-secondary ml-2 px-1.5 py-1" title="Copy">
      {copied ? (
        <CheckCheck className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const [rtStatus, setRtStatus] = useState<NodeStatusEvent | null>(null);

  const { data: status } = useQuery({
    queryKey: ['node', 'status'],
    queryFn: nodeApi.status,
  });

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

  const current = rtStatus ?? status;

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

  const isRunning = current?.server === 'running';
  const isBusy =
    current?.server === 'starting' ||
    current?.server === 'stopping' ||
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending;

  const dotClass = isRunning
    ? 'status-dot-green'
    : isBusy
      ? 'status-dot-yellow'
      : 'status-dot-red';

  const rpcUrls = current?.rpcUrls;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Local Conflux development node
        </p>
      </div>

      {/* Status card */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={dotClass} />
          <div>
            <div className="text-sm font-medium capitalize text-white">
              {current?.server ?? 'unknown'}
            </div>
            {isRunning && current?.epochNumber !== undefined && (
              <div className="text-xs text-slate-400">
                Epoch #{current.epochNumber}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              type="button"
              className="btn-success"
              disabled={isBusy}
              onClick={() => startMutation.mutate()}
            >
              <Play className="h-4 w-4" /> Start
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                disabled={isBusy}
                onClick={() => restartMutation.mutate()}
              >
                <RotateCcw className="h-4 w-4" /> Restart
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={isBusy}
                onClick={() => stopMutation.mutate()}
              >
                <Square className="h-4 w-4" /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* RPC URLs */}
      {rpcUrls && (
        <div className="card space-y-3">
          <h2 className="text-sm font-medium text-slate-300">RPC Endpoints</h2>
          {(
            [
              ['Core RPC', rpcUrls.core],
              ['EVM / ETH RPC', rpcUrls.evm],
              ['WebSocket', rpcUrls.ws],
            ] as const
          ).map(([label, url]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="w-32 text-xs text-slate-500">{label}</span>
              <div className="flex flex-1 items-center overflow-hidden">
                <code className="flex-1 truncate rounded bg-[#0e1117] px-2 py-1 text-xs text-blue-300">
                  {url}
                </code>
                <CopyButton text={url} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error display */}
      {(startMutation.error ||
        stopMutation.error ||
        restartMutation.error) && (
        <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">
          {String(
            startMutation.error ??
              stopMutation.error ??
              restartMutation.error,
          )}
        </div>
      )}
    </div>
  );
}
