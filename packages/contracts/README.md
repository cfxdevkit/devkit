# @cfxdevkit/contracts

Auto-generated, type-safe ABI and deployment artifacts for the Conflux DevKit on-chain contracts.

## What's included

| Export | Description |
|---|---|
| `automationManagerAbi` / `AUTOMATION_MANAGER_ABI` | Type-safe ABI for the `AutomationManager` contract |
| `automationManagerAddress` | Deployed addresses per chain ID (`1030` mainnet, `71` testnet) |
| `automationManagerBytecode` | Deployment bytecode |
| `automationManagerConfig` | Combined config object (abi + address) for wagmi/viem |
| `permitHandlerAbi` / `PERMIT_HANDLER_ABI` | ABI for the `PermitHandler` contract |
| `permitHandlerAddress` | Deployed addresses per chain ID |
| `permitHandlerBytecode` | Deployment bytecode |
| `swappiPriceAdapterAbi` / `SWAPPI_PRICE_ADAPTER_ABI` | ABI for the `SwappiPriceAdapter` contract |
| `swappiPriceAdapterAddress` | Deployed addresses per chain ID |
| `swappiPriceAdapterBytecode` | Deployment bytecode |

Each contract is exported both as `camelCase` (wagmi/viem idiomatic) and `UPPER_CASE` (legacy compatibility).

## Installation

```bash
pnpm add @cfxdevkit/contracts
# or
npm install @cfxdevkit/contracts
```

## Peer dependencies

```json
{
  "viem": ">=2.0.0"
}
```

## Usage

### With viem

```ts
import { createPublicClient, http } from 'viem';
import { confluxESpace } from 'viem/chains';
import { automationManagerAbi, automationManagerAddress } from '@cfxdevkit/contracts';

const client = createPublicClient({
  chain: confluxESpace,
  transport: http(),
});

const jobCount = await client.readContract({
  address: automationManagerAddress[1030],
  abi: automationManagerAbi,
  functionName: 'jobCount',
});
```

### With wagmi

```ts
import { useReadContract } from 'wagmi';
import { automationManagerConfig } from '@cfxdevkit/contracts';

const { data: jobCount } = useReadContract({
  ...automationManagerConfig,
  functionName: 'jobCount',
  chainId: 1030,
});
```

## Regenerating artifacts

Artifacts are generated from the Hardhat workspace and should never be edited by hand:

```bash
pnpm --filter @cfxdevkit/contracts codegen
# equivalent to: cd devtools/contracts && hardhat compile && wagmi generate
```

## Conflux Compatibility

| Network | Chain ID | Support |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | ✅ |
| Conflux eSpace Testnet | 71 | ✅ (when deployed) |
