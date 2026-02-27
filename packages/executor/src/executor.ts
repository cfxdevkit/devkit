import { logger } from '@cfxdevkit/core';
import type { PriceChecker } from './price-checker.js';
import type { RetryQueue } from './retry-queue.js';
import type { SafetyGuard } from './safety-guard.js';
import type { DCAJob, Job, LimitOrderJob } from './types.js';

// Minimal on-chain execution interface – fulfilled by the viem-based KeeperClientImpl
export interface KeeperClient {
  executeLimitOrder(
    jobId: string,
    owner: string,
    params: LimitOrderJob['params']
  ): Promise<{ txHash: string; amountOut?: string | null }>;

  executeDCATick(
    jobId: string,
    owner: string,
    params: DCAJob['params']
  ): Promise<{
    txHash: string;
    amountOut?: string | null;
    nextExecutionSec: number;
  }>;

  /** Read the terminal status of a job from the contract. */
  getOnChainStatus(
    jobId: `0x${string}`
  ): Promise<'active' | 'executed' | 'cancelled' | 'expired'>;
}

// Persistent job store – fulfilled by the DB-backed store in the application layer
export interface JobStore {
  getActiveJobs(): Promise<Job[]>;
  markActive(jobId: string): Promise<void>;
  markExecuted(
    jobId: string,
    txHash: string,
    amountOut?: string | null
  ): Promise<void>;
  /**
   * Record one completed DCA tick.
   * Updates swapsCompleted + nextExecution in params_json and inserts an
   * execution record.  Sets status → 'executed' when all swaps are done,
   * otherwise keeps the job 'active' so subsequent ticks can run.
   */
  markDCATick(
    jobId: string,
    txHash: string,
    newSwapsCompleted: number,
    nextExecution: number,
    amountOut?: string | null
  ): Promise<void>;
  markFailed(jobId: string, error: string): Promise<void>;
  incrementRetry(jobId: string): Promise<void>;
  markExpired(jobId: string): Promise<void>;
  /** Mark a job cancelled — use when on-chain status is CANCELLED. */
  markCancelled(jobId: string): Promise<void>;
  /** Record the latest error message without changing status or incrementing retries. */
  updateLastError(jobId: string, error: string): Promise<void>;
}

export interface ExecutorOptions {
  dryRun?: boolean;
}

/**
 * Executor – evaluates active jobs and submits on-chain transactions when
 * conditions are met and the SafetyGuard approves.
 */
export class Executor {
  private priceChecker: PriceChecker;
  private safetyGuard: SafetyGuard;
  private retryQueue: RetryQueue;
  private keeperClient: KeeperClient;
  private jobStore: JobStore;
  private dryRun: boolean;

  constructor(
    priceChecker: PriceChecker,
    safetyGuard: SafetyGuard,
    retryQueue: RetryQueue,
    keeperClient: KeeperClient,
    jobStore: JobStore,
    options: ExecutorOptions = {}
  ) {
    this.priceChecker = priceChecker;
    this.safetyGuard = safetyGuard;
    this.retryQueue = retryQueue;
    this.keeperClient = keeperClient;
    this.jobStore = jobStore;
    this.dryRun = options.dryRun ?? false;
  }

