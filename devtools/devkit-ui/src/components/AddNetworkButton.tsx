'use client';

import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addNetworkToWallet, hasWalletProvider } from '@/lib/wallet';

export interface AddNetworkButtonProps {
  evmChainId: number | undefined;
  evmRpcUrl: string | undefined;
  chainName?: string;
  /** Extra Tailwind classes to apply to the button */
  className?: string;
}

type Status = 'idle' | 'pending' | 'success' | 'error';

/**
 * "Add Network to Wallet" button — uses EIP-3085 / EIP-3326.
 *
 * - Disabled when the node is not running (rpcUrl undefined) or when no
 *   browser wallet is detected.
 * - Shows a transient success/error message inline.
 */
export function AddNetworkButton({
  evmChainId,
  evmRpcUrl,
  chainName = 'Conflux DevKit eSpace',
  className = '',
}: AddNetworkButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [walletAvailable, setWalletAvailable] = useState(false);

  // hasWalletProvider reads window.ethereum — must run client-side
  useEffect(() => {
    setWalletAvailable(hasWalletProvider());
  }, []);

  const canAdd =
    walletAvailable &&
    evmChainId !== undefined &&
    evmRpcUrl !== undefined &&
    status !== 'pending';

  async function handleClick() {
    if (!canAdd || !evmChainId || !evmRpcUrl) return;
    setStatus('pending');
    setErrorMsg('');
    try {
      await addNetworkToWallet({ evmChainId, evmRpcUrl, chainName });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Wallet request rejected';
      setErrorMsg(msg);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const label =
    status === 'pending'
      ? 'Adding…'
      : status === 'success'
        ? '✓ Added'
        : 'Add eSpace to Wallet';

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={!canAdd}
        onClick={handleClick}
        title={
          !walletAvailable
            ? 'No browser wallet detected'
            : !evmRpcUrl
              ? 'Start the node first'
              : 'Add the local eSpace network to your browser wallet'
        }
        className={[
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          'border border-cfx-500/40 bg-cfx-900/20 text-cfx-300',
          'hover:border-cfx-400 hover:bg-cfx-900/40 hover:text-cfx-200',
          'disabled:cursor-not-allowed disabled:opacity-40',
          status === 'success' &&
            'border-green-500/40 bg-green-900/20 text-green-300',
          status === 'error' && 'border-red-500/40 bg-red-900/20 text-red-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Wallet className="h-3.5 w-3.5 shrink-0" />
        {label}
      </button>
      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
