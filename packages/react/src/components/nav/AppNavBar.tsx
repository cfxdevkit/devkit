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

import type { ReactNode } from 'react';

/**
 * Descriptor for a navigation link in the `AppNavBar`.
 *
 * @property href      - The link target URL.
 * @property label     - Visible link text.
 * @property icon      - Optional leading icon (any ReactNode, e.g. a
 *                       `lucide-react` icon).  The consumer supplies icons so
 *                       this package has no icon-library dependency.
 * @property adminOnly - When `true` the link is omitted from the nav.
 *                       Consumers compute visibility before passing links in
 *                       (see `useIsAdmin` from `@cfxdevkit/wallet-connect`).
 */
export interface NavLink {
  href: string;
  label: string;
  icon?: ReactNode;
  adminOnly?: boolean;
}

export interface AppNavBarProps {
  /**
   * Brand logo / wordmark rendered on the left.
   * Pass `null` or omit to render nothing.
   */
  logo?: ReactNode;
  /**
   * Navigation links rendered in the centre.
   * Links with `adminOnly: true` are filtered out automatically.
   */
  links?: NavLink[];
  /**
   * Wallet widget rendered on the right (e.g. `<WalletConnect />` from
   * `@cfxdevkit/wallet-connect`).
   */
  walletSlot?: ReactNode;
  /**
   * Custom anchor renderer — defaults to a plain `<a>` tag.
   * Override with Next.js `<Link>` for client-side navigation:
   * ```tsx
   * linkComponent={({ href, children, className }) => (
   *   <Link href={href} className={className}>{children}</Link>
   * )}
   * ```
   */
  linkComponent?: (props: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => JSX.Element;
}

function DefaultLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/**
 * `AppNavBar` — headless, framework-agnostic sticky navigation bar.
 *
 * Ships with no icon library dependency. Styling relies on Tailwind classes
 * defined in `@cfxdevkit/theme`. All non-trivial content (logo, icons, wallet
 * widget) is passed via props so consumers remain fully in control.
 *
 * @example
 * ```tsx
 * import { Zap, Activity } from 'lucide-react';
 * import { AppNavBar } from '@cfxdevkit/react/components';
 * import { WalletConnect } from '@cfxdevkit/wallet-connect';
 *
 * <AppNavBar
 *   logo={<span className="font-bold text-white">My App</span>}
 *   links={[{ href: '/status', label: 'Status', icon: <Activity className="h-4 w-4" /> }]}
 *   walletSlot={<WalletConnect />}
 * />
 * ```
 */
export function AppNavBar({
  logo,
  links = [],
  walletSlot,
  linkComponent: LinkComp = DefaultLink,
}: AppNavBarProps): JSX.Element {
  const visibleLinks = links.filter((l) => !l.adminOnly);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-md px-4 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">{logo ?? null}</div>

        {/* Links */}
        {visibleLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-6 text-slate-400 text-sm font-medium">
            {visibleLinks.map((link) => (
              <LinkComp
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                {link.icon}
                {link.label}
              </LinkComp>
            ))}
          </div>
        )}

        {/* Wallet slot */}
        <div className="min-w-[120px] flex justify-end">
          {walletSlot ?? null}
        </div>
      </div>
    </nav>
  );
}
