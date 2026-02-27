/**
 * @cfxdevkit/executor
 *
 * On-chain strategy execution engine for Conflux DevKit.
 *
 * Provides the runtime primitives needed to build keepers, bots, or AI agents
 * that execute on-chain strategies (limit orders, DCA, TWAP, spot swaps).
 *
 * Key exports:
 *   - Job types (LimitOrderJob, DCAJob, TWAPJob, SwapJob) + params
 *   - Strategy types (LimitOrderStrategy, DCAStrategy, TWAPStrategy, SwapStrategy)
 *   - SafetyGuard  — circuit-breaker / swap-cap / retry-cap
 *   - RetryQueue   — exponential backoff with jitter
 *   - PriceChecker — pluggable price source + condition evaluation
 *   - KeeperClient interface + KeeperClientImpl (viem / AutomationManager)
 *   - Executor     — orchestrator that ties all of the above together
 *   - AutomationLogger — injectable logger interface (no runtime dep)
 */

// ── Executor + interfaces ─────────────────────────────────────────────────────
export type { ExecutorOptions, JobStore, KeeperClient } from './executor.js';
export { Executor } from './executor.js';
// ── KeeperClientImpl (viem) ───────────────────────────────────────────────────
export type { KeeperClientConfig } from './keeper-client.js';
export { KeeperClientImpl } from './keeper-client.js';

// ── KeeperClient interface ────────────────────────────────────────────────────
export type { KeeperClient as IKeeperClient } from './keeper-interface.js';
// ── Logger ────────────────────────────────────────────────────────────────────
export type { AutomationLogger } from './logger.js';
export { noopLogger } from './logger.js';

// ── PriceChecker ──────────────────────────────────────────────────────────────
export type {
  DecimalsResolver,
  PriceCheckResult,
  PriceSource,
} from './price-checker.js';
export { PriceChecker } from './price-checker.js';
// ── RetryQueue ────────────────────────────────────────────────────────────────
export { RetryQueue } from './retry-queue.js';
// ── SafetyGuard ───────────────────────────────────────────────────────────────
export { DEFAULT_SAFETY_CONFIG, SafetyGuard } from './safety-guard.js';
// ── Strategy types ────────────────────────────────────────────────────────────
export type {
  DCAStrategy,
  LimitOrderStrategy,
  Strategy,
  SwapStrategy,
  TWAPStrategy,
} from './strategies.js';
// ── Types ─────────────────────────────────────────────────────────────────────
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
