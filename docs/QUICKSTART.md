# Quick Start

Get up and running with `@cfxdevkit` in five minutes.

---

## Option A: Local development environment (recommended for first-timers)

The `conflux-devkit` CLI starts a local Conflux node and a browser dashboard — no account, no tokens needed.

```bash
npx conflux-devkit
```

- Opens **http://localhost:7748** automatically
- Starts a local Conflux node with pre-funded genesis accounts
- Lets you compile and deploy Solidity, browse accounts, set up a wallet, and run the Bootstrap catalog

### Docker alternative

```bash
docker run -p 7748:7748 -p 8545:8545 -p 12537:12537 cfxdevkit/devkit
```

---

## Option B: SDK packages in your project

### 1. Install

```bash
pnpm add @cfxdevkit/core                      # always needed
pnpm add @cfxdevkit/services                  # keystore + swap
pnpm add @cfxdevkit/contracts                 # ABIs + addresses
```

### 2. Connect to Conflux eSpace

```typescript
import { ClientManager } from '@cfxdevkit/core';

const client = new ClientManager({ network: 'testnet' });
const block = await client.evm.publicClient.getBlockNumber();
console.log('Block:', block);
```

### 3. Read an ERC-20 balance

```typescript
import { ContractReader, ERC20_ABI } from '@cfxdevkit/core';

const reader = new ContractReader(client);
const balance = await reader.read({
  address: '0xTokenAddress',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: ['0xYourAddress'],
  chain: 'evm',
});
```

### 4. Derive a wallet

```typescript
import { generateMnemonic, deriveAccounts } from '@cfxdevkit/core';

const mnemonic = generateMnemonic();
const accounts = deriveAccounts(mnemonic, { count: 3 });

for (const acc of accounts) {
  console.log(`[${acc.index}] eSpace: ${acc.evmAddress}  Core: ${acc.coreAddress}`);
}
```

### 5. Deploy a contract from the bootstrap library

```typescript
import { erc20BaseAbi, erc20BaseBytecode } from '@cfxdevkit/contracts';
import { parseEther } from 'viem';

const hash = await walletClient.deployContract({
  abi: erc20BaseAbi,
  bytecode: erc20BaseBytecode,
  args: ['My Token', 'MTK', parseEther('1000000'), ownerAddress],
});
```

---

## Option C: React application

### Install

```bash
pnpm add @cfxdevkit/wallet-connect wagmi viem connectkit @tanstack/react-query
pnpm add @cfxdevkit/react
```

### Wrap your app

```tsx
import { AuthProvider } from '@cfxdevkit/wallet-connect';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@cfxdevkit/wallet-connect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function RootLayout({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Add a connect button

```tsx
import { WalletConnect } from '@cfxdevkit/wallet-connect';

export function NavBar() {
  return <WalletConnect />;
}
```

### Access auth state anywhere

```tsx
import { useAuthContext } from '@cfxdevkit/wallet-connect';

export function UserInfo() {
  const { address, isAuthenticated, signIn, signOut } = useAuthContext();
  if (!isAuthenticated) return <button onClick={signIn}>Sign in</button>;
  return <p>{address}</p>;
}
```

---

## Option D: Test against a local node

```typescript
import { ServerManager } from '@cfxdevkit/devnode';
import { ClientManager } from '@cfxdevkit/core';

const node = new ServerManager();
await node.start();

const client = new ClientManager({ network: 'local' });
const accounts = node.getAccounts();  // pre-funded genesis accounts

await node.mine(5);   // advance 5 blocks
await node.stop();
```

---

## Supported networks

| Network | Chain ID | RPC |
|---|---|---|
| eSpace Mainnet | 1030 | `https://evm.confluxrpc.com` |
| eSpace Testnet | 71 | `https://evmtestnet.confluxrpc.com` |
| eSpace Local | 2030 | `http://localhost:8545` |
| Core Space Mainnet | 1029 | `https://main.confluxrpc.com` |
| Core Space Testnet | 1 | `https://test.confluxrpc.com` |
| Core Space Local | 2029 | `http://localhost:12537` |

---

## Where to go next

- [ARCHITECTURE.md](ARCHITECTURE.md) — full monorepo structure and design decisions
- [PACKAGES.md](PACKAGES.md) — per-package API reference and import cheat sheet
- [AGENT-CONTEXT.md](AGENT-CONTEXT.md) — machine-readable codebase map for AI agents
- Package READMEs in `packages/*/README.md`
