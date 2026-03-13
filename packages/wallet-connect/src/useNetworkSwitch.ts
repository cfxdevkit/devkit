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
  const { isConnected, chainId: wagmiChainId } = useAccount();

  // Track the actual wallet chain directly from window.ethereum events.
  // wagmi's useAccount().chainId should also update reactively, but some
  // wallet + SSR combinations cause it to lag or miss external chain switches.
  // Seeding from the live provider event gives an instant, reliable signal.
  const [liveChainId, setLiveChainId] = useState<number | undefined>(undefined);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    // Query current chain once to seed liveChainId on mount.
    void provider
      .request({ method: 'eth_chainId' })
      .then((hex) => setLiveChainId(Number(hex as string)))
      .catch(() => {
        /* fall back to wagmiChainId */
      });

    const onChainChanged = (chainIdHex: unknown) => {
      setLiveChainId(Number(chainIdHex as string));
    };
    provider.on('chainChanged', onChainChanged);
    return () => provider.removeListener('chainChanged', onChainChanged);
  }, []);

  // Prefer the live value seeded from wallet events; fall back to wagmi's store.
  const effectiveChainId = liveChainId ?? wagmiChainId;
  const isWrongNetwork = isConnected && effectiveChainId !== EXPECTED_CHAIN_ID;

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
