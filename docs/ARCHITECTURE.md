# Repository Architecture

`@cfxdevkit` is a TypeScript monorepo for building on the [Conflux](https://confluxnetwork.org/) blockchain.
It covers the full stack: raw on-chain artifacts → framework-agnostic SDK → React UI components → local dev tooling.

---

## Monorepo layout

```
/workspaces/repos
├── packages/          Published @cfxdevkit/* npm packages (production SDK)
├── devtools/          Private tooling (Hardhat project, CLI, dashboard UI)
├── docs/              Documentation
├── docker/            Dockerfile + docker-compose for conflux-devkit
├── scripts/           Release helper scripts
├── turbo.json         Turborepo pipeline config
├── pnpm-workspace.yaml
└── biome.json         Root Biome lint / format config
```

---

## Published packages

All packages live under `packages/` and are published to npm as `@cfxdevkit/*`.

### Dependency layers

Packages only import from **lower** layers — never sideways, never upward.

```
Layer 2 — React / UI (peer deps: react, wagmi, viem)
  @cfxdevkit/wallet-connect   @cfxdevkit/react   @cfxdevkit/defi-react

Layer 1 — Domain services (depend on @cfxdevkit/core)
  @cfxdevkit/services         @cfxdevkit/wallet
  @cfxdevkit/compiler         @cfxdevkit/devnode
  @cfxdevkit/contracts        @cfxdevkit/protocol
  @cfxdevkit/executor

Layer 0 — Foundation (external deps only: viem, cive)
  @cfxdevkit/core
```

### Package summary

| Package | Layer | Purpose |
|---|---|---|
| `@cfxdevkit/core` | 0 | RPC clients (viem + cive), HD wallet derivation, contract utilities, chain configs, automation primitives |
| `@cfxdevkit/contracts` | 1 | Generated DevKit ABIs + addresses, canonical standard ABIs (ERC-20/721/1155/2612/4626), bootstrap library templates |
| `@cfxdevkit/protocol` | 1 | Conflux precompile ABIs (AdminControl, SponsorWhitelist, Staking, CrossSpaceCall, PoSRegister) + deprecated DevKit re-exports |
| `@cfxdevkit/services` | 1 | AES-256-GCM encrypted keystore, Swappi DEX integration, encryption primitives |
| `@cfxdevkit/wallet` | 1 | Re-export facade over `@cfxdevkit/core/wallet` — use when you only need wallet features |
| `@cfxdevkit/compiler` | 1 | Runtime Solidity compilation (solc-js WASM), pre-built contract templates |
| `@cfxdevkit/devnode` | 1 | Programmatic `@xcfx/node` lifecycle — start/stop local Conflux node, mine blocks |
| `@cfxdevkit/executor` | 1 | Strategy execution engine — Executor, KeeperClientImpl, limit order / DCA / TWAP job types |
| `@cfxdevkit/defi-react` | 2 | `usePoolTokens` hook, Swappi pool balance enrichment, DeFi constants |
| `@cfxdevkit/react` | 2 | Unstyled headless React components and hooks for Conflux UI |
| `@cfxdevkit/wallet-connect` | 2 | wagmi v2 + ConnectKit + SIWE wallet connection, pre-configured for Conflux chains |

---

## Devtools (private, not published as `@cfxdevkit/*`)

### `devtools/contracts` — Hardhat project

Package name: `@cfxdevkit/contracts-dev` (private)

- Solidity sources: `AutomationManager`, `SwappiPriceAdapter`, `PermitHandler`, and all bootstrap library contracts
- Compiles with Hardhat and generates TypeScript types
- `wagmi generate` writes `packages/contracts/src/generated.ts` and `packages/contracts/src/bootstrap-abis.ts`

```bash
pnpm --filter @cfxdevkit/contracts-dev codegen   # compile + wagmi generate
pnpm --filter @cfxdevkit/contracts-dev test       # run Hardhat tests
pnpm --filter @cfxdevkit/contracts-dev deploy     # deploy to testnet/mainnet
```

### `devtools/devkit` — conflux-devkit CLI

Package name: `conflux-devkit` (published to npm as the `npx conflux-devkit` tool)

- Express + Socket.IO server managing a local `@xcfx/node` instance
- REST API for node lifecycle, accounts, contracts, bootstrap catalog, mining, network, keystore
- Pre-built Next.js dashboard UI embedded at `/`

### `devtools/devkit-ui` — Next.js dashboard

Package name: `conflux-devkit-ui` (private)

- Next.js 14 app exported as static HTML to `devtools/devkit/ui/`
- Pages: Node, Accounts, Contracts, Bootstrap, Mining, Network, Wallet
- Uses `@cfxdevkit/wallet-connect`, `@cfxdevkit/defi-react`

---

## Build pipeline (Turborepo)

Tasks run in dependency order with caching:

```
pnpm build        # builds all packages + devtools in order
pnpm test         # runs all vitest suites
pnpm type-check   # tsc --noEmit across all packages
pnpm check        # Biome lint + format check
```

Build a single package and everything that depends on it:

```bash
pnpm turbo build --filter=@cfxdevkit/core...
```

### Package build output

Each package uses `tsup` to produce:
- `dist/index.esm.js` — ES module
- `dist/index.cjs.js` — CommonJS
- `dist/index.d.ts` — TypeScript declarations

Subpath exports (e.g. `@cfxdevkit/core/wallet`) are declared in `package.json` `"exports"` map.

---

## Conflux dual-space architecture

Every Conflux chain has two parallel execution spaces on the same underlying chain:

| | Core Space | eSpace |
|---|---|---|
| **API** | Conflux RPC (epoch-based, not block-based) | EVM-compatible JSON-RPC |
| **Addresses** | `cfx:aaa…` (Base32 + checksum) | `0x…` (EVM hex) |
| **Client library** | `cive` | `viem` |
| **Native token** | CFX | CFX (same asset) |
| **Chain IDs** | Mainnet 1029, Testnet 1, Local 2029 | Mainnet 1030, Testnet 71, Local 2030 |

`ClientManager` in `@cfxdevkit/core` manages both simultaneously via `.core` and `.evm` properties.

---

## Codegen pipeline

```
devtools/contracts/contracts/*.sol
        │
        ▼ hardhat compile
devtools/contracts/artifacts/
        │
        ▼ wagmi generate
packages/contracts/src/generated.ts      ← DevKit contract ABIs/addresses
packages/contracts/src/bootstrap-abis.ts ← Bootstrap library ABIs/bytecodes
        │
        ▼ tsup build
packages/contracts/dist/                 ← Published to npm
```

To regenerate after any contract change:

```bash
pnpm --filter @cfxdevkit/contracts-dev codegen
pnpm --filter @cfxdevkit/contracts build
```

---

## Lint and formatting

Biome is used for both linting and formatting across all packages.

- Root `biome.json` — base config with per-package overrides
- `devtools/devkit/`: `scripts/` dir included
- `devtools/devkit-ui/`: accessibility rules relaxed for internal dev UI

```bash
pnpm check           # lint + format check
pnpm format          # auto-format
pnpm check:fix       # auto-fix lint violations
```

---

## Testing

Each package uses `vitest` with v8 coverage.

```bash
pnpm test               # all packages
pnpm test:coverage      # with coverage report (lcov.info per package)
pnpm --filter @cfxdevkit/contracts test   # single package
```

---

## Versioning and release

All packages share a single version number and are released together.

```bash
pnpm release patch    # bump patch, commit, tag, push
pnpm release minor
pnpm release major
pnpm release 1.2.3    # exact version
pnpm release --dry-run patch   # preview
```

The release script (`scripts/release.mjs`) updates all `package.json` versions, creates a git commit and tag, and pushes.

---

## Devcontainer / Codespaces

The repo ships `.devcontainer/devcontainer.json` for instant cloud development:

1. Click **Code → Codespaces → Create codespace on main** on GitHub, or  
2. In VS Code: **Reopen in Container**

The container runs `pnpm install && pnpm build` automatically and forwards ports:

| Port | Service |
|---|---|
| 7748 | conflux-devkit dashboard |
| 8545 | EVM RPC (local node) |
| 8546 | EVM WebSocket |
| 12537 | Core Space RPC |
| 12535 | Core Space WebSocket |
