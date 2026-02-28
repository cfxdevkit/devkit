# Conflux DevKit — Package Catalogue

> **AI-agent note**: when code-generating a new project on top of this framework, start by
> reading this file in full. It maps every available capability to its package,
> import path, and typical usage pattern.

---

## Framework layer map

```
UI Components  ─── @cfxdevkit/react          @cfxdevkit/wallet-connect
Wallet logic   ─── @cfxdevkit/wallet         @cfxdevkit/core/wallet
Services       ─── @cfxdevkit/services
RPC / Contracts─── @cfxdevkit/core            @cfxdevkit/contracts
Domain tools   ─── @cfxdevkit/compiler       @cfxdevkit/protocol
Execution      ─── @cfxdevkit/executor      @cfxdevkit/defi-react
Dev tools      ─── @cfxdevkit/devnode        conflux-devkit (npx)
```

---

## Quick-start recipes

### Recipe 1 — Read-only DApp

```typescript
import { ClientManager, ContractReader, ERC20_ABI } from '@cfxdevkit/core';

const clients = new ClientManager({ network: 'testnet' });
const reader  = new ContractReader(clients.evm);

const balance = await reader.read({
  address: '0xTokenAddress',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: ['0xUserAddress'],
});
```

### Recipe 2 — Full DApp with wallet connection

```tsx
import { WagmiProvider, wagmiConfig, WalletConnect } from '@cfxdevkit/wallet-connect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();
export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

// Anywhere in the tree:
// <WalletConnect />
```

### Recipe 3 — Backend / CLI (Node.js, no UI)

```typescript
import { EmbeddedWalletManager, generateMnemonic } from '@cfxdevkit/wallet';
import { SwapService }   from '@cfxdevkit/services';
import { ClientManager } from '@cfxdevkit/core';

const mnemonic = generateMnemonic();
const wallet   = new EmbeddedWalletManager({ mnemonic, networkType: 'testnet' });
const clients  = new ClientManager({ network: 'testnet' });
const swapper  = new SwapService(clients.evm);
```

### Recipe 4 — Local dev node (automated testing / CI)

```typescript
import { ServerManager } from '@cfxdevkit/devnode';

const node = new ServerManager();
await node.start();
await node.mine(3);
await node.stop();
```

### Recipe 5 — Local dev node with UI dashboard

```bash
npx conflux-devkit           # opens http://localhost:7748
npx conflux-devkit --port 8888 --no-open
```

---

## Package reference

### `@cfxdevkit/core`

**Tier**: Foundation — always required.
**Dir**: `packages/core`

| Export | Description |
|---|---|
| `ClientManager` | Creates and holds EVM (viem) + Core Space (cive) RPC clients |
| `ContractReader` | Type-safe eth_call / cfx_call wrapper |
| `ContractWriter` | Type-safe eth_sendTransaction wrapper |
| `ContractDeployer` | Deploy contracts from bytecode + ABI |
| `EmbeddedWalletManager` | HD wallet with session keys, transaction batching, export |
| `generateMnemonic` | Generate a random BIP-39 mnemonic (12 or 24 words) |
| `validateMnemonic` | Validate a BIP-39 mnemonic |
| `deriveAccount` | Derive a single HD account (Core + eSpace addresses + keys) |
| `deriveAccounts` | Derive N accounts from a mnemonic |
| `deriveFaucetAccount` | Derive the mining/faucet account |
| `ERC20_ABI` | Standard ERC-20 ABI as const |
| `ERC721_ABI` | Standard ERC-721 ABI as const |
| `EVM_TESTNET`, `EVM_MAINNET`, `EVM_LOCAL` | viem chain configs for Conflux eSpace |
| `CORE_TESTNET`, `CORE_MAINNET`, `CORE_LOCAL` | cive chain configs for Core Space |
| `COIN_TYPES`, `CORE_NETWORK_IDS` | BIP-44 derivation constants |

```typescript
import { ClientManager, ContractReader, ERC20_ABI, deriveAccount } from '@cfxdevkit/core';
```

---

### `@cfxdevkit/services`

**Tier**: Layer 1.
**Dir**: `packages/services`
**Depends on**: `@cfxdevkit/core`

| Export | Description |
|---|---|
| `KeystoreService` | File-backed encrypted HD keystore. Multiple named mnemonics, optional AES-256 password, active-mnemonic switching |
| `getKeystoreService()` | Singleton accessor for `KeystoreService` |
| `EncryptionService` | AES-256-GCM encryption/decryption utilities |
| `SwapService` | Swappi DEX swap router — getPrice, swap, getTokenInfo |

```typescript
import { getKeystoreService, SwapService } from '@cfxdevkit/services';

const ks = getKeystoreService();
await ks.initialize();
const mnemonic = await ks.getActiveMnemonic();
```

---

### `@cfxdevkit/wallet`

**Tier**: Layer 1 — focused re-export.
**Dir**: `packages/wallet`
**Depends on**: `@cfxdevkit/core`

```typescript
import { EmbeddedWalletManager, generateMnemonic, deriveAccount } from '@cfxdevkit/wallet';
```

---

### `@cfxdevkit/compiler`

**Tier**: Layer 1 — tooling.
**Dir**: `packages/compiler`
**Depends on**: bundled solc-js

Bundles the Solidity compiler WASM. Compile arbitrary `.sol` source at runtime — no Hardhat, no external binary.

| Template | Description |
|---|---|
| `SimpleStorage` | Value-storage contract for deployment smoke tests |
| `TestToken` | Minimal ERC-20 with mint/burn for DEX and approval tests |

