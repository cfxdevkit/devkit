/**
 * EIP-3085 / EIP-3326 wallet helpers
 *
 * Adds a network to the user's browser wallet (MetaMask, Fluent, etc.).
 * Works for **eSpace** (EVM-compatible) only. Core Space uses the
 * native Conflux RPC and is not handled via these standard proposals.
 */

export interface AddNetworkOptions {
  evmChainId: number;
  evmRpcUrl: string;
  /** Human-readable name shown in the wallet UI, e.g. "Conflux DevKit eSpace" */
  chainName?: string;
  /** Currency symbol, default "CFX" */
  currencySymbol?: string;
  /** Currency decimals, default 18 */
  currencyDecimals?: number;
}

/**
 * Add (or switch to) a network in the browser wallet.
 *
 * Algorithm:
 *  1. Try `wallet_switchEthereumChain` with the given chainId.
 *  2. If the wallet throws error 4902 (chain not found), fall back to
 *     `wallet_addEthereumChain` to register it first, then switch.
 *
 * @throws if the user rejects the request or no wallet is detected.
 */
export async function addNetworkToWallet({
  evmChainId,
  evmRpcUrl,
  chainName = 'Conflux DevKit eSpace',
  currencySymbol = 'CFX',
  currencyDecimals = 18,
}: AddNetworkOptions): Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: window.ethereum is untyped by default
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    throw new Error(
      'No browser wallet detected. Install MetaMask or Fluent Wallet.'
    );
  }

  const chainIdHex = `0x${evmChainId.toString(16)}`;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: unknown) {
    // Error 4902 = chain has not been added to the wallet yet
    const code = (switchError as { code?: number })?.code;
    if (code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName,
            nativeCurrency: {
              name: currencySymbol,
              symbol: currencySymbol,
              decimals: currencyDecimals,
            },
            rpcUrls: [evmRpcUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

/** Returns true when `window.ethereum` is present (client-side only). */
export function hasWalletProvider(): boolean {
  if (typeof window === 'undefined') return false;
  // biome-ignore lint/suspicious/noExplicitAny: window.ethereum is untyped
  return Boolean((window as any).ethereum);
}
