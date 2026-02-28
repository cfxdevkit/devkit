# @cfxdevkit/wallet-connect

Wagmi v2 + ConnectKit + SIWE wallet connection layer for Conflux applications.

This package provides:
- A pre-configured `wagmiConfig` with Conflux eSpace mainnet / testnet / local chains
- `<WalletConnect />` — a modal-based connect button (ConnectKit)
- `<AuthProvider />` — SIWE session management
- `useAuthContext()` — access the current authenticated user anywhere in the tree
- `useNetworkSwitch()` — helper to switch between Conflux networks

Previously named `wallet-ui`. Renamed to `@cfxdevkit/wallet-connect`
because it is not CAS-specific and is used by multiple frontends, including the
DevKit dashboard.

---

## Installation

```bash
pnpm add @cfxdevkit/wallet-connect
```

**Peer dependencies** (install separately in your app):

```bash
pnpm add wagmi viem @tanstack/react-query connectkit siwe
```

---

## Usage

### Wrap your app

```tsx
import { AuthProvider } from '@cfxdevkit/wallet-connect';

export default function RootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

### Connect button

```tsx
import { WalletConnect } from '@cfxdevkit/wallet-connect';

export function NavBar() {
  return <WalletConnect />;
}
```

### Auth context

```tsx
import { useAuthContext } from '@cfxdevkit/wallet-connect';

export function UserPanel() {
  const { address, isAuthenticated, signIn, signOut } = useAuthContext();
  // …
}
```

### Wagmi config (for custom wiring)

```typescript
import { wagmiConfig, confluxESpace, confluxESpaceTestnet } from '@cfxdevkit/wallet-connect';
```

---

## Customisation

For project-specific chain sets or WalletConnect project IDs, import the config
primitives and re-compose them in your app:

```typescript
// apps/my-app/src/wagmi.ts
import { createConfig, http } from 'wagmi';
import { confluxESpace } from '@cfxdevkit/wallet-connect';

export const myConfig = createConfig({
  chains: [confluxESpace],
  transports: { [confluxESpace.id]: http('https://my-rpc.example.com') },
  // …
});
```

---

## License

Apache-2.0 — see [LICENSE](./LICENSE).
