# GitHub Copilot Instructions — @cfxdevkit Monorepo

This file provides context for AI coding assistants working in the `@cfxdevkit`
TypeScript monorepo. Read it before generating or editing any code.

---

## 1. Project Overview

`@cfxdevkit` is a layered TypeScript SDK for building on the **Conflux**
blockchain (both **eSpace** and **Core Space**). It is a `pnpm` + Turborepo
monorepo. All publishable packages live under `packages/` as `@cfxdevkit/*`.
Private developer tooling lives under `devtools/`.

---

## 2. Code Style & Formatting

### Formatter — Biome 2.x (root `biome.json`)

| Setting | Value |
|---|---|
| Tool | Biome (replaces ESLint + Prettier) |
| Indent | 2 spaces |
| Line width | 80 characters |
| Line endings | LF |
| Quote style | Single quotes |
| Trailing commas | ES5 (objects, arrays — not function params) |
| Semicolons | Always |
| Import organisation | Automatic (`organizeImports: on`) |

**Never configure ESLint or Prettier** — Biome is the single source of truth.

### Key linter rules (enforced)

- `noUnusedVariables` → **error**
- `noUnusedImports` → **error**
- `noUnusedFunctionParameters` → **warn**
- `useExhaustiveDependencies` → **error** (React hooks)
- `useConst` → **error** (prefer `const` over `let`)
- `useTemplate` → **error** (template literals over string concat)
- `useImportType` → **warn** (use `import type` for type-only imports)
- `noExplicitAny` → **warn**

### TypeScript — `tsconfig.base.json`

All packages extend `tsconfig.base.json`:

```jsonc
{
  "target": "ES2022",
  "module": "ESNext",
  "moduleResolution": "bundler",
  "strict": true,
  "isolatedModules": true,
  "verbatimModuleSyntax": false,
  "declaration": true,
  "declarationMap": true,
  "sourceMap": true
}
```

- Always use `import type { ... }` for type-only imports.
- Always include `.js` extension in relative TypeScript import paths (e.g.
  `import { foo } from './foo.js'`), because packages use `"type": "module"`.
- `noEmit: false` — each package emits via `tsup`.
- Test files (`**/*.test.ts`, `**/*.spec.ts`) are excluded from compilation.

### File-level conventions

- License header on every source file:
  ```
  /*
   * Copyright 2025 Conflux DevKit Team
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * ...
   */
  ```
- ABI constants are exported with **two names**: camelCase (`erc20Abi`) and
  UPPER_CASE (`ERC20_ABI`). Always add both when introducing a new ABI export.
- `packages/contracts/src/generated.ts` and `src/bootstrap-abis.ts` are
  **auto-generated** — never edit them by hand. Regenerate with:
  ```bash
  pnpm --filter @cfxdevkit/contracts-dev codegen
  ```

---

## 3. Architecture

### Monorepo layout

```
packages/     @cfxdevkit/* published npm packages
apps/         deployable full-stack applications (backend → VPS, frontend → Vercel)
devtools/     private developer tooling (Hardhat, CLI server, Next.js UI)
docs/         architecture and API documentation
docs-site/    Nextra documentation site → cfxdevkit.org (Vercel)
infra/        Ansible provisioning for the Hetzner VPS
docker/       Dockerfile + docker-compose.yml (local dev only)
scripts/      release.mjs, setup-npm-trust.mjs
biome.json    root Biome config
turbo.json    Turborepo pipeline
tsconfig.base.json  shared TypeScript config
```

### Dependency layers (strict — never import upward or sideways)

```
Layer 2 — React / UI  (peer deps: react, wagmi, viem)
  @cfxdevkit/wallet-connect  @cfxdevkit/react  @cfxdevkit/defi-react

Layer 1 — Domain services  (depend on @cfxdevkit/core)
  @cfxdevkit/services   @cfxdevkit/wallet    @cfxdevkit/compiler
  @cfxdevkit/devnode    @cfxdevkit/contracts @cfxdevkit/protocol
  @cfxdevkit/executor

Layer 0 — Foundation  (external deps only: viem, cive)
  @cfxdevkit/core
```

