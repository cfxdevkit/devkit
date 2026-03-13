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

import {
  EXPECTED_CHAIN_NAME,
  useAuthContext,
  useNetworkSwitch,
  useOpenConnectModal,
} from '@cfxdevkit/wallet-connect';
import { useAccount } from 'wagmi';

// ── Hero connect button ───────────────────────────────────────────────────────
function HeroConnectButton() {
  const openModal = useOpenConnectModal();
  return (
    <button
      type="button"
      onClick={openModal ?? undefined}
      disabled={!openModal}
      className="group relative inline-flex items-center justify-center bg-conflux-600 hover:bg-conflux-500 disabled:opacity-60 disabled:cursor-default text-white text-lg font-semibold py-4 px-10 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(0,120,200,0.6)] hover:shadow-[0_0_60px_-15px_rgba(0,120,200,0.8)]"
    >
      Connect Wallet
    </button>
  );
}

// ── Auth status card ──────────────────────────────────────────────────────────
function AuthCard() {
  const { address, isAuthenticated, isLoading, error, login, logout } =
    useAuthContext();
  const { isConnected } = useAccount();
  const { isWrongNetwork, handleSwitchNetwork } = useNetworkSwitch();

  if (!isConnected) return null;

  return (
    <div className="mt-8 max-w-sm mx-auto rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Wallet</span>
        <span className="font-mono text-slate-200 text-xs">
          {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—'}
        </span>
      </div>

      {isWrongNetwork && (
        <div className="rounded-lg bg-yellow-900/40 border border-yellow-700 p-3 text-yellow-300 text-xs">
          <p className="mb-2">
            Please switch to <strong>{EXPECTED_CHAIN_NAME}</strong>.
          </p>
          <button
            type="button"
            onClick={handleSwitchNetwork}
            className="underline hover:no-underline"
          >
            Switch network
          </button>
        </div>
      )}

      {isLoading && <p className="text-slate-400 animate-pulse">Signing in…</p>}

      {error && !isLoading && (
        <div className="rounded-lg bg-red-900/40 border border-red-700 p-3 text-red-300 text-xs">
          <p className="mb-2">{error}</p>
          <button
            type="button"
            onClick={login}
            className="underline hover:no-underline"
          >
            Retry sign-in
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-slate-400">SIWE</span>
        <span className={isAuthenticated ? 'text-green-400' : 'text-slate-500'}>
          {isAuthenticated ? 'Authenticated' : 'Not signed in'}
        </span>
      </div>

      {isAuthenticated && (
        <button
          type="button"
          onClick={logout}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Disconnect &amp; sign out
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Hero */}
      <h1 className="text-4xl font-bold text-white mb-4">
        Conflux DevKit Template
      </h1>
      <p className="text-slate-400 max-w-md mb-10">
        Starter template with wallet connection, SIWE authentication, and the
        full <span className="text-conflux-400 font-semibold">@cfxdevkit</span>{' '}
        theme wired up and ready to go.
      </p>

      {!isConnected && <HeroConnectButton />}
      <AuthCard />
    </div>
  );
}
