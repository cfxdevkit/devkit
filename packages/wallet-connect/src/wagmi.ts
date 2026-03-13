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

import { getDefaultConfig } from 'connectkit';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import {
  confluxESpace,
  confluxESpaceTestnet,
  confluxLocalESpace,
} from './chains.js';

export {
  confluxCore,
  confluxCoreTestnet,
  confluxESpace,
  confluxESpaceTestnet,
  confluxLocalCore,
  confluxLocalESpace,
} from './chains.js';

/**
 * Returns a new Wagmi config for use in the browser (ConnectKit + WalletConnect
 * connectors included).
 *
 * For Next.js App Router SSR, call this only in Client Components.  In Server
 * Components (e.g. layout.tsx) use `getServerConfig` from
 * `@cfxdevkit/wallet-connect/server` instead — it is connector-free and safe
 * to import in Node.js.
 *
 * SSR configuration follows https://wagmi.sh/react/guides/ssr:
 *   `ssr: true` — defers browser-store reads until after client-side mount.
 *   `cookieStorage` — persists connection state in cookies for server hydration.
 */
export function getConfig() {
  return createConfig({
    ...getDefaultConfig({
      // Chain and transport config is shared with getServerConfig() in server.ts.
      // Keep both in sync if you add or remove chains.
      chains: [
        confluxESpace,
        confluxLocalESpace,
        confluxESpaceTestnet,
        mainnet,
        sepolia,
      ],
      transports: {
        [confluxESpace.id]: http(),
        [confluxLocalESpace.id]: http(),
        [confluxESpaceTestnet.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
      walletConnectProjectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
        'conflux-devkit-local',
      appName: 'Conflux DevKit',
      appDescription: 'Development toolkit for Conflux blockchain',
      appUrl: 'https://conflux-devkit.dev',
      appIcon: 'https://conflux-devkit.dev/icon.png',
    }),
    // ── SSR configuration ──────────────────────────────────────────────────
    // `ssr: true` prevents wagmi (and the WalletConnect connector) from
    // accessing browser-only APIs (indexedDB, localStorage, window.location)
    // during server-side rendering. Without this flag, Next.js SSR crashes
    // with "ReferenceError: indexedDB / window is not defined".
    ssr: true,
    // Cookie storage lets the server read the previously persisted chain /
    // connection state and pass it as `initialState` to <WagmiProvider> so
    // the client hydrates without a visible "disconnected" flash.
    storage: createStorage({ storage: cookieStorage }),
  });
}

/**
 * Pre-built config singleton for convenience when SSR hydration is not
 * required (e.g. plain React SPA, Vite, tests).
 *
 * For Next.js App Router use `getConfig()` + `cookieToInitialState` in the
 * root layout Server Component instead (see `getConfig` JSDoc above).
 */
export const wagmiConfig = getConfig();
