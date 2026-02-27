'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  CheckCircle,
  Copy,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { keystoreApi, type WalletEntry } from '@/lib/api';

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

/* ── Setup wizard ── */
function SetupWizard({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [step, setStep] = useState<'generate' | 'confirm'>('generate');
  const [generated, setGenerated] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [label, setLabel] = useState('Default');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');

  const generateMutation = useMutation({
    mutationFn: keystoreApi.generate,
    onSuccess: (d) => {
      setGenerated(d.mnemonic);
      setMnemonic(d.mnemonic);
      setStep('confirm');
    },
  });

  const setupMutation = useMutation({
    mutationFn: () => {
      if (password && password !== confirmPw) {
        throw new Error('Passwords do not match');
      }
      return keystoreApi.setup({
        mnemonic,
        label: label || 'Default',
        password: password || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['keystore'] });
      onDone();
    },
    onError: (e) => setError(e.message),
  });

  return (
    <div className="card max-w-lg space-y-5">
      <h2 className="text-base font-semibold text-white">
        First-time Setup
      </h2>
      <p className="text-sm text-slate-400">
        Create or import a mnemonic to manage your dev accounts.
      </p>

      {step === 'generate' ? (
        <>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              <RefreshCw className="h-4 w-4" />
              Generate Mnemonic
            </button>
            <span className="self-center text-sm text-slate-500">or</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep('confirm')}
            >
              Import Existing
            </button>
          </div>
        </>
      ) : (
        <>
          {generated && (
            <div className="rounded-md bg-[#0e1117] p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">Generated mnemonic — save this safely!</span>
                <CopyBtn text={generated} />
              </div>
              <p className="font-mono text-sm text-green-300 leading-relaxed">{generated}</p>
            </div>
          )}
          <div>
            <label className="label">Mnemonic (12 or 24 words)</label>
            <textarea
              className="input h-20 font-mono"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="word1 word2 word3 …"
            />
          </div>
          <div>
            <label className="label">Label</label>
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password (optional)</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for no encryption"
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep('generate')}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!mnemonic.trim() || setupMutation.isPending}
              onClick={() => setupMutation.mutate()}
            >
              {setupMutation.isPending ? 'Setting up…' : 'Complete Setup'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
        <SetupWizard onDone={() => qc.invalidateQueries({ queryKey: ['keystore'] })} />
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
          {status?.encryptionEnabled && (
            <>
              {status?.locked ? (
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
              )}
            </>
          )}
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
          {unlockError && (
            <p className="text-sm text-red-400">{unlockError}</p>
          )}
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
                  <div className="text-sm font-medium text-white">{w.label}</div>
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
