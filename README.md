# @cfxdevkit — Conflux TypeScript SDK

A layered, fully typed TypeScript SDK for building on **Conflux eSpace** and
**Conflux Core Space**. Use only the layers your project needs — from raw RPC
clients through to production-ready React components.

---

## Repository layout

```
packages/            Framework packages — all publishable to npm as @cfxdevkit/*
  core/              @cfxdevkit/core           — RPC clients, contracts, HD wallet
  services/          @cfxdevkit/services       — encryption, keystore, Swappi DEX
  wallet/            @cfxdevkit/wallet         — re-export of wallet API from core
  compiler/          @cfxdevkit/compiler       — runtime solc-js + contract templates
  devnode/           @cfxdevkit/devnode        — local @xcfx/node lifecycle (dev only)
  react/             @cfxdevkit/react          — headless React components + hooks
  wallet-connect/    @cfxdevkit/wallet-connect — wagmi v2 + ConnectKit + SIWE
  contracts/         @cfxdevkit/contracts      — generated ABI, bytecode, addresses

devtools/            Private developer tooling — never published as framework packages
  contracts/         @cfxdevkit/contracts-dev  — Hardhat project: Solidity sources,
                                                  tests, deploy scripts, wagmi codegen
  devkit/            conflux-devkit            — npx CLI tool: starts an Express server
                                                  that manages a local Conflux node
  devkit-ui/         conflux-devkit-ui         — Next.js UI embedded in conflux-devkit

docs/                API reference and architecture docs
```

---

## Published packages

### Layer 0 — Foundation (always start here)

| Package | What it gives you |
|---|---|
| `@cfxdevkit/core` | RPC clients (EVM + Core Space), contract read/write/deploy, HD wallet, session keys, tx batching, common ABIs, chain configs |

### Layer 1 — Services & tools

| Package | What it gives you |
|---|---|
| `@cfxdevkit/services` | AES-256 encryption, encrypted HD keystore (file-based), Swappi DEX swap |
| `@cfxdevkit/wallet` | Focused re-export of `core`'s wallet API |
| `@cfxdevkit/compiler` | Runtime Solidity compiler (solc-js), pre-built contract templates |
| `@cfxdevkit/devnode` | Local `@xcfx/node` lifecycle: start/stop/mine/faucet — **dev and test only** |
| `@cfxdevkit/contracts` | Generated ABI, bytecode, and deployed addresses for production contracts |

### Layer 2 — React UI

| Package | What it gives you |
|---|---|
| `@cfxdevkit/wallet-connect` | wagmi v2 + ConnectKit + SIWE: `<WalletConnect>`, `AuthProvider`, chain constants |
| `@cfxdevkit/react` | Headless render-prop components: `<ConnectButton>`, `<AccountCard>`, `<ContractReader>`, `<SwapWidget>` |

---

## Local development node — `conflux-devkit`

Start a fully featured local Conflux node in seconds with a browser UI:

```bash
npx conflux-devkit
# opens http://localhost:7748
```

Gives you:
- **Node lifecycle** — start / stop / restart `@xcfx/node`
- **Accounts** — pre-funded genesis accounts, faucet, fund
- **Contracts** — compile and deploy Solidity (from templates or paste your own source)
- **Mining** — manual `mine N blocks` or configure auto-mining interval
- **Network** — inspect and configure RPC ports / chain IDs
- **Wallet** — keystore setup, mnemonic management, lock/unlock

Build from source:

```bash
pnpm --filter conflux-devkit-ui build   # build Next.js UI
pnpm --filter conflux-devkit build      # bundle CLI
node devtools/devkit/dist/cli.js        # run
```

---

## Quick start — framework packages

```bash
pnpm add @cfxdevkit/core                 # foundation — always needed
pnpm add @cfxdevkit/services             # encryption, keystore, swap
pnpm add @cfxdevkit/wallet               # wallet without full RPC layer
pnpm add @cfxdevkit/compiler             # runtime Solidity compilation
pnpm add @cfxdevkit/devnode -D           # local dev node (dev/test only)
pnpm add @cfxdevkit/wallet-connect wagmi viem connectkit @tanstack/react-query
pnpm add @cfxdevkit/react
```

### Read contract state

```typescript
import { ClientManager, ContractReader, ERC20_ABI } from '@cfxdevkit/core';

const client = new ClientManager({ network: 'testnet' });
const reader = new ContractReader(client.evm);
const balance = await reader.read({
  address: '0xTokenAddress',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: ['0xUserAddress'],
});
```

### Wallet connection (React)