### Package roles (quick reference)

| Package | Role |
|---|---|
| `@cfxdevkit/core` | RPC clients (`ClientManager`), HD wallet, contract utilities, chain configs, automation primitives |
| `@cfxdevkit/services` | AES-256-GCM keystore, Swappi DEX swap, encryption |
| `@cfxdevkit/wallet` | Thin re-export facade over `@cfxdevkit/core/wallet` |
| `@cfxdevkit/contracts` | Generated ABIs/addresses + canonical ERC ABIs + bootstrap library |
| `@cfxdevkit/protocol` | Conflux precompile ABIs/addresses; deprecated DevKit re-exports |
| `@cfxdevkit/compiler` | Runtime solc-js compilation; always compile to EVM version `paris` |
| `@cfxdevkit/devnode` | `ServerManager` — programmatic `@xcfx/node` lifecycle |
| `@cfxdevkit/executor` | `Executor`, `SafetyGuard`, `KeeperClientImpl`, `RetryQueue`, `PriceChecker` |
| `@cfxdevkit/defi-react` | `usePoolTokens` hook, Swappi pool enrichment |
| `@cfxdevkit/react` | Headless React components + Conflux hooks |
| `@cfxdevkit/wallet-connect` | wagmi v2 + ConnectKit + SIWE for Conflux |

### Conflux dual-space model

Every Conflux chain runs two parallel execution spaces on the same underlying
chain:

| | eSpace | Core Space |
|---|---|---|
| Client library | `viem` | `cive` |
| Addresses | `0x…` (EVM hex) | `cfx:aaa…` (Base32 + checksum) |
| Chain IDs (mainnet/testnet/local) | 1030 / 71 / 2030 | 1029 / 1 / 2029 |
| RPC ports (local node) | 8545 (HTTP), 8546 (WS) | 12537 (HTTP), 12535 (WS) |

`ClientManager` in `@cfxdevkit/core` manages both simultaneously via its
`.evm` (viem) and `.core` (cive) properties. Never construct raw viem/cive
clients directly in application code — use `ClientManager`.

### Key source paths

- `packages/core/src/clients/manager.ts` — `ClientManager` (EventEmitter,
  health monitoring)
- `packages/core/src/wallet/` — HD derivation, `SessionKeyManager`,
  `EmbeddedWalletManager`, `TransactionBatcher`
- `packages/services/src/services/encryption.ts` — `EncryptionService`
- `packages/services/src/services/keystore.ts` — `KeystoreService`
- `packages/executor/src/executor.ts` — `Executor` main loop
- `packages/executor/src/safety-guard.ts` — `SafetyGuard` circuit-breaker
- `packages/protocol/src/precompiles.ts` — Conflux precompile ABIs/addresses
- `devtools/contracts/contracts/` — Solidity sources (AutomationManager,
  PermitHandler, SwappiPriceAdapter, bootstrap library)

### Package exports convention

Each package declares an `"exports"` map in `package.json` for subpath imports
(e.g. `@cfxdevkit/core/wallet`). The `tsup.config.ts` must have a matching
entry for each subpath. Both `esm` and `cjs` formats are always emitted with
`dts: true`. Do not add subpath exports unless both files are updated.

---

## 4. Build & Test Commands

### Root-level (Turborepo — runs all packages in dependency order)

```bash
pnpm build              # build everything
pnpm test               # run all vitest suites
pnpm test:coverage      # tests with lcov coverage per package
pnpm type-check         # tsc --noEmit across all packages
pnpm check              # Biome lint + format check
pnpm format             # auto-format with Biome
pnpm lint:fix           # auto-fix lint violations
```

### Single-package (filter syntax)

```bash
pnpm turbo build --filter=@cfxdevkit/core...   # build core + all dependents
pnpm --filter @cfxdevkit/services test         # test one package
pnpm --filter @cfxdevkit/contracts-dev codegen # regenerate ABIs
```

