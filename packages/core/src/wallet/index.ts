// @cfxdevkit/core - Wallet module
// HD wallet derivation, session keys, transaction batching, embedded wallets
//
// Consumers that only need wallet features (without the full client layer) can
// use the lighter @cfxdevkit/wallet package which re-exports from here.

// Transaction Batching
export { TransactionBatcher } from './batching/batcher.js';
// ── HD Wallet Derivation (BIP32/BIP39) ─────────────────────────────────────
export {
  deriveAccount,
  deriveAccounts,
  deriveFaucetAccount,
  generateMnemonic,
  getDerivationPath,
  validateMnemonic,
} from './derivation.js';
// Embedded Wallets
export { EmbeddedWalletManager } from './embedded/custody.js';

// ── Advanced Wallet Abstractions ────────────────────────────────────────────
// Session Keys
export { SessionKeyManager } from './session-keys/manager.js';
// Shared wallet types — includes interfaces and error classes
export type {
  BatcherOptions,
  BatchResult,
  BatchTransaction,
  EmbeddedWallet,
  EmbeddedWalletOptions,
  SessionKey,
  SessionKeyOptions,
  SessionKeyPermissions,
  SignedTransaction,
  SignTransactionRequest,
  WalletExport,
  WalletManagerOptions,
} from './types/index.js';
// Wallet error classes (concrete values, not just types)
export {
  BatcherError,
  EmbeddedWalletError,
  SessionKeyError,
  WalletError,
} from './types/index.js';
export type {
  DerivationOptions,
  DerivedAccount,
  MnemonicValidation,
} from './types.js';
export {
  COIN_TYPES,
  CORE_NETWORK_IDS,
} from './types.js';
