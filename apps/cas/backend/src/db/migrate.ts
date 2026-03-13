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

import { sqlite } from './client.js';

/**
 * Run all database migrations (idempotent DDL).
 */
export function migrate(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id          TEXT PRIMARY KEY,
      owner       TEXT NOT NULL,
      type        TEXT NOT NULL CHECK(type IN ('limit_order','dca')),
      status      TEXT NOT NULL DEFAULT 'pending'
                  CHECK(status IN ('pending','active','executed','cancelled','failed','paused')),
      params_json TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL,
      expires_at  INTEGER,
      retries     INTEGER NOT NULL DEFAULT 0,
      max_retries INTEGER NOT NULL DEFAULT 5,
      last_error  TEXT,
      tx_hash     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_owner  ON jobs(owner);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

    CREATE TABLE IF NOT EXISTS executions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id     TEXT NOT NULL REFERENCES jobs(id),
      tx_hash    TEXT NOT NULL,
      timestamp  INTEGER NOT NULL,
      amount_out TEXT
    );

    CREATE TABLE IF NOT EXISTS nonces (
      nonce      TEXT PRIMARY KEY,
      address    TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_nonces_address ON nonces(address);

    CREATE TABLE IF NOT EXISTS worker_heartbeat (
      id           INTEGER PRIMARY KEY,
      last_seen_at INTEGER NOT NULL,
      worker_pid   INTEGER
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Add on_chain_job_id to existing tables (idempotent: SQLite throws if column
  // already exists, so we swallow that specific error).
  try {
    sqlite.exec(`ALTER TABLE jobs ADD COLUMN on_chain_job_id TEXT`);
  } catch (err: unknown) {
    // "duplicate column name" means the column already exists — that's fine.
    if (!/duplicate column/i.test(String(err))) throw err;
  }
}
