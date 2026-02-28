# @cfxdevkit/executor

On-chain strategy execution engine for Conflux DevKit — the runtime primitives for building keepers, bots, or AI agents that execute limit orders, DCA, TWAP, and spot swaps on Conflux eSpace.

## Features

- **`Executor`** — Orchestrator that evaluates jobs on a tick interval, checks price conditions, enforces safety limits, and submits on-chain transactions.
- **`KeeperClientImpl`** — viem-based client that wraps the `AutomationManager` contract for job creation, cancellation, and forceful execution.
- **`SafetyGuard`** — Circuit-breaker with configurable per-tick swap caps, per-job retry caps, and a global circuit-breaker on consecutive failures.
- **`RetryQueue`** — Exponential backoff with jitter for failed job retries.
- **`PriceChecker`** — Pluggable price source interface + condition evaluator (`gte`/`lte` against a target price).
- **Full type system** — `Job` union type with per-strategy params (`LimitOrderJob`, `DCAJob`, `TWAPJob`, `SwapJob`) and lifecycle statuses.
- **Zero framework coupling** — Injectable `AutomationLogger` interface; no React, no HTTP framework required.

## Supported strategies

| Strategy | Status |
|---|---|
| Limit order | ✅ Implemented |
| DCA (Dollar-Cost Averaging) | ✅ Implemented |
| TWAP | 🔜 Types only (contract support pending) |
| Spot swap | 🔜 Types only (contract support pending) |

## Installation

```bash
pnpm add @cfxdevkit/executor
# or
npm install @cfxdevkit/executor
```

## Peer dependencies

```json
{
  "viem": ">=2.0.0"
}
```

## Usage

### Basic keeper setup

```ts
import { Executor, KeeperClientImpl, SafetyGuard, PriceChecker, noopLogger } from '@cfxdevkit/executor';
import { createWalletClient, http } from 'viem';
import { confluxESpace } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({ account, chain: confluxESpace, transport: http() });

const keeperClient = new KeeperClientImpl({
  walletClient,
  automationManagerAddress: '0x...',
});

const safetyGuard = new SafetyGuard({
  maxSwapsPerTick: 3,
  maxConsecutiveFailures: 5,
  maxRetriesPerJob: 4,
});

const priceChecker = new PriceChecker({
  priceSource: myPriceSource,   // implement PriceSource interface
  decimalsResolver: myResolver, // implement DecimalsResolver interface
});

const executor = new Executor({
  keeperClient,
  safetyGuard,
  priceChecker,
  jobStore: myJobStore,         // implement JobStore interface
  logger: noopLogger,           // or inject your own AutomationLogger
  tickIntervalMs: 15_000,       // evaluate jobs every 15 s
});

executor.start();
```

### Creating a limit order job

```ts
import type { LimitOrderStrategy } from '@cfxdevkit/executor';

const strategy: LimitOrderStrategy = {
  kind: 'limit_order',
  tokenIn: '0xCFX...',
  tokenOut: '0xUSDT...',
  amountIn: '100.0',       // human-readable
  targetPrice: '0.38',     // trigger when price >= target
  direction: 'gte',
  slippageBps: 50,         // 0.5%
  expiresInDays: 7,
};

await executor.createJob(strategy, ownerAddress);
```

### Creating a DCA job

```ts
import type { DCAStrategy } from '@cfxdevkit/executor';

const strategy: DCAStrategy = {
  kind: 'dca',
  tokenIn: '0xUSDT...',
  tokenOut: '0xCFX...',
  amountPerSwap: '50.0',   // human-readable, per interval
  intervalHours: 24,
  totalSwaps: 30,
  slippageBps: 100,        // 1%
};

await executor.createJob(strategy, ownerAddress);
```

## Job lifecycle

```
pending → active → executed
                 ↘ failed (exhausted retries)
       → cancelled (user-cancelled)
       → paused    (SafetyGuard circuit-breaker)
```

## Conflux Compatibility

| Network | Chain ID | Support |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | ✅ |
| Conflux eSpace Testnet | 71 | ✅ |
