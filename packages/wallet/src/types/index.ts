/*
 * @cfxdevkit/wallet — re-export stub
 *
 * All wallet types and error classes are defined in @cfxdevkit/core.
 * This file exists so that internal barrel imports continue to resolve.
 */

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
} from '@cfxdevkit/core/wallet';
export {
  BatcherError,
  EmbeddedWalletError,
  SessionKeyError,
  WalletError,
} from '@cfxdevkit/core/wallet';