### Build output (per package — via tsup)

```
dist/index.js        ESM entry
dist/index.cjs       CommonJS entry
dist/index.d.ts      TypeScript declarations
dist/<subpath>/      Subpath export entries (same structure)
```

### Testing framework

Each package uses **Vitest** with **v8 coverage**. Test files live alongside
source files (`*.test.ts` or in `__tests__/`). Run a single test file:

```bash
pnpm --filter @cfxdevkit/core vitest run src/wallet/derivation.test.ts
```

### Codegen pipeline

```bash
pnpm --filter @cfxdevkit/contracts-dev codegen
# runs: hardhat compile → wagmi generate
# writes: packages/contracts/src/generated.ts
#         packages/contracts/src/bootstrap-abis.ts
pnpm --filter @cfxdevkit/contracts build
```

### Release

```bash
pnpm release patch      # bump all packages + git tag + push
pnpm release minor
pnpm release major
pnpm release 1.2.3
pnpm release --dry-run patch
```

The release script (`scripts/release.mjs`) updates every `package.json`
version atomically.

---

## 5. Security-Sensitive Areas

### EncryptionService (`packages/services/src/services/encryption.ts`)

- Algorithm: **AES-256-GCM** (authenticated encryption — provides both
  confidentiality and integrity)
- Key derivation: **PBKDF2-SHA256**, 100,000 iterations
- Salt: 32 bytes, random, stored in keystore JSON
- IV: 12 bytes, random **per encryption operation**, prepended to ciphertext
- Wire format: `base64(IV ‖ EncryptedData ‖ AuthTag)`
- Uses the Web Crypto API (`node:crypto` / `webcrypto.subtle`) — do not
  substitute with third-party crypto libraries.

### KeystoreService (`packages/services/src/services/keystore.ts`)

- Default file path: `~/.devkit.keystore.json`
- Override via env vars: `DEVKIT_KEYSTORE_PATH`, `DEVKIT_DATA_DIR`
- Mnemonics are stored as `'plaintext'` or `'encrypted'` (see
  `MnemonicEntry.type`). Production deployments must use `'encrypted'`.
- The decrypted password (`currentPassword`) is held **in memory only**
  while the keystore is unlocked; it is never written to disk.
- Admin private keys are **not** stored in `KeystoreV2` — admins are
  identified by wallet address (`adminAddresses: string[]`) only.
- `KeystoreLockedError` is thrown for any operation requiring an unlocked
  keystore; always handle this error at the call site.

### SafetyGuard (`packages/executor/src/safety-guard.ts`)

Protects the on-chain executor from runaway execution. Default limits:

| Limit | Default |
|---|---|
| `maxSwapUsd` | $10,000 per swap |
| `maxSlippageBps` | 500 bps (5 %) |
| `maxRetries` | 5 |
| `minExecutionIntervalSeconds` | 30 s |
| `globalPause` | false |

- Always inject a custom `SafetyConfig` (especially `maxSwapUsd`) for
  production deployments — do not rely on defaults.
- `globalPause: true` immediately halts all execution — use as a
  circuit-breaker in incident response.
- Every violation is logged via the injected `AutomationLogger`.

### SessionKeyManager (`packages/core/src/wallet/session-keys/`)

- Session keys have configurable `SessionKeyPermissions` (allowed contracts,
  spending limits, expiry).
- Never grant unrestricted permissions to a session key.
- Session keys are scoped — they cannot be used to call contracts outside
  their permission set.

### Solidity contracts (`devtools/contracts/contracts/`)

- `AutomationManager.sol` — on-chain keeper registry. Sensitive: manages
  strategy ownership and execution authorisation.
- `PermitHandler.sol` — handles ERC-2612 permit-based token approvals.
  Sensitive: processes off-chain signed approvals.
- `SwappiPriceAdapter.sol` — price oracle adapter; verify price feed
  freshness before use.
