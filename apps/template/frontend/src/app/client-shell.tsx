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
 * ClientShell — wraps ConnectKit, ConnectModalProvider, and AuthProvider.
 *
 * Loaded via `dynamic({ ssr: false })` in providers.tsx so that connectkit
 * and @walletconnect/sign-client — which access browser globals (indexedDB,
 * window.location, document) at connector-init time — never run during SSR.
 *
 * IMPORTANT: useModal() is called in InnerShell (plain app code, not in
 * transpilePackages) so it resolves connectkit from the same module instance
 * as ConnectKitProvider. Calling useModal() inside @cfxdevkit/wallet-connect
 * (a transpilePackages package) would produce a different module instance and
 * throw "ConnectKit Hook must be inside a Provider".
 */

import { AuthProvider, ConnectModalProvider } from '@cfxdevkit/wallet-connect';
import { ConnectKitProvider, useModal } from 'connectkit';
import type { ReactNode } from 'react';

// Inner shell: rendered inside ConnectKitProvider so useModal() is safe here.
// This is flat application code (not transpiled), so connectkit resolves to
// the same module instance as ConnectKitProvider.
function InnerShell({ children }: { children: ReactNode }) {
  const { setOpen } = useModal();
  return (
    <ConnectModalProvider openModal={() => setOpen(true)}>
      <AuthProvider>{children}</AuthProvider>
    </ConnectModalProvider>
  );
}

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ConnectKitProvider
      theme="midnight"
      options={{
        hideNoWalletCTA: false,
        walletConnectName: 'WalletConnect',
        avoidLayoutShift: false,
      }}
    >
      <InnerShell>{children}</InnerShell>
    </ConnectKitProvider>
  );
}
