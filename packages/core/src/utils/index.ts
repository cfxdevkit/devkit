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

// @cfxdevkit/core - Utils module
// Shared utilities: logger, formatting helpers

export type { LogMessage } from './logger.js';
export { logger } from './logger.js';

/**
 * JSON.stringify that serialises `bigint` values as decimal strings.
 * Drop-in replacement for `JSON.stringify` when working with blockchain data.
 *
 * @param value  - The value to serialise.
 * @param space  - Optional indentation (same as JSON.stringify).
 */
export function stringifyBigInt(value: unknown, space?: number): string {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === 'bigint' ? v.toString() : v),
    space
  );
}
