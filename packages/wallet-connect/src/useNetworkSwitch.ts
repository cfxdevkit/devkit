'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
export const EXPECTED_CHAIN_ID = IS_MAINNET ? 1030 : 71;
export const EXPECTED_CHAIN_NAME = IS_MAINNET
  ? 'Conflux eSpace'
  : 'Conflux eSpace Testnet';

// Full EIP-3085 chain parameters for wallet_addEthereumChain.
const CHAIN_PARAMS = IS_MAINNET
  ? {
      chainId: '0x406', // 1030
      chainName: 'Conflux eSpace',
      nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
      rpcUrls: ['https://evm.confluxrpc.com'],
      blockExplorerUrls: ['https://evm.confluxscan.org'],
    }
  : {
      chainId: '0x47', // 71
      chainName: 'Conflux eSpace Testnet',
      nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
      rpcUrls: ['https://evmtestnet.confluxrpc.com'],
      blockExplorerUrls: ['https://evmtestnet.confluxscan.org'],
    };

type EthereumProvider = {
  chainId?: string; // synchronous property — set before any async requests
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (arg: unknown) => void) => void;
  removeListener: (event: string, listener: (arg: unknown) => void) => void;
};

function getProvider(): EthereumProvider | undefined {
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

/** Parse any chain ID format (hex string "0x47", decimal string "71", number 71) → number */
function parseChainId(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value as string);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function useNetworkSwitch() {
  const { isConnected } = useAccount();

  // Seed liveChainId synchronously from window.ethereum.chainId (EIP-1193
  // property, set by the wallet before any async calls).  This is the correct
  // value immediately on first render — no async race, no flash-of-wrong-network.
  const [liveChainId, setLiveChainId] = useState<number | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return parseChainId(getProvider()?.chainId);
  });
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Keep liveChainId current via the chainChanged event.
  // We do NOT re-query eth_chainId async here: the synchronous property seed
  // above already gives us the correct initial value, so we only need to track
  // subsequent changes through the event listener.
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    // Also re-read the synchronous property now in case the wallet initialised
    // after the first render (e.g. MetaMask injected after React ran but before
    // useEffect ran — rare but possible on slow devices).
    const current = parseChainId(provider.chainId);
    if (current !== undefined) setLiveChainId(current);

    const onChainChanged = (chainIdHex: unknown) => {
      const id = parseChainId(chainIdHex);
      if (id !== undefined) setLiveChainId(id);
    };
    provider.on('chainChanged', onChainChanged);
    return () => provider.removeListener('chainChanged', onChainChanged);
  }, []);

  // Reset liveChainId when wallet disconnects so the banner doesn't linger.
  useEffect(() => {
    if (!isConnected) setLiveChainId(undefined);
  }, [isConnected]);

  // Banner is only shown once we have a confirmed chain AND it is wrong.
  // liveChainId is seeded synchronously from window.ethereum.chainId, so on
  // the correct chain it is already correct on the first render. It is only
  // undefined when there is no wallet provider or the wallet isn't connected.
  const isWrongNetwork =
    isConnected &&
    liveChainId !== undefined &&
    liveChainId !== EXPECTED_CHAIN_ID;

  useEffect(() => {
    if (!isWrongNetwork) setSwitchError(null);
  }, [isWrongNetwork]);

  // Use wallet_addEthereumChain (EIP-3085) directly rather than wagmi's
  // switchChain/switchChainAsync.  wallet_addEthereumChain is idempotent:
  //   - If the chain is already in the wallet it switches to it.
  //   - If not, it prompts to add + switch in one step.
  // This avoids the different error-code semantics of wallet_switchEthereumChain
  // across wallets (MetaMask: 4902, Brave: 4100 "not authorised", etc.) and the
  // wagmi connector layer that wraps those differences inconsistently.
  const handleSwitchNetwork = useCallback(async () => {
    setSwitchError(null);
    const provider = getProvider();
    if (!provider) {
      setSwitchError('No wallet detected — add the network manually.');
      return;
    }
    setIsSwitching(true);
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [CHAIN_PARAMS],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isUserCancelled =
        msg.toLowerCase().includes('user rejected') ||
        msg.toLowerCase().includes('user denied') ||
        msg.toLowerCase().includes('cancelled');
      if (!isUserCancelled) {
        setSwitchError(`Could not switch network: ${msg}`);
      }
    } finally {
      setIsSwitching(false);
    }
  }, []);

  return { isWrongNetwork, isSwitching, switchError, handleSwitchNetwork };
}
