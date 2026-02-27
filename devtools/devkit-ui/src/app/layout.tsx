import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';

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
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0e1117] p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
