import {
  deriveAccount,
  generateMnemonic,
  validateMnemonic,
} from '@cfxdevkit/core/wallet';
import { getKeystoreService } from '@cfxdevkit/services';
import { Router } from 'express';

/** Default node config used when creating/importing wallets in dev mode */
const DEFAULT_NODE_CONFIG = {
  accountsCount: 10,
  chainId: 2029,
  evmChainId: 2030,
} as const;

/**
 * Keystore / wallet management routes
 *
 * GET  /api/keystore/status           — setup state, lock state, mnemonic count
 * POST /api/keystore/setup            — first-time setup { mnemonic, label, password? }
 * POST /api/keystore/unlock           — unlock encrypted keystore { password }
 * POST /api/keystore/lock             — lock keystore
 * POST /api/keystore/generate         — generate a new random BIP-39 mnemonic
 *
 * GET  /api/keystore/wallets          — list all mnemonics (summary, no keys)
 * POST /api/keystore/wallets          — add mnemonic { mnemonic, label, password?, setAsActive? }
 * POST /api/keystore/wallets/:id/activate  — switch active mnemonic
 * DELETE /api/keystore/wallets/:id    — delete a mnemonic
 */
export function createKeystoreRoutes(): Router {
  const router = Router();

  router.get('/status', async (_req, res) => {
    const ks = getKeystoreService();
    const ready = await ks.isSetupCompleted();
    res.json({
      initialized: ready,
      locked: ready ? ks.isLocked() : false,
      encryptionEnabled: ready ? ks.isEncryptionEnabled() : false,
    });
  });

  router.post('/generate', (_req, res) => {
    const mnemonic = generateMnemonic();
    res.json({ mnemonic });
  });

  router.post('/setup', async (req, res) => {
    const {
      mnemonic,
      label = 'Default',
      password,
    } = req.body as {
      mnemonic?: string;
      label?: string;
      password?: string;
    };

    if (!mnemonic) {
      res.status(400).json({ error: 'mnemonic is required' });
      return;
    }
    if (!validateMnemonic(mnemonic)) {
      res.status(400).json({ error: 'Invalid BIP-39 mnemonic' });
      return;
    }

    const ks = getKeystoreService();
    const adminAddress = deriveAccount(mnemonic, 0).evmAddress;
    await ks.completeSetup({
      adminAddress,
      mnemonic,
      mnemonicLabel: label,
      nodeConfig: DEFAULT_NODE_CONFIG,
      ...(password ? { encryption: { enabled: true, password } } : {}),
    });
    res.json({ ok: true });
  });

  router.post('/unlock', async (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ error: 'password is required' });
      return;
    }
    const ks = getKeystoreService();
    await ks.unlockKeystore(password);
    res.json({ ok: true });
  });

  router.post('/lock', async (_req, res) => {
    const ks = getKeystoreService();
    await ks.lockKeystore();
    res.json({ ok: true });
  });

  router.get('/wallets', async (_req, res) => {
    const ks = getKeystoreService();
    try {
      if (!(await ks.isSetupCompleted())) {
        res.json([]);
        return;
      }
      const wallets = await ks.listMnemonics();
      res.json(wallets);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/wallets', async (req, res) => {
    const {
      mnemonic,
      label,
      setAsActive = false,
    } = req.body as {
      mnemonic?: string;
      label?: string;
      setAsActive?: boolean;
    };

    if (!mnemonic || !label) {
      res.status(400).json({ error: 'mnemonic and label are required' });
      return;
    }
    if (!validateMnemonic(mnemonic)) {
      res.status(400).json({ error: 'Invalid BIP-39 mnemonic' });
      return;
    }

    const ks = getKeystoreService();
    const entry = await ks.addMnemonic({
      mnemonic,
      label,
      nodeConfig: DEFAULT_NODE_CONFIG,
      setAsActive,
    });
    res.status(201).json({ ok: true, id: entry.id });
  });

  router.post('/wallets/:id/activate', async (req, res) => {
    const ks = getKeystoreService();
    await ks.switchActiveMnemonic(req.params.id);
    res.json({ ok: true });
  });

  router.delete('/wallets/:id', async (req, res) => {
    const { deleteData = false } = req.body as { deleteData?: boolean };
    const ks = getKeystoreService();
    await ks.deleteMnemonic(req.params.id, deleteData);
    res.json({ ok: true });
  });

  router.patch('/wallets/:id', async (req, res) => {
    const { label } = req.body as { label?: string };
    if (!label) {
      res.status(400).json({ error: 'label is required' });
      return;
    }
    const ks = getKeystoreService();
    try {
      await ks.updateMnemonicLabel(req.params.id, label);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
