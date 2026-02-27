# @cfxdevkit/wallet

Focused wallet abstractions for Conflux applications — session keys,
transaction batching, and embedded (server-side custody) wallets.

This package is a **re-export facade** over `@cfxdevkit/core/wallet`.
Use it when you only need wallet features without importing the full blockchain
client layer.

---

## Installation

```bash
pnpm add @cfxdevkit/wallet
```

`@cfxdevkit/core` is a peer dependency that is resolved automatically in
monorepo context via `workspace:*`.

---

## Usage

```typescript
import {
  TransactionBatcher,
  SessionKeyManager,
  EmbeddedWalletManager,
} from '@cfxdevkit/wallet';
```

### Sub-path imports (tree-shaking)

```typescript
import { TransactionBatcher }      from '@cfxdevkit/wallet/batching';
import { SessionKeyManager }       from '@cfxdevkit/wallet/session-keys';
import { EmbeddedWalletManager }   from '@cfxdevkit/wallet/embedded';
```

---

## What it exports

| Class | Description |
|-------|-------------|
| `TransactionBatcher` | Accumulate and submit multiple transactions in one batch |
| `SessionKeyManager` | Issue short-lived signing keys with permission scopes |
| `EmbeddedWalletManager` | Server-side custodial wallet management |

All types (`SessionKey`, `BatchTransaction`, …) and error classes
(`BatcherError`, `SessionKeyError`, `WalletError`, …) are also exported.

---

## Relationship to @cfxdevkit/core

`sdk-core` is the canonical implementation.  This package exists so that
consumers that only need wallet features do not have to pull in the full
blockchain client layer (viem clients, contract deployer, chain config, etc.).

If you are already depending on `@cfxdevkit/core`, you can import wallet
features directly from there:

```typescript
import { TransactionBatcher } from '@cfxdevkit/core';
// or
import { TransactionBatcher } from '@cfxdevkit/core/wallet';
```

---

## License

Apache-2.0 — see [LICENSE](./LICENSE).
