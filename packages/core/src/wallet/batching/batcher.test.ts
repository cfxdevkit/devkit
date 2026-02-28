import { describe, expect, it, vi } from 'vitest';
import { BatcherError } from '../types/index.js';
import { TransactionBatcher } from './batcher.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeEvmTx(
  overrides: Partial<{ to: string; value: bigint; gasLimit: bigint }> = {}
) {
  return {
    to: overrides.to ?? '0xRecipient',
    value: overrides.value,
    gasLimit: overrides.gasLimit,
    chain: 'evm' as const,
  };
}

function makeCoreTx(overrides: Partial<{ to: string; value: bigint }> = {}) {
  return {
    to: overrides.to ?? '0xCoreDst',
    value: overrides.value,
    chain: 'core' as const,
  };
}

// ── TransactionBatcher ────────────────────────────────────────────────────────

describe('TransactionBatcher', () => {
  // ── construction ─────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default options', () => {
      const batcher = new TransactionBatcher();
      const opts = batcher.getOptions();
      expect(opts.maxBatchSize).toBe(10);
      expect(opts.autoExecuteTimeout).toBe(0);
      expect(opts.minGasPrice).toBe(0n);
    });

    it('accepts custom options', () => {
      const batcher = new TransactionBatcher({
        maxBatchSize: 5,
        minGasPrice: 100n,
      });
      const opts = batcher.getOptions();
      expect(opts.maxBatchSize).toBe(5);
      expect(opts.minGasPrice).toBe(100n);
    });
  });

  // ── addTransaction ────────────────────────────────────────────────────────

  describe('addTransaction', () => {
    it('returns a unique string ID for each call', () => {
      const batcher = new TransactionBatcher();
      const id1 = batcher.addTransaction(makeEvmTx());
      const id2 = batcher.addTransaction(makeEvmTx());
      expect(typeof id1).toBe('string');
      expect(id1).not.toBe(id2);
    });

    it('adds evm transactions to the evm batch only', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      expect(batcher.getPendingTransactions('evm')).toHaveLength(1);
      expect(batcher.getPendingTransactions('core')).toHaveLength(0);
    });

    it('adds core transactions to the core batch only', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeCoreTx());
      expect(batcher.getPendingTransactions('core')).toHaveLength(1);
      expect(batcher.getPendingTransactions('evm')).toHaveLength(0);
    });

    it('logs when the batch reaches maxBatchSize', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const batcher = new TransactionBatcher({ maxBatchSize: 2 });
      batcher.addTransaction(makeEvmTx());
      batcher.addTransaction(makeEvmTx()); // should trigger full-batch log
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ── removeTransaction ─────────────────────────────────────────────────────

  describe('removeTransaction', () => {
    it('removes a transaction by ID and returns true', () => {
      const batcher = new TransactionBatcher();
      const id = batcher.addTransaction(makeEvmTx());
      expect(batcher.removeTransaction(id, 'evm')).toBe(true);
      expect(batcher.getPendingTransactions('evm')).toHaveLength(0);
    });

    it('returns false when ID does not exist', () => {
      const batcher = new TransactionBatcher();
      expect(batcher.removeTransaction('nonexistent', 'evm')).toBe(false);
    });

    it('does not remove from wrong chain', () => {
      const batcher = new TransactionBatcher();
      const id = batcher.addTransaction(makeEvmTx());
      // Try removing from core batch — should not find it
      expect(batcher.removeTransaction(id, 'core')).toBe(false);
      expect(batcher.getPendingTransactions('evm')).toHaveLength(1);
    });
  });

  // ── getPendingTransactions ────────────────────────────────────────────────

  describe('getPendingTransactions', () => {
    it('returns a copy of the batch (not the internal array)', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      const pending = batcher.getPendingTransactions('evm');
      pending.pop(); // mutate copy
      expect(batcher.getPendingTransactions('evm')).toHaveLength(1);
    });

    it('returned transactions carry the provided `to` address', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx({ to: '0xTarget' }));
      const [tx] = batcher.getPendingTransactions('evm');
      expect(tx.to).toBe('0xTarget');
    });
  });

  // ── getBatchStats ─────────────────────────────────────────────────────────

  describe('getBatchStats', () => {
    it('returns zero stats for an empty batch', () => {
      const batcher = new TransactionBatcher();
      const stats = batcher.getBatchStats('evm');
      expect(stats.count).toBe(0);
      expect(stats.totalValue).toBe(0n);
      expect(stats.avgGasLimit).toBe(0n);
      expect(stats.oldestTransaction).toBeUndefined();
    });

    it('calculates totalValue correctly', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx({ value: 100n }));
      batcher.addTransaction(makeEvmTx({ value: 200n }));
      const stats = batcher.getBatchStats('evm');
      expect(stats.count).toBe(2);
      expect(stats.totalValue).toBe(300n);
    });

    it('calculates avgGasLimit', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx({ gasLimit: 21000n }));
      batcher.addTransaction(makeEvmTx({ gasLimit: 63000n }));
      const stats = batcher.getBatchStats('evm');
      expect(stats.avgGasLimit).toBe(42000n);
    });

    it('sets oldestTransaction for a non-empty batch', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      const stats = batcher.getBatchStats('evm');
      expect(stats.oldestTransaction).toBeInstanceOf(Date);
    });
  });

  // ── clearBatch ────────────────────────────────────────────────────────────

  describe('clearBatch', () => {
    it('clears only the specified chain', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      batcher.addTransaction(makeCoreTx());
      batcher.clearBatch('evm');
      expect(batcher.getPendingTransactions('evm')).toHaveLength(0);
      expect(batcher.getPendingTransactions('core')).toHaveLength(1);
    });

    it('clears both chains when called without argument', () => {
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      batcher.addTransaction(makeCoreTx());
      batcher.clearBatch();
      expect(batcher.getPendingTransactions('evm')).toHaveLength(0);
      expect(batcher.getPendingTransactions('core')).toHaveLength(0);
    });
  });

  // ── executeBatch ──────────────────────────────────────────────────────────

  describe('executeBatch', () => {
    it('throws BatcherError when batch is empty', async () => {
      const batcher = new TransactionBatcher();
      await expect(batcher.executeBatch('evm')).rejects.toBeInstanceOf(
        BatcherError
      );
    });

    it('executes and returns a BatchResult with hashes', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx({ gasLimit: 21000n }));
      batcher.addTransaction(makeEvmTx({ gasLimit: 42000n }));

      const result = await batcher.executeBatch('evm');

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.transactionHashes).toHaveLength(2);
      expect(result.transactionHashes[0]).toMatch(/^0x[0-9a-f]{64}$/);
      expect(result.totalGasUsed).toBe(63000n);
      expect(result.chain).toBe('evm');
      expect(result.executedAt).toBeInstanceOf(Date);
      spy.mockRestore();
    });

    it('clears the batch after execution', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      await batcher.executeBatch('evm');
      expect(batcher.getPendingTransactions('evm')).toHaveLength(0);
      vi.restoreAllMocks();
    });

    it('calls the provided signer for each transaction', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      const batcher = new TransactionBatcher();
      batcher.addTransaction(makeEvmTx());
      const signer = vi.fn().mockResolvedValue('0xhash');
      const result = await batcher.executeBatch('evm', signer);
      expect(signer).toHaveBeenCalledOnce();
      expect(result.successCount).toBe(1);
      vi.restoreAllMocks();
    });
  });

  // ── getOptions / updateOptions ────────────────────────────────────────────

  describe('getOptions / updateOptions', () => {
    it('getOptions returns a copy', () => {
      const batcher = new TransactionBatcher({ maxBatchSize: 7 });
      const opts = batcher.getOptions();
      (opts as { maxBatchSize: number }).maxBatchSize = 99;
      expect(batcher.getOptions().maxBatchSize).toBe(7);
    });

    it('updateOptions merges new values', () => {
      const batcher = new TransactionBatcher({ maxBatchSize: 5 });
      batcher.updateOptions({ maxBatchSize: 15 });
      expect(batcher.getOptions().maxBatchSize).toBe(15);
      // Other options should be unchanged
      expect(batcher.getOptions().autoExecuteTimeout).toBe(0);
    });
  });
});
