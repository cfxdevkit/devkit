'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { keystoreApi } from '@/lib/api';
import { SetupWizard } from './SetupWizard';
import { Sidebar } from './Sidebar';

/**
 * App shell rendered inside `<Providers>`.
 *
 * On first launch (keystore not yet initialised) the entire viewport shows the
 * setup wizard instead of the normal Sidebar + page layout. Once the user
 * completes setup the query is invalidated and the normal app appears.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['keystore', 'status'],
    queryFn: keystoreApi.status,
    // Poll every 5 s so the UI reacts when the keystore state changes
    refetchInterval: 5000,
    // Retry once on error (e.g. server briefly starting)
    retry: 2,
  });

  /* ── Loading — server may still be spinning up ─────────────────────── */
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <svg
            className="h-8 w-8 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-sm">Connecting to conflux-devkit…</span>
        </div>
      </div>
    );
  }

  /* ── First-time setup ───────────────────────────────────────────────── */
  if (!status?.initialized) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0e1117] p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            {/* Conflux-style logo mark */}
            <svg
              viewBox="0 0 32 32"
              className="h-9 w-9 text-blue-500"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4a10 10 0 110 20A10 10 0 0116 6zm0 3a7 7 0 100 14A7 7 0 0016 9z" />
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">
              conflux-devkit
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm">
            Configure a mnemonic to derive genesis accounts for your local
            development node, then you can start it from the Dashboard.
          </p>
        </div>

        <SetupWizard
          onDone={() => qc.invalidateQueries({ queryKey: ['keystore'] })}
        />
      </div>
    );
  }

  /* ── Normal app layout ──────────────────────────────────────────────── */
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0e1117] p-6">
        {children}
      </main>
    </>
  );
}
