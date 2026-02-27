# @cfxdevkit/devnode

Programmatic wrapper around `@xcfx/node` for running a local Conflux Core + eSpace dev environment.

## What's inside

- `ServerManager` — start/stop the local node, mine blocks, fund accounts
- Configuration defaults tuned for the DevKit workspace (chainId 2029, evmChainId 2030)
- Helpers for mining, genesis accounts, and RPC URL resolution

## Usage

```typescript
import { ServerManager } from '@cfxdevkit/devnode';

const node = new ServerManager();
await node.start();

const accounts = node.getAccounts();   // pre-funded genesis accounts
await node.mine(5);                    // mine 5 blocks
await node.startMining(500);           // auto-mine every 500 ms
await node.stop();
```

## Running

```bash
pnpm --filter @cfxdevkit/devnode build
pnpm --filter @cfxdevkit/devnode test
```

## When to use

Import `ServerManager` from `@cfxdevkit/devnode` to control a local Conflux node in automated tests,
CI pipelines, or from the `conflux-devkit` backend.
