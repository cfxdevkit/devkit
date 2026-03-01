/**
 * @cfxdevkit/protocol
 *
 * Conflux network-level ABIs and addresses:
 *   - AdminControl        — contract admin management (Core Space)
 *   - SponsorWhitelist    — gas/collateral sponsorship (Core Space)
 *   - Staking             — PoS staking deposit/withdraw/vote (Core Space)
 *   - CrossSpaceCall      — synchronous Core ↔ eSpace messaging
 *   - PoSRegister         — PoS validator registration (Core Space)
 *
 * Use `cive` client for Core Space contracts; `viem` for CrossSpaceCall on eSpace.
 *
 * @deprecated DevKit contract ABIs (AutomationManager, PermitHandler,
 * SwappiPriceAdapter) have moved to `@cfxdevkit/contracts`.  The re-exports
 * below are kept for backward compatibility and will be removed in v2.
 */

// ─── Precompile ABIs (new canonical exports) ──────────────────────────────────
export {
  CONFLUX_PRECOMPILE_ADDRESSES,
  adminControlAbi,
  ADMIN_CONTROL_ABI,
  adminControlAddress,
  sponsorWhitelistAbi,
  SPONSOR_WHITELIST_ABI,
  sponsorWhitelistAddress,
  stakingAbi,
  STAKING_ABI,
  stakingAddress,
  crossSpaceCallAbi,
  CROSS_SPACE_CALL_ABI,
  crossSpaceCallAddress,
  posRegisterAbi,
  POS_REGISTER_ABI,
  posRegisterAddress,
} from './precompiles.js';

// ─── DevKit contract ABIs (deprecated — use @cfxdevkit/contracts) ─────────────
export {
  automationManagerAbi as AUTOMATION_MANAGER_ABI,
  automationManagerAbi,
  automationManagerAddress,
  automationManagerBytecode,
  automationManagerConfig,
  permitHandlerAbi as PERMIT_HANDLER_ABI,
  permitHandlerAbi,
  permitHandlerAddress,
  permitHandlerBytecode,
  permitHandlerConfig,
  swappiPriceAdapterAbi as SWAPPI_PRICE_ADAPTER_ABI,
  swappiPriceAdapterAbi,
  swappiPriceAdapterAddress,
  swappiPriceAdapterBytecode,
  swappiPriceAdapterConfig,
} from './abi.js';
