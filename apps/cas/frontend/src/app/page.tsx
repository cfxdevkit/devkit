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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getStatus(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_URL}/api/status`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json() as Promise<{ status: string; version: string }>;
}

export default async function HomePage() {
  let status: { status: string; version: string } | null = null;
  try {
    status = await getStatus();
  } catch {
    // backend not reachable in dev — show placeholder
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Conflux Automation Studio</h1>
      <p>
        Backend:{' '}
        {status ? (
          <code>
            {status.status} v{status.version}
          </code>
        ) : (
          <em>unreachable (is the backend running?)</em>
        )}
      </p>
      <p>
        API URL: <code>{API_URL}</code>
      </p>
    </main>
  );
}
