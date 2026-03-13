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
 * @cfxdevkit/executor/automation
 *
 * Lightweight subpath that exports only the pure types and strategy
 * definitions — no viem runtime, no on-chain client code.
 *
 * Prefer this subpath in frontend / React code that only needs to
 * describe job shapes and safety config, not execute them.
 */

// ── Logger interface (no runtime dep) ────────────────────────────────────────
export type { AutomationLogger } from './logger.js';
// ── Safety defaults (read-only config reference) ─────────────────────────────
export { DEFAULT_SAFETY_CONFIG } from './safety-guard.js';
// ── Strategy types ────────────────────────────────────────────────────────────
export type {
  DCAStrategy,
  LimitOrderStrategy,
  Strategy,
  SwapStrategy,
  TWAPStrategy,
} from './strategies.js';
// ── Job + param types ─────────────────────────────────────────────────────────
export type {
  BaseJob,
  DCAJob,
  DCAParams,
  Job,
  JobStatus,
  JobType,
  LimitOrderJob,
  LimitOrderParams,
  SafetyCheckResult,
  SafetyConfig,
  SafetyViolation,
  SwapJob,
  SwapParams,
  TWAPJob,
  TWAPParams,
} from './types.js';
