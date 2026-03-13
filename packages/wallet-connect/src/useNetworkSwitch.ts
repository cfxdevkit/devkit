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
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (arg: unknown) => void) => void;
  removeListener: (event: string, listener: (arg: unknown) => void) => void;
};

function getProvider(): EthereumProvider | undefined {
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function useNetworkSwitch() {
  const { isConnected } = useAccount();

  // `liveChainId` is the only source of truth for the current wallet chain.
  //
  // Why NOT use useAccount().chainId:
  //   wagmi initialises from SSR cookies which can contain a stale/wrong chain
  //   (e.g. Ethereum mainnet from a previous session). That stale value causes
  //   isWrongNetwork to fire true immediately on every page reload even when
  //   the wallet is already on the correct chain.
  //
  // Strategy:
  //   1. Start as `undefined` — meaning "chain not yet confirmed".
  //   2. Query eth_chainId once as soon as we have a connected wallet.
  //   3. Keep it current via the chainChanged event.
  //   4. isWrongNetwork is ONLY true once liveChainId is known AND wrong.
  //      While liveChainId is still undefined the banner stays hidden, which
  //      prevents a flash-of-wrong-network on every page load.
  const [liveChainId, setLiveChainId] = useState<number | undefined>(undefined);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Set up the chainChanged listener once and query the initial chain id
  // whenever isConnected becomes true (covers both: wallet already connected
  // on first mount, and wallet connected later without page reload).
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    // Register the event listener unconditionally so any external chain
    // switch is always picked up, even before isConnected is true.
    const onChainChanged = (chainIdHex: unknown) => {
      setLiveChainId(Number(chainIdHex as string));
    };
    provider.on('chainChanged', onChainChanged);

    // Query current chain immediately when connected.
    if (isConnected) {
      void provider
        .request({ method: 'eth_chainId' })
        .then((hex) => setLiveChainId(Number(hex as string)))
        .catch(() => {
          /* provider unresponsive — banner stays hidden */
        });
    } else {
      // Wallet disconnected: reset so the banner doesn't linger.
      setLiveChainId(undefined);
    }

    return () => provider.removeListener('chainChanged', onChainChanged);
  }, [isConnected]);

  // Banner is only shown once we have a confirmed chain AND it is wrong.
  // Never show it while liveChainId is still undefined (querying / not connected).
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
