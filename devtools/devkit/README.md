# conflux-devkit

Local Conflux development environment — instant local node with a web dashboard.

## Usage

```bash
npx conflux-devkit
```

Opens the dashboard at **http://localhost:7748** and starts a local `@xcfx/node`
Conflux node automatically.

## Options

```
conflux-devkit [options]

  -p, --port <port>       Dashboard port (default: 7748)
  --host <address>        Network interface to bind on (default: 127.0.0.1)
                          Use 0.0.0.0 to expose on all interfaces.
  --api-key <secret>      Require Bearer token on all API requests.
                          Strongly recommended when --host is not 127.0.0.1.
  --cors-origin <origin>  Allowed CORS origin(s), comma-separated.
  --no-open               Skip opening the browser automatically.
  -h, --help              Show help.
```

## Dashboard features

| Tab | What you can do |
|---|---|
| **Node** | Start / stop / restart the local Conflux node, view live logs |
| **Accounts** | Browse genesis pre-funded accounts, fund EVM or Core Space addresses, one-click faucet |
| **Contracts** | Compile and deploy Solidity — choose from 6 built-in templates or paste custom source, call deployed contract functions |
| **Bootstrap** | One-click deploy from the production-ready `@cfxdevkit/contracts` catalog; browse Conflux precompile ABIs and addresses |
| **Mining** | Mine N blocks on demand, or set an auto-mining interval (ms) |
| **Network** | View and update RPC / WebSocket ports and chain IDs |
| **Wallet** | First-time setup wizard (generate new mnemonic, use Hardhat default, or import existing), encrypted HDKeystore, lock / unlock |

### Built-in Solidity templates (Contracts tab)

| Template | Level | What it demonstrates |
|---|---|---|
| Counter | Beginner | State variable, increment/decrement, events |
| BasicNFT | Intermediate | ERC-721, minting, ownership |
| Voting | Intermediate | Proposals, weighted votes, delegation |
| Escrow | Intermediate | Two-party payment release with arbiter |
| MultiSigWallet | Advanced | M-of-N signature threshold, owner management |
| Registry | Advanced | Key-value store, access control, update logs |

### Bootstrap catalog (Bootstrap tab)

Production-ready contracts from `@cfxdevkit/contracts`:

| Contract | Category | Description |
|---|---|---|
| ERC20Base | tokens | Capped, burnable, pausable ERC-20 with EIP-2612 permit and role-based minter/pauser |
| ERC721Base | tokens | Enumerable ERC-721 NFT with URI storage, ERC-2981 royalties, role-based minter/pauser |
| ERC1155Base | tokens | Multi-token ERC-1155 with per-token supply caps and ERC-2981 royalties |
| WrappedCFX | tokens | WETH9-identical native CFX wrapper |
| StakingRewards | defi | Synthetix-style staking — stake token A, earn token B |
| VestingSchedule | defi | Multi-beneficiary cliff + linear vesting with revocation |
| MerkleAirdrop | defi | Pull-based Merkle proof airdrop with bitmap claim tracking |
| MultiSigWallet | governance | M-of-N multisig with expiry and cancellation |
| PaymentSplitter | utils | Immutable proportional revenue splitter (CFX + ERC-20) |
| MockPriceOracle | mocks | Chainlink AggregatorV3Interface mock for testing |

### Conflux precompile reference (Bootstrap tab)

Pre-deployed Conflux system contracts (address + ABI only — cannot be redeployed):

| Precompile | Address | Description |
|---|---|---|
| AdminControl | `0x0888…0000` | Contract admin management (Core Space) |
| SponsorWhitelist | `0x0888…0001` | Gas/collateral sponsorship (Core Space) |
| Staking | `0x0888…0002` | PoS staking (Core Space) |
| CrossSpaceCall | `0x0888…0006` | Core ↔ eSpace messaging |

## Local RPC endpoints (default ports)