```typescript
import {
  compileSolidity,
  getSimpleStorageContract,
  getTestTokenContract,
  TEST_CONTRACTS,
} from '@cfxdevkit/compiler';

const result = await compileSolidity(mySource, 'MyContract');
if (result.success) {
  const { abi, bytecode } = result.contracts[0];
}

// Pre-built template (memoised after first call)
const { abi, bytecode } = getSimpleStorageContract();
```

> **Conflux note**: default EVM version is `paris`. Do not use `shanghai` or later — Conflux eSpace does not support `PUSH0`.

---

### `@cfxdevkit/devnode`

**Tier**: Layer 1 — dev / test only.
**Dir**: `packages/devnode`
**Depends on**: `@cfxdevkit/core`

```typescript
import { ServerManager } from '@cfxdevkit/devnode';

const node = new ServerManager();
await node.start();

const status   = node.getNodeStatus();   // { server, mining, rpcUrls }
const accounts = node.getAccounts();     // pre-funded genesis accounts
const urls     = node.getRpcUrls();      // { core, evm, ws }

await node.mine(5);                      // mine 5 blocks
await node.startMining(500);             // auto-mine every 500 ms
await node.stopMining();
await node.stop();
```

---

### `@cfxdevkit/contracts`

**Tier**: Layer 1 — generated artefacts.
**Dir**: `packages/contracts`
**Source**: `devtools/contracts` (Hardhat project)

Generated ABI, bytecode, and multi-chain deployed addresses. Do **not** edit `src/generated.ts` by hand.

```typescript
import {
  automationManagerAbi,
  automationManagerAddress,   // Record<chainId, `0x${string}`>
  automationManagerConfig,    // { abi, address } — usable directly in wagmi hooks
  automationManagerBytecode,
  swappiPriceAdapterAbi,
  swappiPriceAdapterConfig,
  permitHandlerAbi,
  permitHandlerConfig,
} from '@cfxdevkit/contracts';
```

Regenerate after a contract change or new deployment:

```bash
pnpm --filter @cfxdevkit/contracts-dev codegen   # compile + wagmi generate
pnpm --filter @cfxdevkit/contracts build          # build the lean package
```

---

### `@cfxdevkit/wallet-connect`

**Tier**: Layer 2 — React UI, frontend only.
**Dir**: `packages/wallet-connect`
**Peer deps**: react, wagmi, viem, connectkit, @tanstack/react-query

```typescript
import { WalletConnect, AuthProvider, useNetworkSwitch, wagmiConfig, eSpaceMainnet, eSpaceTestnet } from '@cfxdevkit/wallet-connect';
```

---

### `@cfxdevkit/react`

**Tier**: Layer 2 — React UI, frontend only.
**Dir**: `packages/react`
**Peer deps**: react, wagmi, viem, @tanstack/react-query

| Component / Hook | Description |
|---|---|
| `<ConnectButton>` | Wallet connect trigger |
| `<AccountCard>` | Display connected account info |
| `<ContractReader>` | Read a contract value and render the result |
| `<ContractWriter>` | Write to a contract with pending/success/error states |
| `<SwapWidget>` | Swappi DEX token-swap form |

---

## Devtools reference

### `devtools/contracts` — Hardhat project

**Package**: `@cfxdevkit/contracts-dev` (private)

```bash
pnpm --filter @cfxdevkit/contracts-dev compile    # compile Solidity
pnpm --filter @cfxdevkit/contracts-dev codegen    # compile + wagmi generate
pnpm --filter @cfxdevkit/contracts-dev test       # run contract tests
pnpm --filter @cfxdevkit/contracts-dev deploy     # deploy to testnet
```

### `devtools/devkit` — `conflux-devkit`

**Package**: `conflux-devkit` (published)

The `npx conflux-devkit` tool. Starts an Express + Socket.IO server that manages a local Conflux node and serves a pre-built Next.js UI.

```bash
npx conflux-devkit [--port 7748] [--no-open]
```

Build from source:

```bash
pnpm --filter conflux-devkit-ui build   # build Next.js UI export
pnpm --filter conflux-devkit build      # copy UI + bundle CLI with tsup
node devtools/devkit/dist/cli.js        # run directly
```

---

## Import path cheat sheet

| What you need | Import from |
|---|---|
| RPC client (EVM or Core) | `@cfxdevkit/core` → `ClientManager` |
| Contract read | `@cfxdevkit/core` → `ContractReader` |
| Contract write | `@cfxdevkit/core` → `ContractWriter` |
| Contract deploy | `@cfxdevkit/core` → `ContractDeployer` |
| HD wallet / key derivation | `@cfxdevkit/wallet` |
| Keystore (encrypted, file-backed) | `@cfxdevkit/services` → `getKeystoreService()` |
| DEX swap | `@cfxdevkit/services` → `SwapService` |
| AES encryption | `@cfxdevkit/services` → `EncryptionService` |
| Solidity compile (runtime) | `@cfxdevkit/compiler` → `compileSolidity` |
| Pre-built contract templates | `@cfxdevkit/compiler` → `TEST_CONTRACTS` |
| Generated ABI + addresses | `@cfxdevkit/contracts` |
| Wallet connect UI (React) | `@cfxdevkit/wallet-connect` → `WalletConnect` |
| React components / hooks | `@cfxdevkit/react` |
| Local dev node (programmatic) | `@cfxdevkit/devnode` → `ServerManager` |
| Local dev node (browser UI) | `npx conflux-devkit` |

---

## Versioning

All packages follow semver. Breaking changes are not guaranteed to have a major version bump until `1.0.0` is reached. Pin exact versions until the framework stabilises.

Changesets are managed via `@changesets/cli`. Run `pnpm changeset` to create a change entry; `pnpm changeset version` to bump packages.
