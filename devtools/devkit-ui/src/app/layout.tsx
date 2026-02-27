import './globals.css';
import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Conflux DevKit',
  description: 'Local Conflux development node manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full overflow-hidden">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
