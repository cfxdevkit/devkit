/**
 * @cfxdevkit/contracts
 *
 * Auto-generated ABI, bytecode, and multi-chain deployed addresses for
 * DevKit contracts, plus canonical standard ABIs for common token interfaces.
 *
 * DevKit contracts (AutomationManager, SwappiPriceAdapter, PermitHandler):
 *   Regenerate with: pnpm --filter @cfxdevkit/contracts codegen
 *   (which runs: cd devtools/contracts && hardhat compile && wagmi generate)
 *
 * Bootstrap library contracts (ERC20Base, ERC721Base, …):
 *   ABI + bytecode only — no on-chain addresses (deployed locally per project).
 *
 * Standard ABIs (erc20Abi, erc721Abi, erc1155Abi, erc4626Abi, erc2612Abi …):
 *   Canonical interface ABIs for use with any compliant token.
 */

// ─── Generated DevKit + bootstrap contract artifacts ──────────────────────────
export * from './generated.js';

// ─── UPPER_CASE aliases for DevKit-specific contracts (backward compat) ───────
// These allow consumers that imported from @cfxdevkit/protocol to migrate
// to @cfxdevkit/contracts with a one-line import change.
export {
  automationManagerAbi as AUTOMATION_MANAGER_ABI,
  permitHandlerAbi as PERMIT_HANDLER_ABI,
  swappiPriceAdapterAbi as SWAPPI_PRICE_ADAPTER_ABI,
} from './generated.js';

// ─── Standard token interface ABIs ────────────────────────────────────────────
export {
  ERC20_ABI,
  ERC20_EXTENDED_ABI,
  ERC721_ABI,
  ERC721_EXTENDED_ABI,
  ERC1155_ABI,
  ERC2612_ABI,
  ERC4626_ABI,
  // ERC-20
  erc20Abi,
  erc20ExtendedAbi,
  // ERC-721
  erc721Abi,
  erc721ExtendedAbi,
  // ERC-1155
  erc1155Abi,
  // EIP-2612 permit
  erc2612Abi,
  // ERC-4626
  erc4626Abi,
} from './standard-abis.js';
