import { Router } from 'express';
import type { NodeManager } from '../node-manager.js';

/**
 * Node lifecycle routes
 *
 * POST /api/node/start    — start the local Conflux node
 * POST /api/node/stop     — stop the node
 * POST /api/node/restart  — restart the node
 * GET  /api/node/status   — comprehensive status (running, rpc urls, mining, etc.)
 */
export function createDevnodeRoutes(nodeManager: NodeManager): Router {
  const router = Router();

  router.get('/status', async (_req, res) => {
    const manager = nodeManager.getManager();

    if (!manager) {
      res.json({
        server: 'stopped',
        mining: null,
        rpcUrls: null,
        accounts: 0,
        config: nodeManager.getConfig(),
      });
      return;
    }

    res.json(manager.getNodeStatus());
  });

  router.post('/start', async (_req, res) => {
    try {
      await nodeManager.start();
      const manager = nodeManager.requireManager();
      res.json({ ok: true, status: manager.getNodeStatus() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  router.post('/stop', async (_req, res) => {
    try {
      await nodeManager.stop();
      res.json({ ok: true, server: 'stopped' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  router.post('/restart', async (_req, res) => {
    try {
      await nodeManager.restart();
      const manager = nodeManager.requireManager();
      res.json({ ok: true, status: manager.getNodeStatus() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  router.post('/restart-wipe', async (_req, res) => {
    try {
      await nodeManager.restartWipe();
      const manager = nodeManager.requireManager();
      res.json({ ok: true, status: manager.getNodeStatus() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  /** Wipe data dir (stop first if running), without restarting. */
  router.post('/wipe', async (_req, res) => {
    try {
      await nodeManager.wipeData();
      res.json({ ok: true, server: 'stopped' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  return router;
}
