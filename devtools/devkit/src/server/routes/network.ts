import { Router } from 'express';
import type { NodeManager } from '../node-manager.js';

/**
 * Network / node configuration routes
 *
 * GET /api/network/config        — current node configuration (redacted)
 * PUT /api/network/config        — update node configuration
 *   body: Partial<ServerConfig>  (node must be stopped to apply most changes)
 * GET /api/network/rpc-urls      — current RPC endpoint URLs
 */
export function createNetworkRoutes(nodeManager: NodeManager): Router {
  const router = Router();

  router.get('/config', (_req, res) => {
    res.json(nodeManager.getConfig());
  });

  router.put('/config', async (req, res) => {
    if (nodeManager.isRunning()) {
      res.status(409).json({
        error: 'Node is running. Stop it before changing the network configuration.',
      });
      return;
    }

    const { coreRpcPort, evmRpcPort, wsPort, chainId, evmChainId, log } =
      req.body as {
        coreRpcPort?: number;
        evmRpcPort?: number;
        wsPort?: number;
        chainId?: number;
        evmChainId?: number;
        log?: boolean;
      };

    nodeManager.updateConfig({ coreRpcPort, evmRpcPort, wsPort, chainId, evmChainId, log });
    res.json({ ok: true, config: nodeManager.getConfig() });
  });

  router.get('/rpc-urls', (_req, res) => {
    const manager = nodeManager.getManager();
    if (!manager) {
      const cfg = nodeManager.getConfig();
      res.json({
        core: `http://localhost:${cfg.coreRpcPort}`,
        evm: `http://localhost:${cfg.evmRpcPort}`,
        ws: `ws://localhost:${cfg.wsPort}`,
        running: false,
      });
      return;
    }
    res.json({ ...manager.getRpcUrls(), running: true });
  });

  return router;
}
