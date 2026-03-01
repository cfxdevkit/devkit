# @cfxdevkit/contracts

Auto-generated, type-safe ABI and deployment artifacts for the Conflux DevKit on-chain contracts, plus canonical standard token ABIs and a bootstrap library of production-ready deployable contracts.

## What's included

### DevKit contracts (AutomationManager · SwappiPriceAdapter · PermitHandler)

| Export | Description |
|---|---|
| `automationManagerAbi` / `AUTOMATION_MANAGER_ABI` | Type-safe ABI for `AutomationManager` |
| `automationManagerAddress` | Deployed addresses keyed by chain ID (`1030` mainnet, `71` testnet) |
| `automationManagerBytecode` | Deployment bytecode |
| `automationManagerConfig` | Combined `{ abi, address }` config for wagmi/viem |
| `permitHandlerAbi` / `PERMIT_HANDLER_ABI` | ABI for `PermitHandler` |
| `permitHandlerAddress` | Deployed addresses keyed by chain ID |
| `permitHandlerBytecode` | Deployment bytecode |
| `swappiPriceAdapterAbi` / `SWAPPI_PRICE_ADAPTER_ABI` | ABI for `SwappiPriceAdapter` |
| `swappiPriceAdapterAddress` | Deployed addresses keyed by chain ID |
| `swappiPriceAdapterBytecode` | Deployment bytecode |

Each contract is exported both as `camelCase` (wagmi/viem idiomatic) and `UPPER_CASE` (legacy compatibility).

### Standard token ABIs

Canonical interface ABIs safe to use against any compliant token. Two tiers — base (EIP spec only) and extended (OpenZeppelin 5.x additions):

| Export | Standard | Description |
|---|---|---|
| `erc20Abi` / `ERC20_ABI` | ERC-20 | Base ERC-20 interface |
| `erc20ExtendedAbi` / `ERC20_EXTENDED_ABI` | ERC-20 | Base + mint, burn, pause, permit |
| `erc721Abi` / `ERC721_ABI` | ERC-721 | Base ERC-721 interface |
| `erc721ExtendedAbi` / `ERC721_EXTENDED_ABI` | ERC-721 | Base + mint, burn, pause, royalties |
| `erc1155Abi` / `ERC1155_ABI` | ERC-1155 | Base ERC-1155 interface |
| `erc2612Abi` / `ERC2612_ABI` | EIP-2612 | Permit extension for ERC-20 |
| `erc4626Abi` / `ERC4626_ABI` | ERC-4626 | Tokenised vault standard |

### Bootstrap library (deployable templates)

Production-ready contracts with ABI + bytecode, deployable via `conflux-devkit` or directly:

| Contract | Category | Description |
|---|---|---|
| `erc20BaseAbi` / `erc20BaseBytecode` | tokens | Full-featured ERC-20: capped, burnable, pausable, ERC-2612 permit, role-based minter/pauser |
| `erc721BaseAbi` / `erc721BaseBytecode` | tokens | Full-featured ERC-721 NFT: enumerable, URI storage, burnable, ERC-2981 royalties |
| `erc1155BaseAbi` / `erc1155BaseBytecode` | tokens | Full-featured ERC-1155 multi-token: per-token supply caps, ERC-2981 royalties |
| `wrappedCfxAbi` / `wrappedCfxBytecode` | tokens | Canonical WCFX — WETH9-identical native CFX wrapper |
| `stakingRewardsAbi` / `stakingRewardsBytecode` | defi | Synthetix-style single-sided staking with configurable reward streaming |
| `vestingScheduleAbi` / `vestingScheduleBytecode` | defi | Multi-beneficiary cliff + linear vesting with revocation |
| `merkleAirdropAbi` / `merkleAirdropBytecode` | defi | Pull-based Merkle proof airdrop with bitmap claim tracking |
| `multiSigWalletAbi` / `multiSigWalletBytecode` | governance | Enhanced M-of-N multisig with expiry, cancellation, self-managed owners |
| `paymentSplitterAbi` / `paymentSplitterBytecode` | utils | Immutable proportional revenue splitter (native CFX + ERC-20) |
| `mockPriceOracleAbi` / `mockPriceOracleBytecode` | mocks | Chainlink AggregatorV3Interface mock for testing |

---

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

---

## Usage

### DevKit contracts with viem

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

### DevKit contracts with wagmi

```ts
import { useReadContract } from 'wagmi';
import { automationManagerConfig } from '@cfxdevkit/contracts';

const { data: jobCount } = useReadContract({
  ...automationManagerConfig,
  functionName: 'jobCount',
  chainId: 1030,
});
```

### Standard ABIs

```ts
import { erc20Abi, erc721Abi, erc1155Abi, erc2612Abi, erc4626Abi } from '@cfxdevkit/contracts';

// Read ERC-20 balance
const balance = await client.readContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: ['0xYourAddress'],
});

// ERC-4626 vault shares
const shares = await client.readContract({
  address: vaultAddress,
  abi: erc4626Abi,
  functionName: 'convertToShares',
  args: [amountIn],
});
```

### Bootstrap library — deploy ERC-20Base

```ts
import { erc20BaseAbi, erc20BaseBytecode } from '@cfxdevkit/contracts';
import { parseEther } from 'viem';

const hash = await walletClient.deployContract({
  abi: erc20BaseAbi,
  bytecode: erc20BaseBytecode,
  args: [
    'My Token',             // name
    'MTK',                  // symbol
    parseEther('1000000'),  // cap (1 M tokens)
    '0xAdminAddress',       // admin
  ],
});
```

---

## Regenerating DevKit artifacts

Artifacts for `AutomationManager`, `SwappiPriceAdapter`, and `PermitHandler` are generated from the Hardhat workspace. Never edit `src/generated.ts` by hand:

```bash
# 1. Compile Solidity + run wagmi codegen → writes packages/contracts/src/generated.ts
pnpm --filter @cfxdevkit/contracts-dev codegen

# 2. Build the published package
pnpm --filter @cfxdevkit/contracts build
```

Bootstrap contract artifacts (`src/bootstrap-abis.ts`) are similarly generated from `devtools/contracts`.
Run the same `codegen` step after modifying any bootstrap contract.

---

## Conflux compatibility

| Network | Chain ID | Support |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | ✅ |
| Conflux eSpace Testnet | 71 | ✅ (when deployed) |

> **Solidity note**: all bootstrap contracts compile to EVM version `paris`. Do **not** override to
> `shanghai` or later — Conflux eSpace does not support the `PUSH0` opcode.

---

## License

Apache-2.0 — see [LICENSE](LICENSE).
