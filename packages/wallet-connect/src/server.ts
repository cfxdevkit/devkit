/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @cfxdevkit/wallet-connect/server
 *
 * Server-safe subpath export — imports ONLY from `wagmi` and `wagmi/chains`.
 * Does NOT import connectkit, @walletconnect/* or any other package that
 * accesses browser globals at module-evaluation time.
 *
 * Use this subpath in Next.js Server Components (e.g. app/layout.tsx) to read
 * the wagmi cookie and compute `initialState` for `<WagmiProvider>`:
 *
 * ```ts
 * // app/layout.tsx  (Server Component)
 * import { getServerConfig, cookieToInitialState } from '@cfxdevkit/wallet-connect/server';
 * import { headers } from 'next/headers';
 *
 * export default async function RootLayout({ children }) {
 *   const cookie = (await headers()).get('cookie');
 *   const initialState = cookieToInitialState(getServerConfig(), cookie);
 *   return (
 *     <html>
 *       <body>
 *         <Providers initialState={initialState}>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * WHY A SEPARATE SUBPATH?
 * ───────────────────────
 * The main `@cfxdevkit/wallet-connect` entry imports ConnectKit which
 * transitively imports `@walletconnect/sign-client`.  That library reads
 * `window.location.protocol`, `document`, `indexedDB`, etc. at module-
 * evaluation time — before any `typeof window` guard can intercept them.
 * Importing it from a Server Component causes Next.js to crash immediately.
 *
 * By keeping the server entrypoint wagmi-only we avoid the problem entirely
 * without needing global polyfills or `dynamic({ ssr: false })` workarounds
 * just for the cookie-hydration step.
 *
 * Reference: https://wagmi.sh/react/guides/ssr
 */

import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import {
  confluxESpace,
  confluxESpaceTestnet,
  confluxLocalESpace,
} from './chains.js';

export { cookieToInitialState } from 'wagmi';

/**
 * Creates a minimal wagmi config for server-side cookie hydration.
 *
 * This config is intentionally **connector-free**.  Connectors
 * (MetaMask, WalletConnect, etc.) are browser-only and set up by the full
 * `getConfig()` in the client entry.  The server only needs the chain list
 * and storage configuration to correctly parse the cookie.
 *
 * The chain list and storage MUST match `getConfig()` in `wagmi.ts`.
 */
export function getServerConfig() {
  return createConfig({
    chains: [
      confluxESpace,
      confluxLocalESpace,
      confluxESpaceTestnet,
      mainnet,
      sepolia,
    ],
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [confluxESpace.id]: http(),
      [confluxLocalESpace.id]: http(),
      [confluxESpaceTestnet.id]: http(),
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}