```tsx
import { WalletConnect, AuthProvider, wagmiConfig } from '@cfxdevkit/wallet-connect';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Layout({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Anywhere in the tree:
<WalletConnect />
```

### Backend embedded wallet

```typescript
import { EmbeddedWalletManager, generateMnemonic } from '@cfxdevkit/wallet';
import { SwapService } from '@cfxdevkit/services';
import { ClientManager } from '@cfxdevkit/core';

const wallet  = new EmbeddedWalletManager({ mnemonic: generateMnemonic(), networkType: 'testnet' });
const client  = new ClientManager({ network: 'testnet' });
const swapper = new SwapService(client.evm);
```

### Test against a local node

```typescript
import { ServerManager } from '@cfxdevkit/devnode';

const node = new ServerManager();
await node.start();
await node.mine(3);
await node.stop();
```

---

## Contracts — codegen pipeline

The `devtools/contracts` Hardhat project holds the production Solidity sources
(`AutomationManager`, `SwappiPriceAdapter`, `PermitHandler`).

After changing any contract or deploying to a new chain:

```bash
# 1. Compile Solidity + run wagmi codegen → writes packages/contracts/src/generated.ts
pnpm --filter @cfxdevkit/contracts-dev codegen

# 2. Build the published package
pnpm --filter @cfxdevkit/contracts build
```

ABI, bytecode, and chain-keyed addresses are then importable from:

```typescript
import {
  automationManagerAbi,
  automationManagerAddress,
  automationManagerConfig,
  automationManagerBytecode,
} from '@cfxdevkit/contracts';
```

---

## Development

```bash
pnpm install          # install all workspace dependencies
pnpm build            # build all packages in dependency order (turbo)
pnpm test             # run all tests
pnpm type-check       # TypeScript across all packages
pnpm check            # Biome lint + format check
pnpm format           # auto-format all sources
```

Build a single package and everything that depends on it:

```bash
pnpm turbo build --filter=@cfxdevkit/core...
```

---

## Dependency rules

Packages only import from **lower** layers — never sideways, never upward.

```
@cfxdevkit/wallet-connect   @cfxdevkit/react
           ↑                        ↑
       (peer deps: react, wagmi, viem)
                          ↑
@cfxdevkit/wallet   @cfxdevkit/services   @cfxdevkit/compiler   @cfxdevkit/devnode
                          ↑
                 @cfxdevkit/core
                 (external deps: viem, cive)
```

---

## Supported networks

| Network | Chain ID | RPC |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | `https://evm.confluxrpc.com` |
| Conflux eSpace Testnet | 71 | `https://evmtestnet.confluxrpc.com` |
| Conflux eSpace Local | 2030 | `http://localhost:8545` |
| Conflux Core Space Mainnet | 1029 | `https://main.confluxrpc.com` |
| Conflux Core Space Testnet | 1001 | `https://test.confluxrpc.com` |
| Conflux Core Space Local | 2029 | `http://localhost:12537` |

---

## Toolchain

| Tool | Purpose |
|---|---|
| pnpm workspaces | Dependency linking across packages |
| Turborepo | Incremental build pipeline with cache |
| tsup | Bundle each package to ESM |
| TypeScript 5 | Strict type-checking |
| Biome | Lint + format |
| Vitest | Tests with v8 coverage |
| Hardhat | Solidity compilation, testing, deployment (`devtools/contracts`) |
| `@wagmi/cli` | ABI + type codegen from Hardhat artifacts |

---

## License

Apache 2.0 — see `LICENSE` in each package.


A layered, fully typed TypeScript SDK for building on **Conflux eSpace** and
**Conflux Core Space**. Use only the layers your project needs — from raw RPC
clients through to production-ready React components.

---

## Packages

Seven focused packages. Full reference with every export and import recipe →
[docs/PACKAGES.md](docs/PACKAGES.md)

### Layer 0 — Core (always start here)

| Package | Dir | What it gives you |
|---|---|---|
| `@cfxdevkit/core` | `packages/core` | RPC clients (EVM + Core Space), contract read/write/deploy, HD wallet derivation, session keys, transaction batching, common ABIs (`ERC20_ABI`, …), chain configs |

### Layer 1 — Services & tools

| Package | Dir | What it gives you |
|---|---|---|
| `@cfxdevkit/services` | `packages/services` | AES-256 encryption, encrypted HD keystore (file-based), Swappi DEX swap |
| `@cfxdevkit/wallet` | `packages/wallet` | Focused re-export of `core`'s wallet API — use when you don't need the full RPC layer |
| `@cfxdevkit/compiler` | `packages/compiler` | Runtime Solidity compiler (solc-js), pre-built contract templates — works in Node.js and browser |
| `@cfxdevkit/devnode` | `packages/devnode` | Local `@xcfx/node` lifecycle: start/stop/mine/faucet. **Dev and test only.** |

