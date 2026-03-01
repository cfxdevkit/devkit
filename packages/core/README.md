# @cfxdevkit/core

> Conflux SDK · blockchain client library for Conflux Core Space & eSpace

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

Foundation layer of the Conflux DevKit SDK — chain clients, contract utilities, HD wallet derivation, and automation primitives. Extracted from [devkit](https://github.com/cfxdevkit/devkit).

For swap services and keystore management see [`@cfxdevkit/services`](../services).

---

## Installation

```bash
pnpm add @cfxdevkit/core
# or
npm install @cfxdevkit/core
```

Peer dependencies (install if using React hooks):

```bash
pnpm add react react-dom
```

---

## Package Structure

| Subpath | Contents |
|---------|----------|
| `@cfxdevkit/core` | Full barrel – everything |
| `@cfxdevkit/core/clients` | `ClientManager`, `CoreClient`, `EspaceClient` |
| `@cfxdevkit/core/config` | Chain definitions for Core + eSpace |
| `@cfxdevkit/core/types` | Shared TypeScript types |
| `@cfxdevkit/core/utils` | Logger |
| `@cfxdevkit/core/wallet` | HD derivation, session keys, batching, embedded wallets |
| `@cfxdevkit/core/contracts` | `ContractDeployer`, `ContractReader`, `ContractWriter`, ERC ABIs (erc20Abi, erc721Abi, erc1155Abi, erc2612Abi, erc4626Abi) |
| `@cfxdevkit/core/automation` | `SafetyGuard`, `RetryQueue`, `PriceChecker`, `KeeperClient` interface, types — see also [`@cfxdevkit/executor`](../executor) |

---

## Quick Start

### Connect to Conflux eSpace

```typescript
import { ClientManager, EVM_MAINNET } from '@cfxdevkit/core';

const manager = new ClientManager({
  evm: { chain: EVM_MAINNET },
});

await manager.connect();
const block = await manager.evm.publicClient.getBlockNumber();
console.log('Current block:', block);
```

### Connect to Conflux Core Space

```typescript
import { ClientManager, CORE_MAINNET } from '@cfxdevkit/core';

const manager = new ClientManager({
  core: { chain: CORE_MAINNET },
});

await manager.connect();
const epochNumber = await manager.core.publicClient.getEpochNumber();
console.log('Current epoch:', epochNumber);
```

### HD Wallet Derivation

```typescript
import { generateMnemonic, deriveAccounts } from '@cfxdevkit/core/wallet';

// Generate new wallet
const mnemonic = generateMnemonic();

// Derive 5 accounts (both Core & eSpace addresses)
const accounts = deriveAccounts(mnemonic, { count: 5 });

for (const account of accounts) {
  console.log(`[${account.index}] Core: ${account.coreAddress}`);
  console.log(`[${account.index}] eSpace: ${account.evmAddress}`);
}
```

### Read an ERC-20 token

```typescript
import { ClientManager, EVM_MAINNET } from '@cfxdevkit/core';
import { ContractReader } from '@cfxdevkit/core/contracts';
import { ERC20_ABI } from '@cfxdevkit/core/contracts';

const manager = new ClientManager({ evm: { chain: EVM_MAINNET } });
await manager.connect();

const reader = new ContractReader(manager);
const balance = await reader.read({
  address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b', // WCFX
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: ['0xYourAddress'],
  chain: 'evm',
});
console.log('Balance:', balance);
```

### Query a DEX swap quote (Swappi)

```typescript
import { ClientManager, EVM_MAINNET } from '@cfxdevkit/core';
import { SwapService } from '@cfxdevkit/services';

const manager = new ClientManager({ evm: { chain: EVM_MAINNET } });
await manager.connect();

const swap = new SwapService(manager.evm.publicClient, 'mainnet');
const quote = await swap.getQuote({
  tokenIn: 'WCFX',
  tokenOut: 'USDT',
  amountIn: '1',   // 1 WCFX
  slippageBps: 50, // 0.5%
});
console.log('Expected out:', quote.amountOut);
```

### Encrypted Keystore

```typescript
import { KeystoreService } from '@cfxdevkit/services';

const keystore = new KeystoreService('/path/to/.keystore.json');
await keystore.setup({ password: 'my-password' });
await keystore.addMnemonic({ mnemonic: 'word1 word2 ...', label: 'main' });

// Later – unlock and derive
await keystore.unlockKeystore('my-password');
const accounts = await keystore.deriveAccountsFromMnemonic(
  mnemonic, 'espace', 5, 0
);
```

### Automation primitives (SafetyGuard · RetryQueue · PriceChecker)

The `@cfxdevkit/core/automation` subpath exports the base primitives. For the full execution engine (Executor, KeeperClientImpl) see [`@cfxdevkit/executor`](../executor).

```typescript
import {
  SafetyGuard, RetryQueue, PriceChecker,
} from '@cfxdevkit/core/automation';

// Injectable logger — pass pino/winston/console or omit for silence
const guard = new SafetyGuard({ maxSwapUsd: 5_000 }, myLogger);
const queue = new RetryQueue({ baseDelayMs: 5_000 }, myLogger);
const checker = new PriceChecker(myPriceSource, tokenPricesUsd, myLogger);

// Pre-flight check before sending a transaction
const result = guard.check(job, { swapUsd: estimatedUsd });
if (!result.ok) {
  queue.enqueue(job);     // schedule retry with exponential backoff
}

// Check price condition
const { conditionMet, swapUsd } = await checker.checkLimitOrder(job);
```

---

## Architecture

```
@cfxdevkit/core
│
├── clients/         ← cive (Core) + viem (eSpace) thin wrappers + ClientManager
├── config/          ← Chain definitions: local / testnet / mainnet for both spaces
├── types/           ← ChainType, UnifiedAccount, Address, etc.
├── utils/           ← Logger
│
├── wallet/
│   ├── derivation.ts    ← BIP32/BIP39 HD derivation (Core ↔ eSpace)
│   ├── session-keys/    ← Temporary delegated signing
│   ├── batching/        ← Multi-tx batching
│   └── embedded/        ← Server-side custody
│
├── contracts/
│   ├── abis/            ← ERC20, ERC721, ERC1155, ERC2612, ERC4626 (re-exported from @cfxdevkit/contracts)
│   ├── deployer/        ← Deploy to Core or eSpace
│   └── interaction/     ← ContractReader, ContractWriter
│
└── automation/          ← Off-chain automation primitives (no pino dep; injectable logger)
                         → full execution engine: @cfxdevkit/executor
                         → swap/keystore services:  @cfxdevkit/services
    ├── types.ts         ← Job + safety types (JobStatus, SafetyConfig, …)
    ├── safety-guard.ts  ← SafetyGuard — off-chain pre-flight checks
    ├── retry-queue.ts   ← RetryQueue — exponential backoff scheduling
    ├── price-checker.ts ← PriceChecker — price-source abstraction
    ├── abi.ts           ← AUTOMATION_MANAGER_ABI (viem `as const`)
    ├── keeper-interface.ts ← KeeperClient interface
    └── index.ts         ← Barrel export
```

---

## Dual-Space Architecture

Conflux has two parallel spaces on the same chain:

| | Core Space | eSpace |
|--|--|--|
| **API** | Conflux RPC (Epoch-based) | EVM-compatible JSON-RPC |
| **Addresses** | `cfx:aaa...` (base32) | `0x...` (hex) |
| **SDK Client** | `CoreClient` (via `cive`) | `EspaceClient` (via `viem`) |
| **Native token** | CFX | CFX (same) |

Use `ClientManager` to manage both simultaneously.

---

## Conflux Networks

| Network | Core Chain ID | eSpace Chain ID |
|---------|--------------|----------------|
| Mainnet | 1029 | 1030 |
| Testnet | 1 | 71 |
| Local | 2029 | 2030 |

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

Apache-2.0 — see [LICENSE](LICENSE)

---

## Relation to conflux-devkit

This library was extracted from the [devkit](https://github.com/cfxdevkit/devkit) monorepo.  
It contains only production-usable, framework-agnostic code.  
The DevNode management CLI, MCP server, and dashboard are **not** included.