| Protocol | URL |
|---|---|
| EVM RPC | `http://localhost:8545` |
| EVM WebSocket | `ws://localhost:8546` |
| Core Space RPC | `http://localhost:12537` |
| Core Space WebSocket | `ws://localhost:12535` |

## Security

When running with the default `--host 127.0.0.1` (loopback) no authentication
is required — only processes on the same machine can connect.

When exposing on a network interface (`--host 0.0.0.0`), always set `--api-key`:

```bash
npx conflux-devkit --host 0.0.0.0 --api-key mysecrettoken
```

All `/api/*` routes then require:

```
Authorization: Bearer mysecrettoken
```

## Build from source

```bash
# From the monorepo root
pnpm --filter conflux-devkit-ui build   # compile Next.js UI to devtools/devkit/ui/
pnpm --filter conflux-devkit build      # bundle server + CLI to devtools/devkit/dist/

# Run locally
node devtools/devkit/dist/cli.js
```

## REST API

All endpoints are served at `http://localhost:<port>/api/`. When `--api-key` is set, every request must include `Authorization: Bearer <key>`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/devnode/status` | Node running status and PID |
| POST | `/api/devnode/start` | Start the local Conflux node |
| POST | `/api/devnode/stop` | Stop the local Conflux node |
| GET | `/api/accounts` | List genesis pre-funded accounts |
| POST | `/api/accounts/fund` | Fund an address from genesis |
| GET | `/api/contracts` | List deployed contracts |
| POST | `/api/contracts/compile` | Compile Solidity source |
| POST | `/api/contracts/deploy` | Deploy compiled contract |
| POST | `/api/contracts/call` | Read a contract function |
| POST | `/api/contracts/write` | Write to a contract function |
| GET | `/api/bootstrap/catalog` | List the bootstrap contract catalog |
| GET | `/api/bootstrap/catalog/:name` | Get full catalog entry (ABI + bytecode) |
| POST | `/api/bootstrap/deploy` | Deploy a catalog contract |
| POST | `/api/mining/mine` | Mine N blocks |
| POST | `/api/mining/start` | Start auto-mining at an interval |
| POST | `/api/mining/stop` | Stop auto-mining |
| GET | `/api/network` | Get current RPC/chain config |
| PUT | `/api/network` | Update RPC/chain config |
| GET | `/api/keystore/status` | Keystore lock status |
| POST | `/api/keystore/setup` | First-time keystore setup |
| POST | `/api/keystore/unlock` | Unlock keystore with password |
| POST | `/api/keystore/lock` | Lock keystore |

### Bootstrap deploy example

```bash
curl -X POST http://localhost:7748/api/bootstrap/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ERC20Base",
    "args": ["My Token", "MTK", "1000000000000000000000000", "0xYourAddress"],
    "chain": "evm",
    "accountIndex": 0
  }'
```

## WebSocket events

The server emits real-time events over WebSocket at `ws://localhost:<port>/ws`.
All messages are JSON with a `type` field:

| Event | Payload |
|---|---|
| `node:log` | `{ line: string }` — raw node log output |
| `node:status` | `{ running: boolean, pid?: number }` — node lifecycle change |
| `node:mined` | `{ blocks: number, hash: string }` — blocks mined |

## Platform support

`conflux-devkit` runs on any platform supported by [`@xcfx/node`](https://www.npmjs.com/package/@xcfx/node):

| OS | Architecture | Status |
|---|---|---|
| Linux | x64 | ✅ Supported |
| Linux | ARM64 | ✅ Supported |
| macOS | ARM64 (Apple Silicon) | ✅ Supported |
| macOS | x64 (Intel) | ❌ Not supported by `@xcfx/node` |
| Windows | x64 | ✅ Supported |

Node.js 20 or later is required.

## Environment data

Node data (keystore, genesis accounts, chain state) is stored per-wallet in
`~/.conflux-devkit/wallets/<wallet-id>/data/`. Delete this directory to reset
all state for a specific wallet, or remove `~/.conflux-devkit/` to start
fresh.

