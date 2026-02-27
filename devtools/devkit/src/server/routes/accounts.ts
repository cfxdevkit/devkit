import { Router } from 'express';
import type { NodeManager } from '../node-manager.js';

/**
 * Account routes
 *
 * GET  /api/accounts           — list all genesis accounts with balances
 * GET  /api/accounts/faucet    — get the faucet account info
 * POST /api/accounts/fund      — fund an account from the faucet
 *   body: { address: string, amount?: string, chain?: 'core' | 'evm' }
 */
export function createAccountRoutes(nodeManager: NodeManager): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const manager = nodeManager.requireManager();
    const accounts = manager.getAccounts();
    res.json({ accounts });
  });

  router.get('/faucet', async (_req, res) => {
    const manager = nodeManager.requireManager();
    const faucet = manager.getFaucetAccount();
    const balances = await manager.getFaucetBalances();
    res.json({ account: faucet, balances });
  });

  router.post('/fund', async (req, res) => {
    const { address, amount, chain } = req.body as {
      address?: string;
      amount?: string;
      chain?: 'core' | 'evm';
    };

    if (!address) {
      res.status(400).json({ error: 'address is required' });
      return;
    }

    const manager = nodeManager.requireManager();
    await manager.fundAccount(
      address,
      amount ?? '1000',
      chain ?? 'evm',
    );
    res.json({ ok: true });
  });

  return router;
}
