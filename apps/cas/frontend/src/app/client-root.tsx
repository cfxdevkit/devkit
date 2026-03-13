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
 * ClientRoot — thin `'use client'` shell around the provider tree.
 *
 * WHY THIS EXISTS
 * ───────────────
 * `Providers` (wagmi + QueryClient) is a Client Component and renders during
 * SSR, giving page-level wagmi hooks the WagmiProvider context they need.
 * The ConnectKit / WalletConnect layer is deferred to `ClientShell` (ssr:false)
 * inside providers.tsx, so browser-only APIs (indexedDB, window.location, etc.)
 * are never accessed server-side.
 *
 * Reference: https://wagmi.sh/react/guides/ssr
 */

import type { ReactNode } from 'react';
import type { State } from 'wagmi';
import { CasNavBar } from '../components/shared/NavBar';
import { Providers } from './providers';

interface ClientRootProps {
  children: ReactNode;
  initialState?: State;
}

/**
 * Renders the provider tree and navigation bar.
 * Used as the top-level shell inside `<body>` in the root layout.
 */
export function ClientRoot({ children, initialState }: ClientRootProps) {
  return (
    <Providers initialState={initialState}>
      <CasNavBar />
      <main>{children}</main>
    </Providers>
  );
}
