'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { keystoreApi } from '@/lib/api';

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

interface Props {
  onDone?: () => void;
}

/**
 * First-time setup wizard.
 * Step 1 — choose to generate a new mnemonic or import an existing one.
 * Step 2 — confirm the mnemonic, set an optional label and encryption password.
 */
export function SetupWizard({ onDone }: Props) {
  const qc = useQueryClient();
  const [step, setStep] = useState<'choose' | 'confirm'>('choose');
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
        mnemonic: mnemonic.trim(),
        label: label.trim() || 'Default',
        password: password || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['keystore'] });
      onDone?.();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="card max-w-lg space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">First-time Setup</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create or import a mnemonic to derive genesis accounts for your local
          Conflux node. The mnemonic is stored encrypted on disk.
        </p>
      </div>

      {step === 'choose' ? (
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Generate New Mnemonic
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
      ) : (
        <div className="space-y-4">
          {generated && (
            <div className="rounded-md bg-[#0e1117] p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Generated mnemonic — save this somewhere safe before
                  continuing!
                </span>
                <CopyBtn text={generated} />
              </div>
              <p className="font-mono text-sm text-green-300 leading-relaxed break-all">
                {generated}
              </p>
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
            <label className="label">Wallet Label</label>
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Default"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Encrypt with password (optional)</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for no encryption"
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                className="input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
          </div>

          {(error || setupMutation.error) && (
            <p className="text-sm text-red-400">
              {error || (setupMutation.error as Error)?.message}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep('choose');
                setGenerated('');
                setMnemonic('');
                setError('');
              }}
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
        </div>
      )}
    </div>
  );
}
