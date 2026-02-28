'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Copy, RefreshCw, KeyRound, Download } from 'lucide-react';
import { useState } from 'react';
import { keystoreApi } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setC(true);
        setTimeout(() => setC(false), 1500);
      }}
    >
      {c ? (
        <CheckCheck className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
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
  const [saved, setSaved] = useState(false);

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
    <div className="flex w-full justify-center p-4">
      <Card className="w-full max-w-lg border-cfx-500/20 shadow-[0_0_30px_-10px_rgba(14,165,233,0.15)]">
        <CardHeader>
          <CardTitle className="text-xl">First-time Setup</CardTitle>
          <CardDescription>
            Create or import a mnemonic to derive genesis accounts for your local
            Conflux node. The mnemonic is stored encrypted on disk.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'choose' ? (
            <div className="flex flex-col gap-4 py-4">
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                <RefreshCw className={`h-5 w-5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                Generate New Mnemonic
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/50 px-2 text-slate-500">Or integrate your own</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  setGenerated('');
                  setMnemonic('');
                  setStep('confirm');
                }}
              >
                <Download className="h-5 w-5" />
                Import Existing Mnemonic
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {generated ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-cfx-500/30 bg-cfx-900/10 p-4 shadow-inner">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-cfx-400">
                        <KeyRound className="h-4 w-4" /> Secret Recovery Phrase
                      </span>
                      <CopyBtn text={generated} />
                    </div>
                    <p className="rounded-md border border-slate-800 bg-slate-950 p-3 text-center font-mono text-sm leading-relaxed tracking-wide text-slate-200">
                      {generated}
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-900 text-cfx-500 focus:ring-cfx-500 focus:ring-offset-slate-900"
                      checked={saved}
                      onChange={(e) => setSaved(e.target.checked)}
                    />
                    I have securely saved this mnemonic phrase
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Recovery Phrase (12 or 24 words)</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-blue-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cfx-500"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    placeholder="word1 word2 word3 …"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Wallet Label</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Main Wallet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Encrypt with password <span className="font-normal text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank for none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                </div>
              </div>

              {(error || setupMutation.error) && (
                <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-500">
                  {error || (setupMutation.error as Error)?.message}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {step === 'confirm' && (
          <CardFooter className="flex justify-between border-t border-slate-800 bg-slate-900/30 pt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('choose');
                setGenerated('');
                setMnemonic('');
                setError('');
                setSaved(false);
              }}
            >
              Back
            </Button>
            <Button
              disabled={(!generated && !mnemonic.trim()) || (!!generated && !saved) || setupMutation.isPending}
              onClick={() => setupMutation.mutate()}
            >
              {setupMutation.isPending ? 'Setting up…' : 'Complete Setup'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
