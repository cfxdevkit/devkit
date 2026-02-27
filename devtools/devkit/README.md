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
| **Mining** | Mine N blocks on demand, or set an auto-mining interval (ms) |
| **Network** | View and update RPC / WebSocket ports and chain IDs |
| **Wallet** | Configure an encrypted HDKeystore, manage mnemonic, lock / unlock |

### Built-in Solidity templates

| Template | Level | What it demonstrates |
|---|---|---|
| Counter | Beginner | State variable, increment/decrement, events |
| BasicNFT | Intermediate | ERC-721, minting, ownership |
| Voting | Intermediate | Proposals, weighted votes, delegation |
| Escrow | Intermediate | Two-party payment release with arbiter |
| MultiSigWallet | Advanced | M-of-N signature threshold, owner management |
| Registry | Advanced | Key-value store, access control, update logs |

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

## WebSocket events

The server emits real-time events over WebSocket at `ws://localhost:<port>/ws`.
All messages are JSON with a `type` field:

| Event | Payload |
|---|---|
| `node:log` | `{ line: string }` — raw node log output |
| `node:status` | `{ running: boolean, pid?: number }` — node lifecycle change |
| `node:mined` | `{ blocks: number, hash: string }` — blocks mined |

## Environment data

Node data (keystore, genesis accounts, chain state) is stored in
`devtools/devkit/data/` by default. Delete this directory to reset all state.
