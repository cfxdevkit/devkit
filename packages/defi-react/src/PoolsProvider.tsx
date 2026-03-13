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
 * PoolsProvider — app-level singleton that owns the `usePoolTokens` instance.
 *
 * Why this exists:
 *   Without this provider, `usePoolTokens` would be called inside individual
 *   components (e.g. StrategyBuilder), meaning the /api/pools fetch and
 *   balance RPC calls only started when those modals were opened.
 *
 * With this provider mounted at the app root:
 *   - /api/pools metadata fetch begins on first page paint (no auth required).
 *   - Balance enrichment begins as soon as the wallet connects, independently
 *     of the JWT auth state.
 *   - Deep components get instant token data from the already-running fetch.
 *
 * Place inside WagmiProvider (so useAccount() is available) but it does NOT
 * require auth to be configured.
 */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAccount } from 'wagmi';
import { type UsePoolTokensResult, usePoolTokens } from './usePoolTokens.js';

const PoolsContext = createContext<UsePoolTokensResult | null>(null);

/**
 * Access the shared `UsePoolTokensResult` from anywhere inside `PoolsProvider`.
 *
 * @throws if called outside of `PoolsProvider`
 */
export function usePoolsContext(): UsePoolTokensResult {
  const ctx = useContext(PoolsContext);
  if (!ctx)
    throw new Error('usePoolsContext must be used inside <PoolsProvider>');
  return ctx;
}

/**
 * `PoolsProvider` must be rendered inside `WagmiProvider` so `useAccount()`
 * is available.  Place it in your providers tree after WagmiProvider and
 * AuthProvider.
 */
export function PoolsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { address } = useAccount();

  // Avoid SSR mismatch: useAccount returns undefined server-side. Start the
  // fetch on mount (client only) so the address read is always accurate.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pass address once mounted so:
  //   - Before wallet connect  → address=undefined → pools fetch, no balances
  //   - After wallet connect   → address=0x…      → pools fetch + balances
  const result = usePoolTokens(mounted ? address : undefined);

  return (
    <PoolsContext.Provider value={result}>{children}</PoolsContext.Provider>
  );
}