### Layer 2 — React UI

| Package | Dir | What it gives you |
|---|---|---|
| `@cfxdevkit/wallet-connect` | `packages/wallet-connect` | wagmi v2 + ConnectKit + SIWE: `<WalletConnect>`, `AuthProvider`, chain constants, `useNetworkSwitch` |
| `@cfxdevkit/react` | `packages/react` | Headless render-prop components: `<ConnectButton>`, `<AccountCard>`, `<ContractReader>`, `<ContractWriter>`, `<SwapWidget>`, and hooks |

---

## Quick start

```bash
pnpm add @cfxdevkit/core                    # foundation — always needed
pnpm add @cfxdevkit/services                # encryption, keystore, swap
pnpm add @cfxdevkit/wallet                 # wallet logic without full RPC
pnpm add @cfxdevkit/compiler                # runtime Solidity compilation
pnpm add @cfxdevkit/devnode -D          # local dev node (dev/test only)
pnpm add @cfxdevkit/wallet-connect wagmi viem connectkit @tanstack/react-query
pnpm add @cfxdevkit/react
```

### Read contract state

```typescript
import { ClientManager, ContractReader, ERC20_ABI } from '@cfxdevkit/core';

const client = new ClientManager({ network: 'testnet' });
const reader = new ContractReader(client.evm);
const balance = await reader.read({
  address: '0xTokenAddress',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: ['0xUserAddress'],
});
```

### Wallet connection (React)

```tsx
import { WalletConnect, AuthProvider, wagmiConfig } from '@cfxdevkit/wallet-connect';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Layout({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Anywhere in the tree:
<WalletConnect />
```

### Backend embedded wallet

```typescript
import { EmbeddedWalletManager, generateMnemonic } from '@cfxdevkit/wallet';
import { SwapService } from '@cfxdevkit/services';
import { ClientManager } from '@cfxdevkit/core';

const wallet  = new EmbeddedWalletManager({ mnemonic: generateMnemonic(), networkType: 'testnet' });
const client  = new ClientManager({ network: 'testnet' });
const swapper = new SwapService(client.evm);
```

### Test against a local node

```typescript
import { DevKitWithDevNode } from '@cfxdevkit/devnode';

const node = new DevKitWithDevNode();
await node.start();
await node.mine(3);
await node.faucet(testAddress, 100n);
// ... your tests against localhost:8545
await node.stop();
```

---

## Development

```bash
pnpm install          # install all workspace dependencies
pnpm build            # build all packages in dependency order
pnpm test             # run all tests
pnpm type-check       # TypeScript across all packages
pnpm check            # lint + format check (Biome)
pnpm format           # auto-format all sources
```

Build a single package and everything that depends on it:

```bash
pnpm turbo build --filter=@cfxdevkit/core...
```

---

## Dependency rules

Packages only import from **lower** layers — never sideways, never upward.

```
@cfxdevkit/wallet-connect   @cfxdevkit/react
           ↑                        ↑
       (peer deps: react, wagmi, viem)
                          ↑
@cfxdevkit/wallet   @cfxdevkit/services   @cfxdevkit/compiler   @cfxdevkit/devnode
                          ↑
                 @cfxdevkit/core
                 (external deps: viem, cive)
```

---

## Supported networks

| Network | Chain ID | RPC |
|---|---|---|
| Conflux eSpace Mainnet | 1030 | `https://evm.confluxrpc.com` |
| Conflux eSpace Testnet | 71 | `https://evmtestnet.confluxrpc.com` |
| Conflux eSpace Local | 2030 | `http://localhost:8545` |
| Conflux Core Space Mainnet | 1029 | `https://main.confluxrpc.com` |
| Conflux Core Space Testnet | 1001 | `https://test.confluxrpc.com` |
| Conflux Core Space Local | 2029 | `http://localhost:12537` |

---

## Toolchain

| Tool | Purpose |
|---|---|
| pnpm workspaces | Dependency linking across packages |
| Turborepo | Incremental build pipeline with cache |
| tsup | Bundle each package to ESM + CJS |
| TypeScript 5 | Strict type-checking |
| Biome | Lint + format |
| Vitest | Tests with v8 coverage |

---

## License

Apache 2.0 — see `LICENSE` in each package.


