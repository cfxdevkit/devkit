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
  wallet/            @cfxdevkit/wallet         — focused wallet re-exports (session keys, batching)
  compiler/          @cfxdevkit/compiler       — runtime solc-js + contract templates
  devnode/           @cfxdevkit/devnode        — local @xcfx/node lifecycle (dev only)
  contracts/         @cfxdevkit/contracts      — generated ABI, bytecode, addresses
  protocol/          @cfxdevkit/protocol       — raw on-chain artifacts (ABIs + bytecode)
  executor/          @cfxdevkit/executor      — on-chain execution/keeper runtime primitives
  defi-react/        @cfxdevkit/defi-react     — React helpers for DeFi (pool tokens, pairs)
  react/             @cfxdevkit/react          — headless React components + hooks
  wallet-connect/    @cfxdevkit/wallet-connect — wagmi v2 + ConnectKit + SIWE

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
| `@cfxdevkit/wallet` | Focused re-export of `core`'s wallet API (session keys, batching, embedded wallet) |
| `@cfxdevkit/compiler` | Runtime Solidity compiler (solc-js), pre-built contract templates |
| `@cfxdevkit/devnode` | Local `@xcfx/node` lifecycle: start/stop/mine/faucet — **dev and test only** |
| `@cfxdevkit/contracts` | Generated ABI, bytecode, and deployed addresses for production contracts |
| `@cfxdevkit/protocol` | Low-level on-chain artifacts (ABIs + bytecode) for tooling and scripts |
| `@cfxdevkit/executor` | Keeper / execution primitives for on-chain strategy execution (Limit/DCA/TWAP) |

### Layer 2 — React UI

| Package | What it gives you |
|---|---|
| `@cfxdevkit/defi-react` | DeFi-specific React hooks: pool token resolution, balance enrichment, helpers |
| `@cfxdevkit/wallet-connect` | wagmi v2 + ConnectKit + SIWE: `<WalletConnect>`, `AuthProvider`, chain constants |
| `@cfxdevkit/react` | Headless render-prop components: `<ConnectButton>`, `<AccountCard>`, `<ContractReader>`, `<ContractWriter>`, `<SwapWidget>` |

---

## Local development node — `conflux-devkit`

Start a fully featured local Conflux node in seconds with a browser UI:

```bash
npx conflux-devkit
# opens http://localhost:7748
```

Features:
- **Node lifecycle** — start / stop / restart `@xcfx/node`
- **Accounts** — pre-funded genesis accounts, faucet, fund EVM/Core addresses
- **Contracts** — compile and deploy Solidity (6 built-in templates or paste source)
- **Bootstrap** — one-click deploy from the `@cfxdevkit/contracts` catalog (ERC20Base, VestingSchedule, StakingRewards, …); browse Conflux precompile ABIs
- **Mining** — manual `mine N blocks` or configure auto-mining interval
- **Network** — inspect and configure RPC ports / chain IDs
- **Wallet** — setup wizard (generate / use Hardhat default / import mnemonic), keystore, lock/unlock