  /**
   * Process a single job tick.
   */
  async processTick(job: Job): Promise<void> {
    // 1. Quick expiry guard
    if (job.expiresAt !== null && Date.now() >= job.expiresAt) {
      logger.info(`[Executor] job ${job.id} expired`);
      await this.jobStore.markExpired(job.id);
      return;
    }

    try {
      // Transition pending → active on first pickup
      if (job.status === 'pending') {
        await this.jobStore.markActive(job.id);
      }

      if (job.type === 'limit_order') {
        await this._processLimitOrder(job as LimitOrderJob);
      } else if (job.type === 'dca') {
        await this._processDCA(job as DCAJob);
      }
      // 'twap' and 'swap' are not yet implemented — silently skip
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      // ── Transient errors — handle silently without logging as ERROR ──────────

      // PriceConditionNotMet is a transient race: the off-chain check passed but
      // the on-chain oracle ticked back before the tx was mined.
      if (message.includes('PriceConditionNotMet')) {
        logger.debug(
          `[Executor] job ${job.id}: price condition no longer met at execution time — will retry next tick`
        );
        return;
      }

      // DCAIntervalNotReached means the on-chain interval timer hasn't elapsed yet.
      if (message.includes('DCAIntervalNotReached')) {
        logger.debug(
          `[Executor] job ${job.id}: DCA interval not yet reached at execution time — will retry next tick`
        );
        return;
      }

      // Receipt-not-found: the node didn't have the receipt indexed yet.
      if (
        message.includes('could not be found') ||
        message.includes('TransactionReceiptNotFoundError')
      ) {
        logger.debug(
          `[Executor] job ${job.id}: receipt not yet indexed — will retry next tick`
        );
        return;
      }

      // Slippage exceeded is transient: pool price moved between simulation and mine.
      if (message.includes('Slippage exceeded')) {
        logger.debug(
          `[Executor] job ${job.id}: slippage exceeded at execution time — will retry next tick`
        );
        await this.jobStore.incrementRetry(job.id);
        await this.jobStore.updateLastError(job.id, message);
        return;
      }

      // ── Unexpected errors — log full cause for diagnosis ─────────────────────
      if (err instanceof Error && (err as { cause?: unknown }).cause) {
        logger.error(
          { cause: (err as { cause?: unknown }).cause },
          '[Executor] raw error cause'
        );
      }

      // JobNotFound: on-chain job ID doesn't exist (contract redeployed).
      if (message.includes('JobNotFound')) {
        const ocId = (job as { onChainJobId?: string }).onChainJobId;
        logger.warn(
          { jobId: job.id, onChainJobId: ocId },
          '[Executor] JobNotFound — on_chain_job_id not found on current contract ' +
            '(likely left over from an old deployment) — marking cancelled'
        );
        await this.jobStore.markCancelled(job.id);
        return;
      }

      // JobNotActive: job is EXECUTED/CANCELLED/EXPIRED on-chain but DB is out of sync.
      if (message.includes('JobNotActive')) {
        const ocId = (job as { onChainJobId?: string }).onChainJobId as
          | `0x${string}`
          | undefined;
        let onChainStatus: 'active' | 'executed' | 'cancelled' | 'expired' =
          'cancelled';
        if (ocId) {
          try {
            onChainStatus = await this.keeperClient.getOnChainStatus(ocId);
          } catch (statusErr) {
            logger.warn(
              { jobId: job.id, err: statusErr },
              '[Executor] could not read on-chain status — defaulting to cancelled'
            );
          }
        }
        if (onChainStatus === 'executed') {
          logger.warn(
            { jobId: job.id, onChainJobId: ocId },
            '[Executor] job EXECUTED on-chain but DB was out of sync — marking executed'
          );
          await this.jobStore.markExecuted(job.id, 'chain-sync');
        } else {
          logger.warn(
            { jobId: job.id, onChainJobId: ocId, onChainStatus },
            '[Executor] job is CANCELLED/EXPIRED on-chain — marking cancelled in DB'
          );
          await this.jobStore.markCancelled(job.id);
        }
        return;
      }

      logger.error(`[Executor] job ${job.id} failed: ${message}`);
      const nextRetries = job.retries + 1;
      if (job.retries < job.maxRetries) {
        await this.jobStore.incrementRetry(job.id);
      }
      if (nextRetries < job.maxRetries) {
        this.retryQueue.enqueue({ ...job, retries: nextRetries });
      }
      await this.jobStore.markFailed(job.id, message);
    }
  }

