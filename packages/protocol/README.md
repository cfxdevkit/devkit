# @cfxdevkit/protocol

Conflux network-level ABIs and addresses — Conflux precompile contracts plus low-level DevKit contract artifacts.

> **Note:** For a higher-level experience (wagmi config objects, standard ABIs, bootstrap templates)
> see [`@cfxdevkit/contracts`](../contracts).

---

## What's included

### Conflux precompile contracts

Built-in contracts always deployed at fixed addresses on every Conflux network:

| Export | Address | Description |
|---|---|---|
| `adminControlAbi` / `ADMIN_CONTROL_ABI` + `adminControlAddress` | `0x0888000000000000000000000000000000000000` | Contract admin management (Core Space) |
| `sponsorWhitelistAbi` / `SPONSOR_WHITELIST_ABI` + `sponsorWhitelistAddress` | `0x0888000000000000000000000000000000000001` | Gas/collateral sponsorship (Core Space) |
| `stakingAbi` / `STAKING_ABI` + `stakingAddress` | `0x0888000000000000000000000000000000000002` | PoS staking deposit/withdraw/vote (Core Space) |
| `crossSpaceCallAbi` / `CROSS_SPACE_CALL_ABI` + `crossSpaceCallAddress` | `0x0888000000000000000000000000000000000006` | Synchronous Core ↔ eSpace messaging (eSpace) |
| `posRegisterAbi` / `POS_REGISTER_ABI` + `posRegisterAddress` | `0x0888000000000000000000000000000000000005` | PoS validator registration (Core Space) |
| `CONFLUX_PRECOMPILE_ADDRESSES` | — | Named map of all precompile addresses |

Use `cive` client for Core Space precompiles; `viem` for `CrossSpaceCall` on eSpace.

### DevKit contract ABIs _(deprecated — use `@cfxdevkit/contracts`)_

| Export | Description |
|---|---|
| `automationManagerAbi` / `AUTOMATION_MANAGER_ABI` | Full type-safe ABI for `AutomationManager` |
| `automationManagerAddress` | Deployed addresses keyed by chain ID |
| `automationManagerBytecode` | Deployment bytecode |
| `automationManagerConfig` | `{ abi, address }` combined config |
| `permitHandlerAbi` / `PERMIT_HANDLER_ABI` | ABI for `PermitHandler` |
| `permitHandlerAddress` / `permitHandlerBytecode` / `permitHandlerConfig` | — |
| `swappiPriceAdapterAbi` / `SWAPPI_PRICE_ADAPTER_ABI` | ABI for `SwappiPriceAdapter` |
| `swappiPriceAdapterAddress` / `swappiPriceAdapterBytecode` / `swappiPriceAdapterConfig` | — |

> ⚠️ These re-exports exist for backward compatibility and will be removed in v2.
> Migrate to `@cfxdevkit/contracts` — change your import path and nothing else.

---

## Installation

```bash
pnpm add @cfxdevkit/protocol
# or
npm install @cfxdevkit/protocol
```

No peer dependencies — pure TypeScript constants, zero runtime imports.

---

## Usage

### Interact with a Core Space precompile (cive)

```ts
import { createPublicClient, http } from 'cive';
import { mainnet } from 'cive/chains';
import { adminControlAbi, adminControlAddress } from '@cfxdevkit/protocol';

const client = createPublicClient({ chain: mainnet, transport: http() });

// Check who can destroy a contract
const admin = await client.readContract({
  address: adminControlAddress,
  abi: adminControlAbi,
  functionName: 'getAdmin',
  args: ['cfx:acg...'],
});
```

### CrossSpaceCall (eSpace — viem)

```ts
import { createPublicClient, http } from 'viem';
import { confluxESpace } from 'viem/chains';
import { crossSpaceCallAbi, crossSpaceCallAddress } from '@cfxdevkit/protocol';

const client = createPublicClient({ chain: confluxESpace, transport: http() });

// Call a Core Space contract synchronously from eSpace
const result = await client.readContract({
  address: crossSpaceCallAddress,
  abi: crossSpaceCallAbi,
  functionName: 'callEVM',
  args: [coreSpaceAddress, calldata],
});
```

### Sponsor whitelist — check sponsorship status

```ts
import { sponsorWhitelistAbi, sponsorWhitelistAddress } from '@cfxdevkit/protocol';

const sponsor = await client.readContract({
  address: sponsorWhitelistAddress,
  abi: sponsorWhitelistAbi,
  functionName: 'getSponsorForGas',
  args: ['cfx:acg...'],
});
```

### Migrate from @cfxdevkit/protocol DevKit ABIs

```diff
-import { automationManagerAbi } from '@cfxdevkit/protocol';
+import { automationManagerAbi } from '@cfxdevkit/contracts';
```

---

## Conflux precompile address reference

```ts
import { CONFLUX_PRECOMPILE_ADDRESSES } from '@cfxdevkit/protocol';

console.log(CONFLUX_PRECOMPILE_ADDRESSES);
// {
//   AdminControl:       '0x0888000000000000000000000000000000000000',
//   SponsorWhitelist:   '0x0888000000000000000000000000000000000001',
//   Staking:            '0x0888000000000000000000000000000000000002',
//   CrossSpaceCall:     '0x0888000000000000000000000000000000000006',
//   PoSRegister:        '0x0888000000000000000000000000000000000005',
// }
```

---

## Conflux compatibility

| Network | Chain ID | Support |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | ✅ |
| Conflux eSpace Testnet | 71 | ✅ |
| Conflux Core Space Mainnet | 1029 | ✅ (precompiles) |
| Conflux Core Space Testnet | 1 | ✅ (precompiles) |

---

## License

Apache-2.0 — see [LICENSE](LICENSE).
