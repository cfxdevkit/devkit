'use client';

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
 * ClientShell — wraps ConnectKit, AuthProvider, and PoolsProvider.
 *
 * This component is loaded via `dynamic({ ssr: false })` in providers.tsx so
 * that connectkit and @walletconnect/sign-client — which access browser globals
 * (indexedDB, window.location, document) at connector-init time — never run
 * during server-side rendering.
 *
 * WagmiProvider and QueryClientProvider live one level up (providers.tsx) and
 * DO render during SSR, so wagmi hooks in page components work correctly
 * without a WagmiProviderNotFoundError.
 */

import { PoolsProvider } from '@cfxdevkit/defi-react';
import { AuthProvider, ConnectModalProvider } from '@cfxdevkit/wallet-connect';
import { ConnectKitProvider } from 'connectkit';
import type { ReactNode } from 'react';

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ConnectKitProvider
      theme="midnight"
      options={{
        hideNoWalletCTA: false,
        walletConnectName: 'WalletConnect',
        // Disable ConnectKit's automatic font injection (<link rel="preload">
        // for Nunito/Inter). We manage fonts ourselves via next/font in
        // layout.tsx, so ConnectKit's preloaded font resources were never
        // consumed and triggered "preloaded but not used" browser warnings.
        avoidLayoutShift: false,
      }}
    >
      {/* ConnectModalProvider MUST be inside ConnectKitProvider. It calls
          useModal() here (safely) and exposes openModal() via React context
          so WalletConnect and page-level connect buttons can trigger the CK
          modal without themselves needing to be inside ConnectKitProvider. */}
      <ConnectModalProvider>
        <AuthProvider>
          <PoolsProvider>{children}</PoolsProvider>
        </AuthProvider>
      </ConnectModalProvider>
    </ConnectKitProvider>
  );
}