  /**
   * Process all active jobs + due retries in one tick.
   */
  async runAllTicks(): Promise<void> {
    const activeJobs = await this.jobStore.getActiveJobs();
    const retries = this.retryQueue.drainDue();

    const all = [...activeJobs, ...retries];
    logger.info(
      `[Executor] tick – ${activeJobs.length} active, ${retries.length} retries`
    );

    await Promise.allSettled(all.map((job) => this.processTick(job)));
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async _processLimitOrder(job: LimitOrderJob): Promise<void> {
    const priceResult = await this.priceChecker.checkLimitOrder(job);

    if (!priceResult.conditionMet) {
      logger.info(
        {
          jobId: job.id,
          currentPrice: priceResult.currentPrice.toString(),
          targetPrice: priceResult.targetPrice.toString(),
          direction: job.params.direction,
        },
        `[Executor] limit-order ${job.id}: condition not met – waiting`
      );
      return;
    }

    const safetyResult = this.safetyGuard.check(job, {
      swapUsd: priceResult.swapUsd,
    });
    if (!safetyResult.ok) {
      logger.warn(
        { violation: safetyResult.violation },
        `[Executor] limit-order ${job.id} blocked by safety guard`
      );
      return;
    }

    if (this.dryRun) {
      logger.info(`[Executor][dryRun] would execute limit-order ${job.id}`);
      return;
    }

    logger.info(`[Executor] executing limit-order ${job.id}`);
    const onChainJobId = job.onChainJobId;
    if (!onChainJobId) {
      logger.warn(
        `[Executor] limit-order ${job.id} has no onChainJobId – skipping until registered on-chain`
      );
      return;
    }
    const { txHash, amountOut } = await this.keeperClient.executeLimitOrder(
      onChainJobId,
      job.owner,
      job.params
    );
    await this.jobStore.markExecuted(job.id, txHash, amountOut);
    logger.info(`[Executor] limit-order ${job.id} executed – tx ${txHash}`);
  }

  private async _processDCA(job: DCAJob): Promise<void> {
    const priceResult = await this.priceChecker.checkDCA(job);

    if (!priceResult.conditionMet) {
      logger.info(
        {
          jobId: job.id,
          nextExecution: job.params.nextExecution,
          now: Date.now(),
          secsRemaining: Math.round(
            (job.params.nextExecution - Date.now()) / 1000
          ),
        },
        `[Executor] DCA ${job.id}: interval not reached`
      );
      return;
    }

    const safetyResult = this.safetyGuard.check(job, {
      swapUsd: priceResult.swapUsd,
    });
    if (!safetyResult.ok) {
      logger.warn(
        { violation: safetyResult.violation },
        `[Executor] DCA ${job.id} blocked by safety guard`
      );
      return;
    }

    if (this.dryRun) {
      logger.info(`[Executor][dryRun] would execute DCA tick for ${job.id}`);
      return;
    }

    logger.info(`[Executor] executing DCA tick ${job.id}`);
    const onChainJobId = job.onChainJobId;
    if (!onChainJobId) {
      logger.warn(
        `[Executor] DCA job ${job.id} has no onChainJobId – skipping until registered on-chain`
      );
      return;
    }
    const { txHash, amountOut, nextExecutionSec } =
      await this.keeperClient.executeDCATick(
        onChainJobId,
        job.owner,
        job.params
      );

    const newSwapsCompleted = job.params.swapsCompleted + 1;
    // Use the on-chain nextExecution (returned by KeeperClient after reading
    // the contract state post-tick) rather than computing it locally.
    const nextExecutionMs = nextExecutionSec * 1000;
    await this.jobStore.markDCATick(
      job.id,
      txHash,
      newSwapsCompleted,
      nextExecutionMs,
      amountOut
    );

    logger.info(
      {
        jobId: job.id,
        txHash,
        swapsCompleted: newSwapsCompleted,
        total: job.params.totalSwaps,
      },
      `[Executor] DCA tick executed – ${newSwapsCompleted}/${job.params.totalSwaps}`
    );
  }
}
