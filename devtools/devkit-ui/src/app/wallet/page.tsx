'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Lock, Plus, Trash2, Unlock } from 'lucide-react';
import { useState } from 'react';
import { SetupWizard } from '@/components/SetupWizard';
import { keystoreApi, type WalletEntry } from '@/lib/api';

/* ── main page ── */
export default function WalletPage() {
  const qc = useQueryClient();
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [addError, setAddError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: status } = useQuery({
    queryKey: ['keystore', 'status'],
    queryFn: keystoreApi.status,
    refetchInterval: 5000,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['keystore', 'wallets'],
    queryFn: keystoreApi.wallets,
    enabled: status?.initialized && !status?.locked,
  });

  const unlockMutation = useMutation({
    mutationFn: () => keystoreApi.unlock(password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['keystore'] });
      setShowUnlock(false);
      setPassword('');
    },
    onError: (e) => setUnlockError(e.message),
  });

  const lockMutation = useMutation({
    mutationFn: keystoreApi.lock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keystore'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => keystoreApi.activateWallet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keystore'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => keystoreApi.deleteWallet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keystore'] }),
  });

  const addMutation = useMutation({
    mutationFn: () => keystoreApi.addWallet(newMnemonic, newLabel || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['keystore'] });
      setNewMnemonic('');
      setNewLabel('');
      setShowAdd(false);
    },
    onError: (e) => setAddError(e.message),
  });

  if (!status?.initialized) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Wallet</h1>
        </div>
        <SetupWizard
          onDone={() => qc.invalidateQueries({ queryKey: ['keystore'] })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Wallet</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage developer mnemonics and keystores
          </p>
        </div>
        <div className="flex gap-2">
          {status?.encryptionEnabled &&
            (status?.locked ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowUnlock(true)}
              >
                <Unlock className="h-4 w-4" /> Unlock
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                disabled={lockMutation.isPending}
                onClick={() => lockMutation.mutate()}
              >
                <Lock className="h-4 w-4" /> Lock
              </button>
            ))}
          <button
            type="button"
            className="btn-primary"
            disabled={status?.locked}
            onClick={() => setShowAdd((v) => !v)}
          >
            <Plus className="h-4 w-4" /> Add Wallet
          </button>
        </div>
      </div>

      {/* Unlock dialog */}
      {showUnlock && (
        <div className="card max-w-sm space-y-3">
          <h2 className="text-sm font-medium text-white">Unlock Keystore</h2>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlockMutation.mutate()}
          />
          {unlockError && <p className="text-sm text-red-400">{unlockError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowUnlock(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!password || unlockMutation.isPending}
              onClick={() => unlockMutation.mutate()}
            >
              {unlockMutation.isPending ? 'Unlocking…' : 'Unlock'}
            </button>
          </div>
        </div>
      )}

      {/* Add wallet form */}
      {showAdd && (
        <div className="card max-w-lg space-y-3">
          <h2 className="text-sm font-medium text-white">Import Mnemonic</h2>
          <div>
            <label className="label">Mnemonic</label>
            <textarea
              className="input h-16 font-mono"
              value={newMnemonic}
              onChange={(e) => setNewMnemonic(e.target.value)}
              placeholder="word1 word2 … word12"
            />
          </div>
          <div>
            <label className="label">Label</label>
            <input
              className="input"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="My wallet"
            />
          </div>
          {addError && <p className="text-sm text-red-400">{addError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!newMnemonic.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Locked state */}
      {status?.locked ? (
        <div className="card text-sm text-slate-400">
          Keystore is locked. Unlock to manage wallets.
        </div>
      ) : (
        /* Wallet list */
        <div className="space-y-2">
          {(wallets as WalletEntry[]).map((w) => (
            <div
              key={w.id}
              className={`card flex items-center justify-between ${
                w.isActive ? 'border-blue-600/50 bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {w.isActive && (
                  <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">
                    {w.label}
                  </div>
                  <div className="text-xs text-slate-500">{w.id}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {!w.isActive && (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={activateMutation.isPending}
                    onClick={() => activateMutation.mutate(w.id)}
                  >
                    Activate
                  </button>
                )}
                {!w.isActive && (
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Delete wallet "${w.label}"?`)) {
                        deleteMutation.mutate(w.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
