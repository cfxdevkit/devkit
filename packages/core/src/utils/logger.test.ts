import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger.js';

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── logger.info ──────────────────────────────────────────────────────────

  describe('logger.info', () => {
    it('calls console.log with INFO level', () => {
      logger.info('hello world');
      expect(logSpy).toHaveBeenCalledOnce();
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('INFO');
      expect(msg).toContain('hello world');
    });

    it('includes an ISO timestamp', () => {
      logger.info('ts check');
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('accepts a plain object as the first argument', () => {
      logger.info({ action: 'test', value: 1 });
      expect(logSpy).toHaveBeenCalledOnce();
    });

    it('appends an extra object arg as pretty-printed JSON', () => {
      logger.info('message', { extra: true });
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('message');
      expect(msg).toContain('"extra": true');
    });

    it('appends a string extra arg', () => {
      logger.info('message', 'suffix');
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('message');
      expect(msg).toContain('suffix');
    });

    it('supports pino-style (object, message) signature', () => {
      logger.info({ context: 'test' }, 'actual message');
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('actual message');
    });

    it('serialises bigint args without throwing', () => {
      logger.info('bigint', 9007199254740993n);
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('9007199254740993');
    });
  });

  // ── logger.warn ──────────────────────────────────────────────────────────

  describe('logger.warn', () => {
    it('calls console.warn with WARN level', () => {
      logger.warn('something suspicious');
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(logSpy).not.toHaveBeenCalled();
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain('WARN');
      expect(msg).toContain('something suspicious');
    });

    it('accepts an object first arg', () => {
      logger.warn({ code: 404 }, 'not found');
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain('not found');
    });
  });

  // ── logger.error ─────────────────────────────────────────────────────────

  describe('logger.error', () => {
    it('calls console.error with ERROR level', () => {
      logger.error('kaboom');
      expect(errorSpy).toHaveBeenCalledOnce();
      const msg = errorSpy.mock.calls[0][0] as string;
      expect(msg).toContain('ERROR');
      expect(msg).toContain('kaboom');
    });

    it('does not call console.log or console.warn', () => {
      logger.error('fail');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  // ── logger.success ───────────────────────────────────────────────────────

  describe('logger.success', () => {
    it('calls console.log with SUCCESS level', () => {
      logger.success('all done');
      expect(logSpy).toHaveBeenCalledOnce();
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('SUCCESS');
      expect(msg).toContain('all done');
    });
  });

  // ── logger.debug ─────────────────────────────────────────────────────────

  describe('logger.debug', () => {
    it('calls console.log with DEBUG level', () => {
      logger.debug('trace info');
      expect(logSpy).toHaveBeenCalledOnce();
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('DEBUG');
      expect(msg).toContain('trace info');
    });

    it('handles multiple extra args', () => {
      logger.debug('multi', 'a', 'b', 'c');
      const msg = logSpy.mock.calls[0][0] as string;
      expect(msg).toContain('multi');
      expect(msg).toContain('a');
    });
  });

  // ── general ──────────────────────────────────────────────────────────────

  describe('each method returns undefined (no return value)', () => {
    it('info returns undefined', () => {
      expect(logger.info('x')).toBeUndefined();
    });
    it('warn returns undefined', () => {
      expect(logger.warn('x')).toBeUndefined();
    });
    it('error returns undefined', () => {
      expect(logger.error('x')).toBeUndefined();
    });
    it('success returns undefined', () => {
      expect(logger.success('x')).toBeUndefined();
    });
    it('debug returns undefined', () => {
      expect(logger.debug('x')).toBeUndefined();
    });
  });
});
