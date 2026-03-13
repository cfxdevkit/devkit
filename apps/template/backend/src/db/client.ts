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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database as BetterSQLite3 } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Resolve relative DATABASE_PATH values from the project root so the backend
// always finds the same SQLite file regardless of CWD.
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // backend/src/db
const PROJECT_ROOT = path.resolve(__dirname, '../../..'); // apps/template/

const rawDbPath = process.env.DATABASE_PATH ?? './data/template.db';
const DB_PATH = path.isAbsolute(rawDbPath)
  ? rawDbPath
  : path.resolve(PROJECT_ROOT, rawDbPath);

// Ensure data dir exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const sqlite: BetterSQLite3 = new Database(DB_PATH);
// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
