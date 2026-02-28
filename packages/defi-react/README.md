# @cfxdevkit/defi-react

DeFi React hooks for Conflux DevKit — Swappi pool token resolution with on-chain balance enrichment.

## Features

- **`usePoolTokens`** — Fetches the full Swappi token list from your backend, enriches each entry with the connected wallet's live on-chain balance (batched via Multicall3), and caches aggressively in `localStorage` so the UI is instant on re-mount.
- **`getPairedTokens`** — Filter helper to get all tokens paired with a given `tokenIn` address.
- **CFX native support** — A synthetic "CFX (native)" entry at the EIP-7528 sentinel address is included alongside the WCFX ERC-20.
- **Resilience** — Token/pair lists only grow, never shrink. A flaky RPC response that temporarily drops entries cannot remove them from the UI.
- **Contract constants** — Re-exports `AUTOMATION_MANAGER_ABI`, `ERC20_ABI`, `WCFX_ABI`, and `MAX_UINT256` for convenience.

## Installation

```bash
pnpm add @cfxdevkit/defi-react
# or
npm install @cfxdevkit/defi-react
```

## Peer dependencies

```json
{
  "react": ">=18",
  "viem": ">=2.0.0"
}
```

## Usage

### `usePoolTokens`

```tsx
import { usePoolTokens } from '@cfxdevkit/defi-react';

function TokenSelector() {
  const { tokens, pairs, isLoading, error } = usePoolTokens({
    /** URL of your backend /api/pools endpoint */
    poolsApiUrl: '/api/pools',
    /** viem chain — confluxESpace or confluxESpaceTestnet */
    chain: confluxESpace,
    /** Connected wallet address (or undefined if not connected) */
    address: walletAddress,
  });

  if (isLoading) return <p>Loading tokens…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {tokens.map((t) => (
        <li key={t.address}>
          {t.symbol} — {t.balanceFormatted}
        </li>
      ))}
    </ul>
  );
}
```

### `getPairedTokens`

```ts
import { getPairedTokens } from '@cfxdevkit/defi-react';

// Get all tokens that can be swapped with WCFX
const options = getPairedTokens(pairs, wcfxAddress);
```

### Contract constants

```ts
import {
  AUTOMATION_MANAGER_ABI,
  ERC20_ABI,
  WCFX_ABI,
  MAX_UINT256,
} from '@cfxdevkit/defi-react';
```

## Conflux Compatibility

| Network | Chain | Support |
|---|---|---|
| Conflux eSpace Mainnet | `confluxESpace` (1030) | ✅ |
| Conflux eSpace Testnet | `confluxESpaceTestnet` (71) | ✅ |
