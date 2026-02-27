import { Router } from 'express';
import {
  compileSolidity,
  getSimpleStorageContract,
  getTestTokenContract,
  type CompilationInput,
} from '@cfxdevkit/compiler';
import type { NodeManager } from '../node-manager.js';

/**
 * Contract routes
 *
 * GET  /api/contracts/templates          — list available built-in templates
 * GET  /api/contracts/templates/:name    — get ABI + bytecode for a template
 * POST /api/contracts/compile            — compile arbitrary Solidity source
 *   body: { source: string, contractName?: string }
 * POST /api/contracts/deploy             — deploy a compiled contract
 *   body: { bytecode: string, abi: object[], args?: unknown[], chain?: 'core'|'evm', accountIndex?: number }
 */
export function createContractRoutes(nodeManager: NodeManager): Router {
  const router = Router();

  const TEMPLATES = {
    SimpleStorage: {
      name: 'SimpleStorage',
      description: 'Basic key-value storage — great for testing reads/writes',
      get: getSimpleStorageContract,
    },
    TestToken: {
      name: 'TestToken',
      description: 'ERC-20 token with a public mint function — useful for DeFi testing',
      get: getTestTokenContract,
    },
  } as const;

  // List templates
  router.get('/templates', (_req, res) => {
    const list = Object.entries(TEMPLATES).map(([key, t]) => ({
      id: key,
      name: t.name,
      description: t.description,
    }));
    res.json({ templates: list });
  });

  // Get template artefact
  router.get('/templates/:name', (req, res) => {
    const { name } = req.params;
    const template = TEMPLATES[name as keyof typeof TEMPLATES];
    if (!template) {
      res.status(404).json({ error: `Template "${name}" not found` });
      return;
    }
    const { abi, bytecode } = template.get();
    res.json({ name, abi, bytecode });
  });

  // Compile arbitrary Solidity
  router.post('/compile', (req, res) => {
    const { source, contractName } = req.body as {
      source?: string;
      contractName?: string;
    };

    if (!source) {
      res.status(400).json({ error: 'source is required' });
      return;
    }

    const input: CompilationInput = {
      source,
      contractName: contractName ?? 'Contract',
    };

    const result = compileSolidity(input);
    if (!result.success) {
      res.status(422).json({ error: 'Compilation failed', details: result.errors });
      return;
    }
    res.json({ ok: true, result });
  });

  // Deploy a contract
  router.post('/deploy', async (req, res) => {
    const {
      bytecode,
      abi,
      args = [],
      chain = 'evm',
      accountIndex = 0,
    } = req.body as {
      bytecode?: string;
      abi?: unknown[];
      args?: unknown[];
      chain?: 'core' | 'evm';
      accountIndex?: number;
    };

    if (!bytecode || !abi) {
      res.status(400).json({ error: 'bytecode and abi are required' });
      return;
    }

    const manager = nodeManager.requireManager();
    const accounts = manager.getAccounts();
    const account = accounts[accountIndex];
    if (!account) {
      res.status(400).json({ error: `Account index ${accountIndex} not found` });
      return;
    }

    const rpcUrls = manager.getRpcUrls();
    const rpcUrl = chain === 'core' ? rpcUrls.core : rpcUrls.evm;

    // Deploy using viem (evm) or cive (core)
    if (chain === 'evm') {
      const { createWalletClient, http } = await import('viem');
      const { privateKeyToAccount } = await import('viem/accounts');
      const { defineChain } = await import('viem');

      const evmChain = defineChain({
        id: manager.getConfig().evmChainId ?? 71,
        name: 'Conflux eSpace local',
        nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      });

      const walletClient = createWalletClient({
        account: privateKeyToAccount(account.evmPrivateKey as `0x${string}` ?? account.privateKey as `0x${string}`),
        chain: evmChain,
        transport: http(rpcUrl),
      });

      const hash = await walletClient.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args,
      });

      res.json({ ok: true, txHash: hash, chain });
    } else {
      res.status(400).json({ error: 'Core Space deployment not yet implemented' });
    }
  });

  return router;
}
