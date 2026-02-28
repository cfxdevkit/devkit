import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KeystoreLockedError, KeystoreService } from './keystore.js';
import type { KeystoreV2 } from './keystore-types.js';

// Suppress logger noise during tests
vi.mock('@cfxdevkit/core/utils', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
  },
}));

// ── helpers ───────────────────────────────────────────────────────────────────

function makeTmpPath(): string {
  return join(
    tmpdir(),
    `keystore-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );
}

function makeMinimalKeystoreV2(
  overrides: Partial<KeystoreV2> = {}
): KeystoreV2 {
  return {
    version: 2,
    setupCompleted: true,
    setupCompletedAt: new Date().toISOString(),
    adminAddresses: ['0xAdmin1'],
    encryptionEnabled: false,
    mnemonics: [],
    activeIndex: 0,
    ...overrides,
  };
}

// ── KeystoreLockedError ────────────────────────────────────────────────────────

describe('KeystoreLockedError', () => {
  it('is an instance of Error', () => {
    expect(new KeystoreLockedError()).toBeInstanceOf(Error);
  });

  it('has the name KeystoreLockedError', () => {
    expect(new KeystoreLockedError().name).toBe('KeystoreLockedError');
  });

  it('uses a default message when none provided', () => {
    const err = new KeystoreLockedError();
    expect(err.message).toMatch(/locked/i);
  });

  it('accepts a custom message', () => {
    const err = new KeystoreLockedError('custom');
    expect(err.message).toBe('custom');
  });
});

// ── KeystoreService ────────────────────────────────────────────────────────────

describe('KeystoreService', () => {
  let tmpPath: string;

  beforeEach(() => {
    tmpPath = makeTmpPath();
  });

  afterEach(() => {
    if (existsSync(tmpPath)) {
      rmSync(tmpPath);
    }
  });

  // ── initialize ──────────────────────────────────────────────────────────────

  describe('initialize()', () => {
    it('does not throw when no keystore file exists', async () => {
      const service = new KeystoreService(tmpPath);
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('sets setup as not completed when no file exists', async () => {
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      expect(await service.isSetupCompleted()).toBe(false);
    });

    it('loads an existing keystore file from disk', async () => {
      writeFileSync(tmpPath, JSON.stringify(makeMinimalKeystoreV2()), 'utf-8');
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      expect(await service.isSetupCompleted()).toBe(true);
    });

    it('throws on unsupported keystore version', async () => {
      const bad = { version: 1, setupCompleted: true };
      writeFileSync(tmpPath, JSON.stringify(bad), 'utf-8');
      const service = new KeystoreService(tmpPath);
      await expect(service.initialize()).rejects.toThrow(/version/i);
    });

    it('throws when the keystore file contains invalid JSON', async () => {
      writeFileSync(tmpPath, '{ not valid json', 'utf-8');
      const service = new KeystoreService(tmpPath);
      await expect(service.initialize()).rejects.toThrow();
    });
  });

  // ── isSetupCompleted ────────────────────────────────────────────────────────

  describe('isSetupCompleted()', () => {
    it('returns false before initialize()', async () => {
      const service = new KeystoreService(tmpPath);
      expect(await service.isSetupCompleted()).toBe(false);
    });

    it('returns true when a completed keystore is loaded', async () => {
      writeFileSync(
        tmpPath,
        JSON.stringify(makeMinimalKeystoreV2({ setupCompleted: true })),
        'utf-8'
      );
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      expect(await service.isSetupCompleted()).toBe(true);
    });

    it('returns false when setupCompleted is false in the file', async () => {
      writeFileSync(
        tmpPath,
        JSON.stringify(makeMinimalKeystoreV2({ setupCompleted: false })),
        'utf-8'
      );
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      expect(await service.isSetupCompleted()).toBe(false);
    });
  });

  // ── getAdminAddresses ───────────────────────────────────────────────────────

  describe('getAdminAddresses()', () => {
    it('throws when keystore is not loaded', async () => {
      const service = new KeystoreService(tmpPath);
      await service.initialize(); // no file → keystore = null
      await expect(service.getAdminAddresses()).rejects.toThrow(
        /not loaded|initial setup/i
      );
    });

    it('returns the admin addresses from the loaded keystore', async () => {
      writeFileSync(
        tmpPath,
        JSON.stringify(
          makeMinimalKeystoreV2({ adminAddresses: ['0xAlice', '0xBob'] })
        ),
        'utf-8'
      );
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      const addrs = await service.getAdminAddresses();
      expect(addrs).toEqual(['0xAlice', '0xBob']);
    });
  });

  // ── addAdminAddress ─────────────────────────────────────────────────────────

  describe('addAdminAddress()', () => {
    it('adds a new address and persists it', async () => {
      writeFileSync(
        tmpPath,
        JSON.stringify(makeMinimalKeystoreV2({ adminAddresses: ['0xAlice'] })),
        'utf-8'
      );
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      await service.addAdminAddress('0xBob');
      const addrs = await service.getAdminAddresses();
      expect(addrs).toContain('0xBob');
    });

    it('throws when adding a duplicate address (case-insensitive)', async () => {
      writeFileSync(
        tmpPath,
        JSON.stringify(makeMinimalKeystoreV2({ adminAddresses: ['0xAlice'] })),
        'utf-8'
      );
      const service = new KeystoreService(tmpPath);
      await service.initialize();
      await expect(service.addAdminAddress('0xalice')).rejects.toThrow(
        /already exists/i
      );
    });
  });
});
