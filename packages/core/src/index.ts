// @cfxdevkit/core
// Conflux SDK – single-package library for building on Conflux Core Space & eSpace
//
// Subpath exports (preferred for tree-shaking):
//   import { ClientManager } from '@cfxdevkit/core-core/clients';
//   import { SwapService }   from '@cfxdevkit/services';
//   import { ContractReader } from '@cfxdevkit/core-core/contracts';
//   import { generateMnemonic } from '@cfxdevkit/core-core/wallet';
//
// Or import everything from the root:
//   import { ClientManager, SwapService, ERC20_ABI } from '@cfxdevkit/core';

export { formatCFX, parseCFX } from 'cive';
export { isAddress as isCoreAddress } from 'cive/utils';
// ── Re-export useful viem/cive primitives ──────────────────────────────────
export { formatUnits, isAddress as isEspaceAddress, parseUnits } from 'viem';
// ── Clients ────────────────────────────────────────────────────────────────
export {
  ClientManager,
  CoreClient,
  CoreTestClient,
  CoreWalletClient,
  EspaceClient,
  EspaceTestClient,
  EspaceWalletClient,
} from './clients/index.js';
export type {
  ClientManagerConfig,
  ClientManagerEvents,
  ClientManagerStatus,
} from './clients/manager.js';
export type { ChainConfig, SupportedChainId } from './config/chains.js';
// ── Chain Configuration ────────────────────────────────────────────────────
export {
  CORE_LOCAL,
  CORE_MAINNET,
  CORE_TESTNET,
  defaultNetworkSelector,
  EVM_LOCAL,
  EVM_MAINNET,
  EVM_TESTNET,
  getChainConfig,
  getCoreChains,
  getEvmChains,
  getMainnetChains,
  NetworkSelector,
} from './config/index.js';
export type {
  ContractInfo,
  DeploymentOptions,
  DeploymentResult,
  ERC20TokenInfo,
  ERC721TokenInfo,
  EventFilter,
  EventLog,
  MultiChainDeploymentOptions,
  MultiChainDeploymentResult,
  NFTMetadata,
  ReadOptions,
  WriteOptions,
  WriteResult,
} from './contracts/index.js';
// ── Contracts ──────────────────────────────────────────────────────────────
export {
  ContractDeployer,
  ContractError,
  ContractReader,
  ContractWriter,
  DeploymentError,
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  InteractionError,
} from './contracts/index.js';

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  Address,
  BaseTransaction,
  BlockEvent,
  ChainClient,
  ChainStatus,
  ChainType,
  ClientConfig,
  CoreAddress,
  CoreClientInstance,
  EspaceClientInstance,
  EventCallback,
  EvmAddress,
  Hash,
  HealthStatus,
  Log,
  TestClient,
  TestConfig,
  TransactionEvent,
  TransactionReceipt,
  UnifiedAccount,
  UnwatchFunction,
  WalletClient,
  WalletConfig,
} from './types/index.js';
export type { LogMessage } from './utils/index.js';
// ── Utils ──────────────────────────────────────────────────────────────────
export { logger } from './utils/index.js';
export type {
  BatcherOptions,
  BatchResult,
  BatchTransaction,
  DerivationOptions,
  DerivedAccount,
  EmbeddedWallet,
  EmbeddedWalletOptions,
  MnemonicValidation,
  SessionKey,
  SessionKeyOptions,
  SessionKeyPermissions,
  SignedTransaction,
  SignTransactionRequest,
  WalletExport,
  WalletManagerOptions,
} from './wallet/index.js';
// ── Wallet ─────────────────────────────────────────────────────────────────
export {
  // Wallet error classes
  BatcherError,
  deriveAccount,
  deriveAccounts,
  deriveFaucetAccount,
  EmbeddedWalletError,
  EmbeddedWalletManager,
  generateMnemonic,
  SessionKeyError,
  SessionKeyManager,
  TransactionBatcher,
  validateMnemonic,
  WalletError,
} from './wallet/index.js';