- `defi/` — DeFi strategy contracts
- `governance/` — governance contracts
- `tokens/` — ERC-20/721/1155 bootstrap templates
- Always compile Solidity with EVM version **`paris`** — Conflux eSpace does
  not support the `PUSH0` opcode introduced in Shanghai/istanbul's successor.

### General security rules

- Never log or expose mnemonics, private keys, or decrypted keystore data.
- Never hardcode RPC URLs, contract addresses, or private keys in source
  files. Use chain config constants from `@cfxdevkit/core/config` or env vars.
- Treat `packages/contracts/src/generated.ts` as an artefact — do not
  manually add addresses or ABIs to it.

---

## 6. Integration Points

### Conflux precompile contracts (`packages/protocol/src/precompiles.ts`)

All Conflux internal contracts share the prefix `0x08880000000000000000000000000000000000`:

| Name | Address suffix | Space |
|---|---|---|
| `AdminControl` | `00` | Core Space |
| `SponsorWhitelist` | `01` | Core Space |
| `Staking` | `02` | Core Space |
| `PoSRegister` | `05` | Core Space |
| `CrossSpaceCall` | `06` | eSpace + Core Space |
| `ParamsControl` | `07` | Core Space |

Import from `@cfxdevkit/protocol` (not `@cfxdevkit/contracts` — those are
DevKit-specific ABIs).

**Migration note**: `@cfxdevkit/protocol/src/abi.ts` re-exports DevKit
contract ABIs for backwards compatibility only — deprecated, will be removed
in v2. Always import DevKit ABIs from `@cfxdevkit/contracts`.

### CrossSpaceCall (`0x0888…0006`)

Enables **synchronous** message passing between eSpace and Core Space. Use the
`crossSpaceCallAbi` from `@cfxdevkit/protocol` with a `viem` client.

### Swappi DEX (`packages/services/src/services/swap.ts`)

Uniswap V2-style DEX on Conflux eSpace. Hardcoded contract addresses:

| Network | Router | Factory |
|---|---|---|
| Mainnet | `0x62B0873…` | `0x36B83F9…` |
| Testnet | `0x62B0873…` | `0x8d0d1c7…` |

The `SwapService` from `@cfxdevkit/services` wraps this — prefer it over
calling the router directly.

### Local dev node (`packages/devnode/`)

`ServerManager` wraps `@xcfx/node`. Ports when running locally:

| Port | Protocol |
|---|---|
| 8545 | eSpace HTTP RPC |
| 8546 | eSpace WebSocket |
| 12537 | Core Space HTTP RPC |
| 12535 | Core Space WebSocket |
| 7748 | conflux-devkit dashboard |

Only use `@cfxdevkit/devnode` in **dev and test** code, never in production.

### ClientManager events

`ClientManager` extends `EventEmitter` and emits typed events:

```typescript
manager.on('manager:ready', () => { /* both clients up */ });
manager.on('client:error', ({ type, chainId, error }) => { /* handle */ });
manager.on('network:switched', ({ from, to }) => { /* handle */ });
```

Always listen for `client:error` in long-running processes.

---

## 7. Refactoring & Cleanup Guidelines

### Security-first refactoring priorities

- **Deprecation removal**: `@cfxdevkit/protocol/src/abi.ts` re-exports are
  deprecated — remove all usages and migrate call sites to
  `@cfxdevkit/contracts` before v2.
- **Plaintext mnemonics**: Any `MnemonicEntry` with `type: 'plaintext'` must
  be flagged in code review. Refactor to enforce `'encrypted'` via type guards
  at the `KeystoreService` boundary.
- **`noExplicitAny` violations**: Treat every `any` as a refactoring target.
  Resolve by introducing proper types or narrowing at the call site.
- **Unused code**: `noUnusedVariables`/`noUnusedImports` are enforced as
  errors — remove dead code rather than suppressing the rule.

### Cleanup patterns

- **String concatenation → template literals**: `useTemplate` is enforced;
  replace all `'a' + b + 'c'` patterns with `` `a${b}c` ``.
- **`let` → `const`**: `useConst` is enforced; audit `let` declarations and
  convert unless reassignment is proven necessary.
