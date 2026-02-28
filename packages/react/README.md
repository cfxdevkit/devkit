# @cfxdevkit/react

A set of unstyled React hooks, providers, and utilities tailored to building Conflux experiences with your own design system.

Features:
- `DevKitProvider` establishes RPC endpoints for Core/eSpace chains and exposes the current wallet context.
- React hooks such as `useBalance`, `useContract`, and `useTransaction` that wrap the shared Conflux clients.
- Fully tree-shakeable exports so you only ship what you need.

## Getting started

```tsx
import { DevKitProvider, useBalance } from '@cfxdevkit/react';

const App = () => (
  <DevKitProvider apiUrl="http://localhost:3001" network="testnet">
    <YourComponent />
  </DevKitProvider>
);
```

## Development

```bash
pnpm --filter @cfxdevkit/react install
pnpm --filter @cfxdevkit/react build
pnpm --filter @cfxdevkit/react test
```

## Testing and linting

- Tests run with `vitest`.
- Formatting and linting use Biome.
