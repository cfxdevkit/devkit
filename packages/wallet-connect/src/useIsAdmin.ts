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

'use client';

import { useAccount } from 'wagmi';

/**
 * useIsAdmin — returns `true` if the connected wallet address is in the
 * `NEXT_PUBLIC_ADMIN_ADDRESSES` whitelist.
 *
 * The env var accepts a comma-separated list of checksummed or lowercase
 * 0x addresses.  When absent or empty, every address returns `false`,
 * keeping privileged UI hidden until an admin list is configured.
 *
 * @example
 * ```tsx
 * const isAdmin = useIsAdmin();
 * if (isAdmin) return <SafetyPanel />;
 * ```
 */
export function useIsAdmin(): boolean {
  const { address } = useAccount();
  if (!address) return false;

  const raw = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ?? '';
  if (!raw.trim()) return false;

  const adminSet = new Set(
    raw
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter((a) => /^0x[0-9a-f]{40}$/i.test(a))
  );

  return adminSet.has(address.toLowerCase());
}
