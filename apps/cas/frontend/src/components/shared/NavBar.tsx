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

import { AppNavBar, type NavLink } from '@cfxdevkit/react/components';
import { useIsAdmin, WalletConnect } from '@cfxdevkit/wallet-connect';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function CasLogo() {
  return (
    <Link
      href="/"
      className="text-lg font-bold text-white flex items-center gap-2 group"
    >
      <div className="bg-gradient-to-br from-conflux-500 to-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(0,120,200,0.5)] group-hover:shadow-[0_0_25px_rgba(0,120,200,0.8)] transition-all">
        <Zap className="h-4 w-4 text-white fill-white" />
      </div>
      <span className="tracking-tight">Conflux Automation</span>
    </Link>
  );
}

/**
 * CAS navigation bar.
 *
 * Composes `<AppNavBar>` from `@cfxdevkit/react` with CAS-specific:
 *   - Logo: Zap icon + "Conflux Automation" wordmark
 *   - Links: Dashboard · Status · (admin) Safety
 *   - Wallet slot: `<WalletConnect>` from `@cfxdevkit/wallet-connect`
 *
 * Must be rendered inside `<Providers>` (WagmiProvider + AuthProvider).
 */
export function CasNavBar() {
  const isAdmin = useIsAdmin();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const links: NavLink[] = [
    ...(mounted && isAdmin
      ? [
          {
            href: '/safety',
            label: 'Safety',
            icon: <ShieldCheck className="h-4 w-4" />,
          },
        ]
      : []),
    {
      href: '/status',
      label: 'Status',
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return (
    <AppNavBar
      logo={<CasLogo />}
      links={links}
      walletSlot={
        !mounted ? (
          <div className="h-8 w-40 rounded-xl bg-slate-800 animate-pulse" />
        ) : (
          <WalletConnect />
        )
      }
      linkComponent={({ href, children, className }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    />
  );
}
