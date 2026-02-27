/**
 * @cfxdevkit/defi-react
 *
 * DeFi React hooks for Conflux DevKit.
 *
 * Provides:
 *   - usePoolTokens  — resolves Swappi pool tokens from a backend, enriches
 *                      each entry with the connected user's on-chain balance,
 *                      and keeps a cumulative localStorage cache.
 *   - getPairedTokens — filter helper: returns tokens paired with a given
 *                       tokenIn address.
 *   - Contract constants: AUTOMATION_MANAGER_ABI (frontend subset),
 *                         ERC20_ABI, WCFX_ABI, MAX_UINT256
 */

export * from './contracts.js';
export * from './usePoolTokens.js';
