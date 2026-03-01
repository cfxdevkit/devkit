# @cfxdevkit/services

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

Conflux SDK services layer — AES-256-GCM encrypted keystore, Swappi DEX integration, and low-level encryption primitives.

---

## Installation

```bash
pnpm add @cfxdevkit/services
# or
npm install @cfxdevkit/services
```

Peer dependency: `@cfxdevkit/core` (already a direct workspace dependency; resolved automatically in monorepo context).

---

## What's included

| Export | Description |
|---|---|
| `KeystoreService` | File-backed HD wallet keystore encrypted with AES-256-GCM + PBKDF2 |
| `SwapService` | Swappi DEX router — getPrice, swap, getTokenInfo, pool listing |
| `EncryptionService` | Low-level AES-256-GCM encryption / decryption primitives |

---

## Quick Start

### Encrypted keystore

```typescript
import { KeystoreService } from '@cfxdevkit/services';

// Point at a JSON file (created on first use)
const keystore = new KeystoreService('/path/to/.keystore.json');

// First-time setup — generates encrypted file
await keystore.setup({ password: 'my-strong-passphrase' });
await keystore.addMnemonic({ mnemonic: 'word1 word2 ...', label: 'main' });

// Later — unlock and derive
await keystore.unlockKeystore('my-strong-passphrase');
const mnemonic = await keystore.getActiveMnemonic();
const accounts = await keystore.deriveAccountsFromMnemonic(mnemonic, 'espace', 5, 0);

// Lock when done
keystore.lock();
```

### Swappi DEX quotes

```typescript
import { SwapService } from '@cfxdevkit/services';
import { ClientManager, EVM_MAINNET } from '@cfxdevkit/core';

const manager = new ClientManager({ evm: { chain: EVM_MAINNET } });
await manager.connect();

const swap = new SwapService(manager.evm.publicClient, 'mainnet');

// Get a quote (no transaction)
const quote = await swap.getQuote({
  tokenIn:     'WCFX',
  tokenOut:    'USDT',
  amountIn:    '1',    // 1 WCFX (human-readable)
  slippageBps: 50,     // 0.5%
});
console.log('Expected out:', quote.amountOut);

// Execute the swap
const txHash = await swap.swap({
  ...quote,
  walletClient,
  deadline: Math.floor(Date.now() / 1000) + 300,
});
```

### Resolve token info

```typescript
const token = await swap.getTokenInfo('WCFX');
console.log(token.address, token.decimals, token.name);
```

### Low-level encryption

```typescript
import { EncryptionService } from '@cfxdevkit/services';

const enc = new EncryptionService();
const encrypted = await enc.encrypt('secret data', 'my-password');
const decrypted = await enc.decrypt(encrypted, 'my-password');
```

---

## KeystoreService API

| Method | Description |
|---|---|
| `setup(opts)` | Initialise a new encrypted keystore file |
| `addMnemonic(opts)` | Add a labelled mnemonic to the keystore |
| `unlockKeystore(password)` | Decrypt the keystore into memory |
| `lock()` | Clear the in-memory decrypted state |
| `getActiveMnemonic()` | Return the active mnemonic (must be unlocked) |
| `deriveAccountsFromMnemonic(mnemonic, space, count, offset)` | Derive N accounts for `'espace'` or `'core'` |
| `listMnemonics()` | List all labelled mnemonic entries (no secrets) |
| `removeMnemonic(label)` | Delete a mnemonic entry |

---

## Architecture

```
@cfxdevkit/services
│
├── keystore.ts      ← Encrypted HD wallet storage (AES-256-GCM + PBKDF2, file-backed)
├── swap.ts          ← Swappi DEX router integration (Uniswap V2 style)
└── encryption.ts    ← AES-256-GCM + PBKDF2 primitives
```

---

## Relation to @cfxdevkit/core

`@cfxdevkit/core` is the foundation layer (RPC clients, chain config, HD derivation). This package provides the stateful services layer built on top of it:

```
@cfxdevkit/services  (@cfxdevkit/core peer dep)
       ↑
@cfxdevkit/core  (viem + cive)
```

If you only need service utilities and not the full RPC client layer, import from `@cfxdevkit/services` directly.

---

## Development

```bash
pnpm install
pnpm build        # ESM + CJS + .d.ts
pnpm type-check   # tsc --noEmit
pnpm test         # vitest
pnpm test:coverage
```

---

## License

Apache-2.0 — see [LICENSE](LICENSE).
