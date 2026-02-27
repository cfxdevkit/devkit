'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Hammer, Play, Square, Zap } from 'lucide-react';
import { miningApi } from '@/lib/api';

export default function MiningPage() {
  const qc = useQueryClient();
  const [blocks, setBlocks] = useState('1');
  const [interval, setInterval] = useState('1000');
  const [mineResult, setMineResult] = useState('');

  const { data: status } = useQuery({
    queryKey: ['mining', 'status'],
    queryFn: miningApi.status,
    refetchInterval: 2000,
  });

  const mineMutation = useMutation({
    mutationFn: () => miningApi.mine(Number(blocks)),
    onSuccess: (d) => {
      setMineResult(`✓ Mined ${d.mined} block(s)`);
      qc.invalidateQueries({ queryKey: ['mining'] });
    },
    onError: (e) => setMineResult(`✗ ${e.message}`),
  });

  const startMutation = useMutation({
    mutationFn: () => miningApi.start(Number(interval)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mining'] }),
  });

  const stopMutation = useMutation({
    mutationFn: miningApi.stop,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mining'] }),
  });

  const isBusy =
    mineMutation.isPending ||
    startMutation.isPending ||
    stopMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Mining</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manually mine blocks or configure auto-mining
        </p>
      </div>

      {/* Current status */}
      <div className="card flex items-center gap-4">
        <div>
          <div className="label">Auto-mining</div>
          <span className={status?.enabled ? 'badge-green' : 'badge-gray'}>
            {status?.enabled ? 'On' : 'Off'}
          </span>
        </div>
        {status?.enabled && status.blockTime !== undefined && (
          <div>
            <div className="label">Block time</div>
            <span className="text-sm text-slate-300">{status.blockTime} ms</span>
          </div>
        )}
        <div>
          <div className="label">Latest Epoch</div>
          <span className="text-sm text-slate-300">
            {status?.latestEpoch ?? '—'}
          </span>
        </div>
      </div>

      {/* Manual mine */}
      <div className="card space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-white">
          <Hammer className="h-4 w-4 text-slate-400" /> Manual Mine
        </h2>
        <div className="flex items-end gap-3">
          <div className="w-32">
            <label className="label">Blocks</label>
            <input
              className="input"
              type="number"
              min="1"
              max="1000"
              value={blocks}
              onChange={(e) => setBlocks(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={isBusy}
            onClick={() => mineMutation.mutate()}
          >
            <Zap className="h-4 w-4" />
            {mineMutation.isPending ? 'Mining…' : 'Mine'}
          </button>
        </div>
        {mineResult && (
          <p
            className={`text-sm ${
              mineResult.startsWith('✓') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {mineResult}
          </p>
        )}
      </div>

      {/* Auto-mine toggle */}
      <div className="card space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-white">
          <Play className="h-4 w-4 text-slate-400" /> Auto-mining
        </h2>
        <div className="flex items-end gap-3">
          <div className="w-40">
            <label className="label">Interval (ms)</label>
            <input
              className="input"
              type="number"
              min="100"
              value={interval}
              disabled={status?.enabled}
              onChange={(e) => setInterval(e.target.value)}
            />
          </div>
          {!status?.enabled ? (
            <button
              type="button"
              className="btn-success"
              disabled={isBusy}
              onClick={() => startMutation.mutate()}
            >
              <Play className="h-4 w-4" /> Start Auto-mine
            </button>
          ) : (
            <button
              type="button"
              className="btn-danger"
              disabled={isBusy}
              onClick={() => stopMutation.mutate()}
            >
              <Square className="h-4 w-4" /> Stop Auto-mine
            </button>
          )}
        </div>
        {(startMutation.error || stopMutation.error) && (
          <p className="text-sm text-red-400">
            {String(startMutation.error ?? stopMutation.error)}
          </p>
        )}
      </div>
    </div>
  );
}
