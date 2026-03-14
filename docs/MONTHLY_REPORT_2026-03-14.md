# Monthly Report — March 2026

**Period:** 2026-03-01 → 2026-03-14  
**Repository:** [@cfxdevkit/devkit monorepo](https://github.com/cfxdevkit/devkit)  
**Total commits:** 59  
**Packages released:** v1.0.14 → v1.0.15 → v1.0.16 (all 12 managed packages across 3 patch releases)

---

## Overview

March consolidates the monorepo started in January/February into a
production-ready state. Three categories of work are tracked:

- **New** — packages, apps, or infrastructure that did not exist before March.
- **Update** — shipping improvements, fixes, or new features on top of
  already-delivered work (including the CAS app, which is a bounty winner now
  being refactored and hardened for production deployment).
- **Maintenance** — version bumps, dependency updates, and release pipeline
  fixes with no functional source changes.

The monorepo now ships 12 published `@cfxdevkit/*` packages, a live
documentation site with auto-generated API references, a full-stack reference
application (CAS), a wallet-connect + SIWE developer starter template, and a
complete CI/CD + ARM64 VPS deployment stack.

---

## NEW — `@cfxdevkit/theme` v1.0.0 — Tailwind CSS preset & design tokens

**Note:** Package created this month; not yet published to npm (internal monorepo dependency).  
**Commit:** `0d04d9d`

Brand new package. Provides a shared Tailwind CSS preset and global CSS
variables (design tokens) consumed by both `@cfxdevkit/react` and the CAS /
template frontends, keeping visual consistency across all UI surfaces without
duplicating configuration.

- `src/tailwind/preset.ts` — Tailwind preset with Conflux brand palette,
  typography scale, and component token names.
- `src/css/globals.css` — CSS custom properties for spacing, radius, and colour
  tokens; auto-imported by consuming apps.
- Exported as both ESM and CJS via `tsup`; included in the unified v1.0.16
  release.

---

## NEW — `@cfxdevkit/wallet-connect` — wagmi v2 + ConnectKit + SIWE for Conflux

**npm:** [npmjs.com/package/@cfxdevkit/wallet-connect](https://www.npmjs.com/package/@cfxdevkit/wallet-connect)  
**Commits:** `ef64437`, `0878b58`, `61abdeb`, `50bb71d`, `634d5df`, `a1bfa22`,
`c7295c4`, `fcb377d`, `d552856`, `fd70964`, `e9e3935`, `33cbe7d`

New package delivering the full browser wallet connection layer for Conflux
eSpace applications. The package stub existed in the initial monorepo commit;
all functional implementation landed in March.

New files in this release: `chains.ts` (Conflux eSpace chain configs for wagmi),
`server.ts` (SIWE message verification helpers), `useIsAdmin.ts` (session-based
admin role hook), `ConnectModalContext` (decoupled `ConnectKit` provider wiring).

**SIWE auto-sign hardening** (12 commits) resolved a cluster of reliability
issues when testing against MetaMask, WalletConnect v2, Brave Wallet, and
Coinbase Wallet:

- **Double-init guard:** `WalletConnect EthereumProvider` was instantiated twice
  causing duplicate subscribe events.
- **`ConnectKit` hook scope:** `useModal()` context boundary (`ConnectModalContext`)
  decouples hook from provider timing.
- **Turbopack module deduplication:** `connectkit` resolved to a single instance
  via `turbopack.resolveAlias` to avoid RSC/client split.
- **Synchronous `chainId`:** `window.ethereum.chainId` read synchronously;
  dropped async `eth_chainId` RPC call which introduced a race condition.
- **Auto-sign guard:** SIWE signature blocked until chain switch confirmed;
  `switchChainAsync` awaited for EIP-3085 fallback; ref reset on login failure.
- **`appUrl`:** derived from `window.location.origin` at runtime.
- **`dev:https` script:** local TLS support for Brave's HTTP→HTTPS upgrade.

---

## NEW — `@cfxdevkit/defi-react` — `PoolsProvider` + `useTokenPrice` hooks

**npm:** [npmjs.com/package/@cfxdevkit/defi-react](https://www.npmjs.com/package/@cfxdevkit/defi-react)  
**Commit:** `0d04d9d`

Two new React hooks added to the existing `@cfxdevkit/defi-react` package
(which previously only exported `usePoolTokens`), enabling full DeFi UI
composition in the CAS frontend:

- `PoolsProvider` — React context provider that fetches live Swappi pool data
  and makes it available to child components without prop-drilling.
- `useTokenPrice` — hook that resolves USD price for any eSpace token by
  querying the Swappi pair graph, using WCFX as the reference asset.

Both hooks consume `@cfxdevkit/services/swap` internally and are tested against
the EVM_TESTNET endpoint.

---

## NEW — `@cfxdevkit/executor` — `automation.ts` on-chain automation primitives

**npm:** [npmjs.com/package/@cfxdevkit/executor](https://www.npmjs.com/package/@cfxdevkit/executor)  
**Commit:** `0d04d9d`

New `automation.ts` module in the existing `@cfxdevkit/executor` package. Adds
high-level helpers used by the CAS backend to manage the on-chain strategy
lifecycle: job registration, state machine transitions, and keeper-compatible
execution payloads. Exposed as a new named export in the package's public API
via `tsup.config.ts` subpath update.

---

## NEW — docs-site: TypeDoc API reference + Mermaid architecture diagrams

**Live site:** [cfxdevkit.org](https://cfxdevkit.org)  
**Commits:** `66afab5`, `1e12f01`, `c326633`, `41c4d4a`, `743a706`

The Nextra docs-site already existed (scaffolded in February). The TypeDoc API
reference and architecture diagram layer are new additions this month:

- `scripts/generate-api-docs.mjs` — Turborepo build step that runs TypeDoc over
  all 12 package source trees and outputs MDX files consumed by Nextra.
- `components/Mermaid.tsx` — client component wrapping `mermaid.js` for
  rendering the monorepo dependency-layer diagram in the architecture page.
- `content/architecture.mdx` — new page with Layer 0/1/2 architecture diagrams.
- `content/api/index.mdx` — API reference landing page with per-package links.
- Fixed 928 TypeDoc warnings; corrected three classes of broken links (`.md`
  suffixes in hrefs, `Type.Name` → `Type-Name` slug normalisation, missing
  package-slug prefixes on overview pages).

---

## NEW — `apps/template` — wallet-connect + SIWE developer starter kit

**Commits:** `77d1058`, `38be586`, `aa4cb9f`

Minimal but production-ready starter app that developers can fork to bootstrap
a Conflux dApp. Built from scratch in March as a companion to CAS, demonstrating
the minimal integration surface of `@cfxdevkit/wallet-connect`.

- **Frontend:** Next.js 15 (App Router) + wagmi v2 + ConnectKit + SIWE; pre-wired
  for Conflux eSpace mainnet and testnet via `@cfxdevkit/core/config` chain
  constants.
- **Backend:** Fastify stub with SIWE JWT issuance; Drizzle ORM + better-sqlite3.
- **CI/CD:** dedicated `build-template.yml` + `deploy-template.yml` GitHub
  Actions workflows; deploys independently under its own Caddy virtual host on
  the shared VPS.

---

## NEW — CI/CD: GitHub Actions build / deploy / release pipeline

**Commits:** `0c49d15`, `c6c93a8`, `d3e8ce8`, `38be586`, `0b596a3`

Four new workflows covering CAS and template application delivery (the `ci.yml`
and `release.yml` workflows pre-existed for package publishing):

| Workflow | Trigger | Purpose |
|---|---|---|
| `build-cas.yml` | push to main (paths filter) + `workflow_dispatch` | Build + push `cas-backend` Docker image to GHCR |
| `build-template.yml` | push to main (paths filter) | Build + push `template-backend` image |
| `deploy-cas.yml` | after `build-cas` succeeds | SSH → Hetzner VPS, `docker pull` + `docker-compose up -d` |
| `deploy-template.yml` | after `build-template` succeeds | Same for template |

`pnpm-lock.yaml` added to paths filters; `workflow_dispatch` added to
`build-cas` for emergency hot-fixes that bypass the paths match.

---

## NEW — Ansible VPS provisioning: Hetzner CAX11 (ARM64) — 5 roles

**Commits:** `0c49d15`, `2712af5`, `60fe69a`, `18c5be9`, `df96cef`

Complete idempotent Ansible playbook in `infra/ansible/` for provisioning the
production Hetzner CAX11 ARM64 server from a bare Ubuntu image:

| Role | Responsibility |
|---|---|
| `base` | Security hardening, `deploy` user, NOPASSWD sudo, SSH key injection |
| `docker` | Docker Engine + Compose V2 |
| `caddy` | Reverse proxy with automatic TLS; virtual hosts for CAS, template, monitoring |
| `backups` | restic daily snapshots to Backblaze B2 |
| `monitoring` | Uptime Kuma healthcheck container |

Four bootstrap fixes corrected flag-ordering bugs that prevented provisioning a
fresh VPS: VPS is now fully reproducible with a single `ansible-playbook` run.

---

## UPDATE — CAS app: production refactoring & deployment (bounty winner)

**Commits:** `0c49d15`, `881fe45`, `4218528`, `f1707bc`, `f7db078`, `0d04d9d`,
`b48bc7b`, `d66cb74`, `f1f1827`, `52d9a5c`, `878ea22`, `b8e0cf2`, `c4d5ca8`,
`169fada`, `d267264`, `bb4fac5`, `2896998`, `54983cf`, `666d690`

The Conflux Automation Site (CAS) was a prior bounty winner. This month it was
refactored and integrated into the `@cfxdevkit` monorepo as `apps/cas/`, wired
to the full `@cfxdevkit/*` SDK stack, and hardened for production deployment.
Work is ongoing (WIP).

**Backend refactoring (Fastify + Drizzle + better-sqlite3):**
- SIWE-issued JWT auth middleware; public `/api/status` for health monitoring.
- Drizzle ORM schema for jobs, users, pool state.
- Docker data volume wired; `DATABASE_PATH` env injection.
- GHCR image path corrected to `ghcr.io/cfxdevkit/devkit/cas-backend`.

**Frontend refactoring (Next.js 15 + wagmi v2 + ConnectKit):**
- SSR wagmi client deduplication (single instance across RSC/client boundary).
- Dashboard, StrategyBuilder, SafetyPanel, ApprovalWidget components.
- Network switch banner; SIWE auto-sign flow.

**Docker multi-arch build resolution (10 commits):**
Shipping a `linux/amd64` CI-built image for an ARM64 VPS with `better-sqlite3`
(a native Node.js addon) required resolving a multi-architecture compilation
problem. After five failed approaches (pnpm deploy dropping binaries, symlink
breaks, QEMU SIGILL, `.npmrc` timeout), the solution was switching from
`node:20-slim` to `node:20` which ships prebuilt ARM64 binaries for
`better-sqlite3`, eliminating all native compilation under QEMU. Dockerfile
rewritten with `turbo prune` stage for minimal build context.

---

## UPDATE — `@cfxdevkit/core` v1.0.16 — browser compatibility + client refactor

**npm:** [npmjs.com/package/@cfxdevkit/core](https://www.npmjs.com/package/@cfxdevkit/core)  
**Commits:** `301a98e`, `63757e7`, `01577a8`

- Replaced `node:events` with `eventemitter3` in `ClientManager` so the package
  works in browser bundlers (Next.js, Vite) without a Node.js polyfill shim —
  unblocked the docs-site from using the package directly.
- Internal client modules (`clients/core.ts`, `clients/evm.ts`,
  `clients/manager.ts`) refactored; `utils/logger.ts` and `utils/index.ts`
  updated.
- `src/__tests__/playground-examples.test.ts` added; tests run the same code
  snippets shown in the interactive playground, ensuring examples stay in sync.

---

## UPDATE — `@cfxdevkit/react` v1.0.16 — `AppNavBar` component

**npm:** [npmjs.com/package/@cfxdevkit/react](https://www.npmjs.com/package/@cfxdevkit/react)  
**Commit:** `0d04d9d`

New `AppNavBar` component added to `src/components/nav/`. A responsive navigation
bar pre-configured for Conflux dApps — wraps the ConnectKit connect button,
network indicator, and slot for app-specific nav items. Used directly in both
the CAS and template frontends via `@cfxdevkit/react`.

---

## UPDATE — `@cfxdevkit/services` v1.0.16 — swap service update

**npm:** [npmjs.com/package/@cfxdevkit/services](https://www.npmjs.com/package/@cfxdevkit/services)  
**Commit:** `0d04d9d`

`src/services/swap.ts` and `src/services/index.ts` updated to expose additional
swap path utilities needed by the new `useTokenPrice` hook in `@cfxdevkit/defi-react`.

---

## UPDATE — `@cfxdevkit/contracts` v1.0.16 — standard ABI test suite

**npm:** [npmjs.com/package/@cfxdevkit/contracts](https://www.npmjs.com/package/@cfxdevkit/contracts)  
**Commit:** `0c49d15`

`src/standard-abis.test.ts` added — verifies that all canonical ERC ABI
exports (`erc20Abi`/`ERC20_ABI`, `erc721Abi`/`ERC721_ABI`, etc.) are
well-formed and that both camelCase and UPPER_CASE exports are present and
equal. Prevents regressions from codegen drift.

---

## UPDATE — docs-site: Sandpack playground examples

**Commits:** `8995e9c`, `c6f48a4`, `1b0f38c`, `a65e0d5`, `1518735`

The Sandpack interactive playground existed in the docs-site before March.
Updated this month:

- All examples rewritten to use `EVM_TESTNET` and live `@cfxdevkit/*` packages.
- New example tabs: `@cfxdevkit/wallet` (HD derivation) and `@cfxdevkit/contracts`
  (ABI lookup).
- `viem` pinned to `2.46.2` to fix `Math.pow` BigInt error in the browser
  sandbox.
- Top-level `await` wrapped in async IIFEs for Sandpack compatibility.
- Six EIP-55 address checksums corrected.

---

## UPDATE — Release pipeline: `pnpm pack` normalisation + v1.0.14→v1.0.16

**Commits:** `5916779`, `3359113`, `3d7a35e`, `28a828e`

Three patch releases shipped on 2026-03-01:

- **v1.0.14 → v1.0.15:** Fixed `node:events` browser incompatibility in
  `@cfxdevkit/core` (see core entry above).
- **v1.0.15 → v1.0.16:** Fixed `workspace:*` dependencies not being resolved to
  semver ranges on publish — the release script now runs `pnpm pack` as a
  pre-publish verification step.

Packages with version bump only (no source changes this month):
`@cfxdevkit/compiler`, `@cfxdevkit/devnode`, `@cfxdevkit/protocol`,
`@cfxdevkit/wallet`.

---

## UPDATE — Dev tooling: pre-commit hooks + lint-staged + Biome enforcement

**Commits:** `2672055`, `01577a8`, `4218528`

`simple-git-hooks` + `lint-staged` added at the workspace root. Pre-commit hook
runs `biome check --write` on staged `.ts/.tsx/.json` files, blocking commits
that introduce lint/format regressions. One pre-existing violation fixed
immediately in `@cfxdevkit/core` (string concat → template literal, `useTemplate`
rule). All 59 March commits pass `pnpm check` clean.

---

## Maintenance — `@cfxdevkit/compiler` v1.0.16

**npm:** [npmjs.com/package/@cfxdevkit/compiler](https://www.npmjs.com/package/@cfxdevkit/compiler)

Version bump to v1.0.16 as part of the unified monorepo release. No functional
source changes. Updated `package.json` dependency ranges to reflect the new
`@cfxdevkit/core@^1.0.16` minimum.

---

## Maintenance — `@cfxdevkit/devnode` v1.0.16

**npm:** [npmjs.com/package/@cfxdevkit/devnode](https://www.npmjs.com/package/@cfxdevkit/devnode)

Version bump to v1.0.16. No functional source changes. Updated dependency ranges.

---

## Maintenance — `@cfxdevkit/protocol` v1.0.16

**npm:** [npmjs.com/package/@cfxdevkit/protocol](https://www.npmjs.com/package/@cfxdevkit/protocol)

Version bump to v1.0.16. No functional source changes. Updated dependency ranges.

---

## Maintenance — `@cfxdevkit/wallet` v1.0.16

**npm:** [npmjs.com/package/@cfxdevkit/wallet](https://www.npmjs.com/package/@cfxdevkit/wallet)

Version bump to v1.0.16. No functional source changes. Updated dependency ranges.

---

## Maintenance — `conflux-devkit` v1.0.16 — local development node manager

**npm:** [npmjs.com/package/conflux-devkit](https://www.npmjs.com/package/conflux-devkit)

`conflux-devkit` is the `npx conflux-devkit` CLI tool that starts and manages a
local Conflux development node. Receives the same unified version bump as all
monorepo packages. No functional source changes this month; version bump ensures
consumers using `npx conflux-devkit@latest` always get the matching release.

---

## Summary Table

| # | Task | Type | npm |
|---|---|---|---|
| 1 | `@cfxdevkit/theme` — new Tailwind CSS preset package (not yet on npm) | NEW | — |
| 2 | `@cfxdevkit/wallet-connect` — SIWE + ConnectKit full implementation | NEW | [↗](https://www.npmjs.com/package/@cfxdevkit/wallet-connect) |
| 3 | `@cfxdevkit/defi-react` — PoolsProvider + useTokenPrice hooks | NEW | [↗](https://www.npmjs.com/package/@cfxdevkit/defi-react) |
| 4 | `@cfxdevkit/executor` — automation.ts on-chain automation primitives | NEW | [↗](https://www.npmjs.com/package/@cfxdevkit/executor) |
| 5 | docs-site: TypeDoc API reference + Mermaid architecture diagrams | NEW | — |
| 6 | apps/template — wallet-connect + SIWE developer starter | NEW | — |
| 7 | CI/CD: build/deploy GitHub Actions workflows (4 new) | NEW | — |
| 8 | Ansible VPS provisioning — Hetzner CAX11, 5 roles | NEW | — |
| 9 | CAS app — production refactoring & deployment (bounty winner WIP) | UPDATE | — |
| 10 | `@cfxdevkit/core` — browser compat + client refactor + playground tests | UPDATE | [↗](https://www.npmjs.com/package/@cfxdevkit/core) |
| 11 | `@cfxdevkit/react` — AppNavBar component | UPDATE | [↗](https://www.npmjs.com/package/@cfxdevkit/react) |
| 12 | `@cfxdevkit/services` — swap service update | UPDATE | [↗](https://www.npmjs.com/package/@cfxdevkit/services) |
| 13 | `@cfxdevkit/contracts` — standard ABI test suite | UPDATE | [↗](https://www.npmjs.com/package/@cfxdevkit/contracts) |
| 14 | docs-site: Sandpack playground examples rewrite | UPDATE | — |
| 15 | Release pipeline v1.0.14→v1.0.16 + pnpm pack normalisation | UPDATE | — |
| 16 | Dev tooling: pre-commit hooks + lint-staged | UPDATE | — |
| 17 | `@cfxdevkit/compiler` v1.0.16 — maintenance release | MAINTENANCE | [↗](https://www.npmjs.com/package/@cfxdevkit/compiler) |
| 18 | `@cfxdevkit/devnode` v1.0.16 — maintenance release | MAINTENANCE | [↗](https://www.npmjs.com/package/@cfxdevkit/devnode) |
| 19 | `@cfxdevkit/protocol` v1.0.16 — maintenance release | MAINTENANCE | [↗](https://www.npmjs.com/package/@cfxdevkit/protocol) |
| 20 | `@cfxdevkit/wallet` v1.0.16 — maintenance release | MAINTENANCE | [↗](https://www.npmjs.com/package/@cfxdevkit/wallet) |
| 21 | `conflux-devkit` v1.0.16 — local dev node CLI maintenance release | MAINTENANCE | [↗](https://www.npmjs.com/package/conflux-devkit) |
