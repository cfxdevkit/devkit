# Changelog

All notable changes to `@cfxdevkit/core` will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.2.0] - 2026-03-25

### Added
- `TxOptions` interface (`timeout`, `gasLimit`, `gasPrice`) for fine-grained tx control
- `stringifyBigInt(value, space?)` utility for safe JSON serialization of BigInt values
- `EspaceClient.callContract<T>()` — typed read-only contract calls on the base client
- `EspaceClient.getBalanceRaw()` — raw bigint balance (no formatting)
- `CoreClient.callContract<T>()`, `CoreClient.getBalanceRaw()`, `CoreClient.getChainId()`
- `EspaceWalletClient.writeAndWait()` — `writeContract` + `waitForTransaction` in one call
- `CoreWalletClient.writeAndWait()` — same convenience for Core Space
- Typed getters: `viemPublicClient`, `viemWalletClient` (eSpace); `civePublicClient`, `civeWalletClient` (Core)

### Changed
- `waitForTransaction` timeout is now configurable (default 30s, was hardcoded 5s)
- `deployContract` accepts `TxOptions` for gas/timeout overrides
- `ChainClient` interface updated: added `getBalanceRaw`, `getChainId`, `callContract`, optional `timeout` param on `waitForTransaction`

---

## [0.1.0] - 2026-02-19

### Added
- Initial SDK extraction from `conflux-devkit` monorepo
- `clients`: `ClientManager`, `CoreClient`, `EspaceClient` (+ wallet/test variants)
- `config`: Chain definitions for Conflux Core Space and eSpace (local/testnet/mainnet)
- `types`: `ChainType`, `UnifiedAccount`, `Address`, `ChainConfig` and all client interfaces
- `utils`: Simple structured logger
- `wallet/derivation`: BIP32/BIP39 HD wallet derivation for both Core and eSpace addresses
- `wallet/session-keys`: `SessionKeyManager` – temporary delegated signing
- `wallet/batching`: `TransactionBatcher` – multi-tx execution
- `wallet/embedded`: `EmbeddedWalletManager` – server-side custody
- `contracts/abis`: ERC-20, ERC-721, ERC-1155 ABIs
- `contracts/deployer`: `ContractDeployer` – deploy to Core or eSpace
- `contracts/interaction`: `ContractReader`, `ContractWriter`
- `services/swap`: `SwapService` – Swappi DEX integration (Uniswap V2)
- `services/keystore`: `KeystoreService` – encrypted HD wallet storage (AES-256-GCM + PBKDF2)
- `services/encryption`: `EncryptionService` – AES-256-GCM crypto primitives

### Changed (from conflux-devkit)
- Removed DevKit backend coupling from all services; services are now standalone classes
- Removed Solidity compiler wrapper (`solc` dependency)
- Removed `ui-headless` hooks (were DevKit-API coupled, not wagmi-native)
- Removed DevNode plugin, CLI binary, MCP server, WebSocket streaming server
- Fixed `@scure/bip39/wordlists/english` import to use `.js` extension for ESM compatibility
- Keystore backwards-compatibility block removed (DevKit-specific legacy)
- `moduleResolution` switched from `node` to `bundler` for correct ESM subpath resolution
