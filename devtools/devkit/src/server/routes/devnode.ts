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
    await nodeManager.start();
    const manager = nodeManager.requireManager();
    res.json({ ok: true, status: manager.getNodeStatus() });
  });

  router.post('/stop', async (_req, res) => {
    await nodeManager.stop();
    res.json({ ok: true, server: 'stopped' });
  });

  router.post('/restart', async (_req, res) => {
    await nodeManager.restart();
    const manager = nodeManager.requireManager();
    res.json({ ok: true, status: manager.getNodeStatus() });
  });

  return router;
}
