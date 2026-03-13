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
 * adminService — DB-backed pause switch.
 *
 * Persists the global pause flag in the `settings` table so it survives
 * backend restarts and is visible to other readers of the same SQLite file
 * (e.g. the worker process).
 */
import { sqlite } from '../db/client.js';

const KEY = 'paused';

function readPaused(): boolean {
  const row = sqlite
    .prepare<[], { value: string }>(
      `SELECT value FROM settings WHERE key = '${KEY}'`
    )
    .get();
  return row?.value === '1';
}

function writePaused(v: boolean): void {
  sqlite
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .run(KEY, v ? '1' : '0');
}

export const adminService = {
  isPaused: (): boolean => readPaused(),
  pause: async (): Promise<void> => {
    writePaused(true);
  },
  resume: async (): Promise<void> => {
    writePaused(false);
  },
};
