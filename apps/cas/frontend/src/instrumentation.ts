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
 * Next.js Instrumentation — runs once at server start, before any SSR request.
 *
 * The ConnectKit / WalletConnect browser-global issue is solved at the
 * architectural level:
 *   1. `layout.tsx` imports only from `@cfxdevkit/wallet-connect/server` — a
 *      wagmi-only subpath that contains no ConnectKit/WalletConnect deps.
 *   2. `client-root.tsx` loads the full provider tree via `next/dynamic` with
 *      `ssr: false` — ConnectKit/WalletConnect never execute during SSR.
 *
 * No browser-global polyfills are required here.
 *
 * Reference: https://wagmi.sh/react/guides/ssr
 */
export async function register() {
  // intentionally empty — see comment above
}