**Supported platforms** (via [`@xcfx/node`](https://www.npmjs.com/package/@xcfx/node)):
Linux x64, Linux ARM64, macOS ARM64 (Apple Silicon), Windows x64.
macOS Intel (x64) is not currently supported by `@xcfx/node`.

See [devtools/devkit/README.md](devtools/devkit/README.md) for full CLI documentation.

Build from source:

```bash
pnpm --filter conflux-devkit-ui build   # build Next.js UI
pnpm --filter conflux-devkit build      # bundle CLI
node devtools/devkit/dist/cli.js        # run
```

### Run with Docker

A pre-built Docker image is the easiest way to spin up `conflux-devkit` without
installing Node.js locally. The image is `linux/amd64` only (mirrors the platform
constraint of `@xcfx/node`).

```bash
# One-liner — exposes UI + all RPC ports, persists chain data in a named volume
docker run --rm \
  -p 7748:7748 -p 8545:8545 -p 8546:8546 \
  -p 12537:12537 -p 12535:12535 \
  -v conflux-devkit-data:/root/.conflux-devkit \
  -e DEVKIT_API_KEY=change-me \
  conflux-devkit

# Or with Docker Compose (recommended for repeated use)
cd docker
cp .env.example .env        # set DEVKIT_API_KEY etc.
docker compose up -d
docker compose logs -f
```

| Environment variable  | CLI flag        | Default     | Description                          |
|-----------------------|-----------------|-------------|--------------------------------------|
| `DEVKIT_PORT`         | `--port`        | `7748`      | Web UI port                          |
| `DEVKIT_HOST`         | `--host`        | `0.0.0.0`   | Bind address                         |
| `DEVKIT_API_KEY`      | `--api-key`     | _(none)_    | Bearer token; recommended in Docker  |
| `DEVKIT_CORS_ORIGIN`  | `--cors-origin` | _(none)_    | Allowed CORS origins (comma-separated)|

Build the image locally:

```bash
docker build -t conflux-devkit -f docker/Dockerfile .
```

See [docker/](docker/) for the full `Dockerfile`, `docker-compose.yml`, and
`.env.example`.

---

## Documentation

| Document | Description |
|---|---|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | 5-minute getting started guide |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full monorepo structure and design decisions |
| [docs/PACKAGES.md](docs/PACKAGES.md) | Per-package API reference and import cheat sheet |
| [docs/AGENT-CONTEXT.md](docs/AGENT-CONTEXT.md) | Machine-readable codebase map for AI agents |

---

## Quick start — framework packages

```bash
pnpm add @cfxdevkit/core                 # foundation — always needed
pnpm add @cfxdevkit/services             # encryption, keystore, swap
pnpm add @cfxdevkit/wallet               # wallet without full RPC layer
pnpm add @cfxdevkit/compiler             # runtime Solidity compilation
pnpm add @cfxdevkit/contracts            # generated ABIs, standard token ABIs, bootstrap templates
pnpm add @cfxdevkit/protocol             # Conflux precompile ABIs (AdminControl, Staking, CrossSpaceCall, …)
pnpm add @cfxdevkit/executor             # on-chain execution primitives (keepers)
pnpm add @cfxdevkit/defi-react           # DeFi React hooks + helpers
pnpm add @cfxdevkit/devnode -D           # local dev node (dev/test only)
pnpm add @cfxdevkit/wallet-connect wagmi viem connectkit @tanstack/react-query
pnpm add @cfxdevkit/react
```

### Read contract state

```typescript
import { ClientManager, ContractReader } from '@cfxdevkit/core';
import { erc20Abi } from '@cfxdevkit/contracts';

const client = new ClientManager({ network: 'testnet' });
const reader = new ContractReader(client.evm);
const balance = await reader.read({
  address: '0xTokenAddress',
  abi: erc20Abi,
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

---

## Development

```bash
pnpm install          # install all workspace dependencies
pnpm build            # build all packages in dependency order (turbo)
pnpm test             # run all tests
pnpm test:coverage    # run tests with v8 coverage (outputs lcov.info per package)
pnpm type-check       # TypeScript across all packages
pnpm check            # Biome lint + format check
pnpm format           # auto-format all sources
pnpm release patch    # bump all package versions, commit, tag, push
pnpm release --help   # see: patch | minor | major | x.y.z [--dry-run]
```

Build a single package and everything that depends on it:

```bash
pnpm turbo build --filter=@cfxdevkit/core...
```

### Codespaces / devcontainer

The repository ships a `.devcontainer/devcontainer.json` so you can open it
instantly in GitHub Codespaces or any VS Code-compatible devcontainer host:

1. Click **Code → Codespaces → Create codespace on main** on GitHub, _or_
2. In VS Code with the Dev Containers extension: **Reopen in Container**.

The container:
- Uses `mcr.microsoft.com/devcontainers/javascript-node:22` (Debian bookworm)
- Enables `pnpm` via corepack
- Runs `pnpm install` and `pnpm build` automatically
- Forwards ports 7748, 8545, 8546, 12537 and 12535
- Installs Biome, ESLint, TypeScript and Docker VS Code extensions

---

## Dependency rules

Packages only import from **lower** layers — never sideways, never upward.

```
@cfxdevkit/wallet-connect   @cfxdevkit/react   @cfxdevkit/defi-react
           ↑                        ↑                      ↑
       (peer deps: react, wagmi, viem)
                          ↑
@cfxdevkit/wallet   @cfxdevkit/services   @cfxdevkit/compiler   @cfxdevkit/devnode
@cfxdevkit/contracts   @cfxdevkit/protocol   @cfxdevkit/executor
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
| Hardhat | Solidity compilation, testing, deployment (`devtools/contracts`) |
| `@wagmi/cli` | ABI + type codegen from Hardhat artifacts |

---

## License

Apache 2.0 — see `LICENSE` in each package.


---
