# @cfxdevkit/protocol

Static on-chain contract artifacts for Conflux DevKit — ABIs, deployment bytecode, and deployed addresses for all automation contracts. Zero runtime dependencies.

> **Note:** This package provides the raw low-level artifacts. For a higher-level experience with wagmi config objects and wagmi-compatible exports see [`@cfxdevkit/contracts`](../contracts).

## What's included

| Export | Description |
|---|---|
| `automationManagerAbi` / `AUTOMATION_MANAGER_ABI` | Full type-safe ABI for `AutomationManager` |
| `automationManagerAddress` | Deployed addresses keyed by chain ID |
| `automationManagerBytecode` | Deployment bytecode (for testing / deployment scripts) |
| `automationManagerConfig` | `{ abi, address }` combined config |
| `permitHandlerAbi` / `PERMIT_HANDLER_ABI` | ABI for `PermitHandler` |
| `permitHandlerAddress` | Deployed addresses keyed by chain ID |
| `permitHandlerBytecode` | Deployment bytecode |
| `swappiPriceAdapterAbi` / `SWAPPI_PRICE_ADAPTER_ABI` | ABI for `SwappiPriceAdapter` |
| `swappiPriceAdapterAddress` | Deployed addresses keyed by chain ID |
| `swappiPriceAdapterBytecode` | Deployment bytecode |

Exports are available as both `camelCase` (wagmi/viem idiomatic) and `UPPER_CASE` (legacy compatibility).

## Installation

```bash
pnpm add @cfxdevkit/protocol
# or
npm install @cfxdevkit/protocol
```

No peer dependencies — this package is pure TypeScript constants with no runtime imports.

## Usage

### Read a contract value with viem

```ts
import { createPublicClient, http } from 'viem';
import { confluxESpace } from 'viem/chains';
import { automationManagerAbi, automationManagerAddress } from '@cfxdevkit/protocol';

const client = createPublicClient({
  chain: confluxESpace,
  transport: http(),
});

const maxJobs = await client.readContract({
  address: automationManagerAddress[1030],
  abi: automationManagerAbi,
  functionName: 'maxJobsPerUser',
});
```

### Deploy in a Hardhat or viem script

```ts
import { automationManagerBytecode, automationManagerAbi } from '@cfxdevkit/protocol';

const hash = await walletClient.deployContract({
  abi: automationManagerAbi,
  bytecode: automationManagerBytecode,
  args: [swapRouter, priceAdapter],
});
```

## Regenerating artifacts

Artifacts are generated from the Hardhat workspace — do not edit them by hand:

```bash
pnpm --filter @cfxdevkit/contracts codegen
# equivalent to: cd devtools/contracts && hardhat compile && wagmi generate
```

## Conflux Compatibility

| Network | Chain ID | Support |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | ✅ |
| Conflux eSpace Testnet | 71 | ✅ (when deployed) |
