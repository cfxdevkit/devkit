import { describe, expect, it, vi } from 'vitest';
import { ContractReader } from './reader.js';
import { InteractionError } from '../types/index.js';

// Minimal ClientManager stub — the reader only uses getCoreClient/getEvmClient
// and in its current stub implementation readFromCore/readFromEvm return {} as T
// so no real calls are made to the clients. We still need them to exist.
function makeClientManagerStub() {
  return {
    getCoreClient: vi.fn().mockReturnValue({}),
    getEvmClient: vi.fn().mockReturnValue({}),
  };
}

const DUMMY_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

describe('ContractReader', () => {
  // ── read ──────────────────────────────────────────────────────────────────

  describe('read()', () => {
    it('resolves for evm chain without throwing', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      await expect(
        reader.read({
          address: '0xToken',
          abi: DUMMY_ABI as unknown[],
          functionName: 'balanceOf',
          args: ['0xUser'],
          chain: 'evm',
        })
      ).resolves.not.toThrow();
    });

    it('resolves for core chain without throwing', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      await expect(
        reader.read({
          address: '0xToken',
          abi: DUMMY_ABI as unknown[],
          functionName: 'balanceOf',
          args: ['0xUser'],
          chain: 'core',
        })
      ).resolves.not.toThrow();
    });

    it('wraps getCoreClient errors in InteractionError', async () => {
      const brokenManager = {
        getCoreClient: vi.fn().mockImplementation(() => {
          throw new Error('RPC connection refused');
        }),
        getEvmClient: vi.fn().mockReturnValue({}),
      };

      const reader = new ContractReader(brokenManager as never);
      await expect(
        reader.read({
          address: '0x1',
          abi: [],
          functionName: 'foo',
          chain: 'core',
        })
      ).rejects.toBeInstanceOf(InteractionError);
    });
  });

  // ── batchRead ─────────────────────────────────────────────────────────────

  describe('batchRead()', () => {
    it('returns an array with one result per call entry', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      const results = await reader.batchRead(
        '0xToken',
        DUMMY_ABI as unknown[],
        [
          { functionName: 'balanceOf', args: ['0xA'] },
          { functionName: 'balanceOf', args: ['0xB'] },
        ],
        'evm'
      );
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
    });

    it('returns empty array for zero calls', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      const results = await reader.batchRead('0x1', [], [], 'evm');
      expect(results).toHaveLength(0);
    });
  });

  // ── getContractInfo ───────────────────────────────────────────────────────

  describe('getContractInfo()', () => {
    it('returns a ContractInfo with the requested address and chain', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      const info = await reader.getContractInfo('0xMyContract', 'evm');
      expect(info.address).toBe('0xMyContract');
      expect(info.chain).toBe('evm');
    });
  });

  // ── isContract ────────────────────────────────────────────────────────────

  describe('isContract()', () => {
    it('returns true for any address (stub implementation)', async () => {
      const reader = new ContractReader(makeClientManagerStub() as never);
      const result = await reader.isContract('0xAnything', 'evm');
      expect(result).toBe(true);
    });
  });

  // ── error class ───────────────────────────────────────────────────────────

  describe('InteractionError', () => {
    it('is an instance of Error', () => {
      const err = new InteractionError('oops', {});
      expect(err).toBeInstanceOf(Error);
    });

    it('carries the provided message', () => {
      const err = new InteractionError('bad call', { address: '0x1' });
      expect(err.message).toContain('bad call');
    });
  });
});
