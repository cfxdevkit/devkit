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

import { getConfig } from '@cfxdevkit/wallet-connect';
import { getServerConfig } from '@cfxdevkit/wallet-connect/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { type ReactNode, useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';

// ClientShell (ConnectKit + AuthProvider + PoolsProvider) is loaded ssr:false
// so connectkit and @walletconnect/sign-client never run during SSR.
// WagmiProvider and QueryClientProvider are SSR-safe (ssr:true in config) and
// render normally, giving wagmi hooks in page components the context they need.
const ClientShell = dynamic(
  () => import('./client-shell').then((m) => ({ default: m.ClientShell })),
  { ssr: false }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch immediately on tab focus — reduces RPC calls.
      // Data refreshes on the normal polling interval (30 s) instead.
      staleTime: 30_000,
      gcTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * CAS provider tree (outermost → innermost):
 *   WagmiProvider → QueryClientProvider → [ClientShell]
 *     ConnectKitProvider → AuthProvider (SIWE JWT) → PoolsProvider
 *
 * WagmiProvider and QueryClientProvider render during SSR so wagmi hooks work
 * in page components without WagmiProviderNotFoundError.
 * ClientShell (ConnectKit + Auth + Pools) is ssr:false — browser APIs in
 * connectkit / WalletConnect are never evaluated server-side.
 *
 * `initialState` is set by the root Server Component (layout.tsx) from the
 * wagmi cookie so the client hydrates without a flash of "disconnected" state.
 */
export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  // Create the config ONCE per client render (not at module-eval / server time).
  // During SSR (server request), useState still runs its initializer — use
  // getServerConfig() (connector-free) to avoid triggering WalletConnect Core
  // init on the server process.  On the client, getConfig() supplies the full
  // ConnectKit/WalletConnect connectors.  wagmi ssr:true handles the mismatch.
  const [config] = useState(() =>
    typeof window === 'undefined' ? getServerConfig() : getConfig()
  );
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ClientShell>{children}</ClientShell>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
