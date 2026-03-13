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
  cookieToInitialState,
  getServerConfig,
} from '@cfxdevkit/wallet-connect/server';
import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { ClientRoot } from './client-root';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s — Template',
    default: 'Conflux DevKit Template',
  },
  description: 'Conflux DevKit starter template with wallet connect and SIWE.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Extract the wagmi cookie written by cookieStorage on the client and use it
  // to hydrate the WagmiProvider on the server.  This prevents the flash of
  // disconnected state that occurs when the cookie is read only after mount.
  const cookie = (await headers()).get('cookie');
  const initialState = cookieToInitialState(getServerConfig(), cookie);

  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ClientRoot initialState={initialState}>{children}</ClientRoot>
      </body>
    </html>
  );
}