- **Value imports of types**: Convert `import { Foo }` to
  `import type { Foo }` wherever `Foo` is only used as a type.
- **Magic numbers/addresses**: Replace hardcoded chain IDs, RPC URLs, or
  contract addresses with constants from `@cfxdevkit/core/config`.

### What NOT to do during refactoring

- Do not edit `packages/contracts/src/generated.ts` or
  `packages/contracts/src/bootstrap-abis.ts` — regenerate via codegen.
- Do not split or rename subpath exports without updating both
  `package.json#exports` and `tsup.config.ts` in lockstep.
- Do not downgrade `SafetyGuard` defaults (`maxSwapUsd`, `maxSlippageBps`)
  during cleanup — treat them as floor values.
- Do not introduce `console.log` for sensitive fields (mnemonics, keys,
  decrypted payloads) even in debug branches.

### Running checks after refactoring

```bash
pnpm check          # Biome lint + format (must be clean)
pnpm type-check     # tsc --noEmit across all packages
pnpm test           # full Vitest suite
pnpm build          # verify dist output regenerates cleanly
```

---

## 8. Deployment Architecture

### Split: Frontend → Vercel, Backend → Hetzner VPS

All deployable applications live under `apps/<name>/` and follow this pattern:

| Component | Location | Deploy target |
|---|---|---|
| Backend API (Fastify/Node) | `apps/<name>/backend/` | Hetzner CAX11 (ARM64) via Docker Compose + SSH |
| Frontend (Next.js) | `apps/<name>/frontend/` | Vercel (GitHub integration, `rootDirectory: apps/<name>/frontend`) |

### docs-site (`docs-site/`)

Already deployed on Vercel (`cfxdevkit.org`) via the Vercel GitHub integration.
No CI workflow needed — Vercel auto-deploys on push to `main`.

### VPS provisioning — Ansible

```bash
cd infra/ansible
cp inventory.ini inventory.local.ini    # fill in VPS IP + key
cp vars/all.yml vars/local.yml          # fill in secrets
ansible-playbook playbook.yml -i inventory.local.ini -e @vars/local.yml
```

Roles: `base` (security hardening) → `docker` → `caddy` (reverse proxy + TLS) →
`backups` (restic daily) → `monitoring` (Uptime Kuma).

### CAS (`apps/cas/`) — canonical template

`apps/cas/` is the first deployable app and the template for all future apps.
Use it as the starting point when scaffolding a new backend+frontend stack.

### `@xcfx/node` / `conflux-devkit` — local dev only

The devtools stack (`docker/`, `devtools/devkit/`) is **never** deployed to the VPS.
It is for local blockchain development only.

---

## 9. Project Conventions Summary

| Convention | Rule |
|---|---|
| Package manager | `pnpm` (v10+) — never use `npm` or `yarn` |
| Monorepo orchestration | Turborepo — use `pnpm turbo <task> --filter=…` |
| Formatter/linter | Biome only — no ESLint, no Prettier |
| TypeScript | Strict mode; extend `tsconfig.base.json` |
| Module format | ESM primary (`"type": "module"`), CJS emitted by tsup |
| Import extensions | Always `.js` in relative imports |
| Type imports | `import type` for type-only imports |
| Build tool | `tsup` — both `esm` and `cjs` targets, `dts: true` |
| Test runner | Vitest with v8 coverage |
| License | Apache-2.0 |
| ABI naming | Both camelCase (`erc20Abi`) and UPPER_CASE (`ERC20_ABI`) |
| Solidity EVM target | Always `paris` (no PUSH0) |
| Layer imports | Never import upward or sideways across layer boundaries |
| Auto-generated files | Never edit `generated.ts` or `bootstrap-abis.ts` |
| Chain configs | Use constants from `@cfxdevkit/core/config`, not magic numbers |
| Deployable apps | Live in `apps/<name>/`; backend → VPS, frontend → Vercel |
| devtools / devkit | Local dev only — never deployed to VPS |
