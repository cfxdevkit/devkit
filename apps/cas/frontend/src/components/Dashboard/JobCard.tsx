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

import type { Job } from '@cfxdevkit/executor/automation';
import { useAuthContext } from '@cfxdevkit/wallet-connect';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900 text-yellow-300',
  active: 'bg-green-900 text-green-300',
  executed: 'bg-slate-700 text-slate-300',
  cancelled: 'bg-slate-800 text-slate-500',
  failed: 'bg-red-900 text-red-300',
  paused: 'bg-orange-900 text-orange-300',
};

interface JobCardProps {
  job: Job;
  onCancel: (id: string) => void;
}

export function JobCard({ job, onCancel }: JobCardProps) {
  const isActive = job.status === 'active' || job.status === 'pending';
  const retriesExhausted = isActive && job.retries >= job.maxRetries;
  const { token } = useAuthContext();

  async function handleCancel() {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) onCancel(job.id);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
              STATUS_COLORS[job.status] ?? 'bg-slate-700 text-slate-400'
            }`}
          >
            {job.status}
          </span>
          <span className="ml-3 text-xs text-slate-500 uppercase">
            {job.type.replace('_', ' ')}
          </span>
        </div>
        {isActive && (
          <button
            type="button"
            onClick={() => void handleCancel()}
            className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-300 font-mono">
        {job.type === 'limit_order' && (
          <>
            <p>
              <span className="text-slate-500">In:</span>{' '}
              {job.params.tokenIn.slice(0, 8)}…{' '}
              <span className="text-slate-500">→</span>{' '}
              {job.params.tokenOut.slice(0, 8)}…
            </p>
            <p>
              <span className="text-slate-500">Amount:</span>{' '}
              {String(job.params.amountIn)}
            </p>
            <p>
              <span className="text-slate-500">Target:</span>{' '}
              {String(job.params.targetPrice)} (
              {job.params.direction === 'gte' ? 'above' : 'below'})
            </p>
          </>
        )}
        {job.type === 'dca' && (
          <>
            <p>
              <span className="text-slate-500">In:</span>{' '}
              {job.params.tokenIn.slice(0, 8)}…{' '}
              <span className="text-slate-500">→</span>{' '}
              {job.params.tokenOut.slice(0, 8)}…
            </p>
            <p>
              <span className="text-slate-500">Per swap:</span>{' '}
              {String(job.params.amountPerSwap)}
            </p>
            <p>
              <span className="text-slate-500">Progress:</span>{' '}
              {job.params.swapsCompleted} / {job.params.totalSwaps}
            </p>
          </>
        )}
      </div>

      {retriesExhausted && (
        <div className="mt-2 rounded-lg bg-orange-950 border border-orange-800 px-3 py-1.5 text-xs text-orange-300">
          ⚠ Blocked — max retries reached ({job.retries}/{job.maxRetries}).
          Cancel and recreate, or contact support.
        </div>
      )}

      {!retriesExhausted && job.retries > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Retries: {job.retries} / {job.maxRetries}
        </p>
      )}

      {job.lastError && (
        <p className="mt-2 text-xs text-red-400 truncate" title={job.lastError}>
          Error: {job.lastError}
        </p>
      )}

      <p className="mt-3 text-xs text-slate-600">
        ID: {job.id} · Created {new Date(job.createdAt).toLocaleString()}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <Link
          href={`/job/${job.id}`}
          className="text-xs text-conflux-400 hover:text-conflux-300 underline transition-colors"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
