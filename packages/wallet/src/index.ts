/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @cfxdevkit/wallet
 *
 * Focused re-export of @cfxdevkit/core's wallet abstractions.
 *
 * Use this package when you only need wallet features (session keys,
 * transaction batching, embedded custody) without pulling in the full
 * blockchain client layer.
 *
 * @example
 * ```typescript
 * import { TransactionBatcher, SessionKeyManager } from '@cfxdevkit/wallet';
 *
 * // Or import from a sub-path for tighter tree-shaking:
 * import { TransactionBatcher } from '@cfxdevkit/wallet/batching';
 * import { SessionKeyManager }  from '@cfxdevkit/wallet/session-keys';
 * import { EmbeddedWalletManager } from '@cfxdevkit/wallet/embedded';
 * ```
 */

// Types
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
// Classes
export {
  // Error classes
  BatcherError,
  EmbeddedWalletError,
  EmbeddedWalletManager,
  SessionKeyError,
  SessionKeyManager,
  TransactionBatcher,
  WalletError,
} from '@cfxdevkit/core/wallet';

export const VERSION = '0.1.0';
