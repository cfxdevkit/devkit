import {
  COUNTER_SOURCE,
  type CompilationInput,
  compileSolidity,
  ERC721_SOURCE,
  ESCROW_SOURCE,
  getCounterContract,
  getERC721Contract,
  getEscrowContract,
  getMultiSigContract,
  getRegistryContract,
  getSimpleStorageContract,
  getTestTokenContract,
  getVotingContract,
  MULTISIG_SOURCE,
  REGISTRY_SOURCE,
  SIMPLE_STORAGE_SOURCE,
  TEST_TOKEN_SOURCE,
  VOTING_SOURCE,
} from '@cfxdevkit/compiler';
import {
  getChainConfig,
  isValidChainId,
  type SupportedChainId,
  toCiveChain,
  toViemChain,
} from '@cfxdevkit/core/config';
import type { Address as CiveAddress } from 'cive';
import { Router } from 'express';
import { contractStorage } from '../contract-storage.js';
import { orchestrateDeploy, sleep } from '../deploy-helpers.js';
import type { NodeManager } from '../node-manager.js';

/**
 * Contract routes
 *
 * GET  /api/contracts/templates          — list available built-in templates
 * GET  /api/contracts/templates/:name    — get source + ABI + bytecode for a template
 * POST /api/contracts/compile            — compile arbitrary Solidity source
 *   body: { source: string, contractName?: string }
 * POST /api/contracts/deploy             — deploy a compiled contract
 *   body: { bytecode, abi, args?, chain?, accountIndex?, contractName? }
 * GET  /api/contracts/deployed           — list persisted deployed contracts
 * GET  /api/contracts/deployed/:id       — get one by id
 * DELETE /api/contracts/deployed/:id     — remove from tracking (doesn't affect chain)
 * DELETE /api/contracts/deployed         — clear all
 */
export function createContractRoutes(nodeManager: NodeManager): Router {
  const router = Router();

  const TEMPLATES = {
    SimpleStorage: {
      name: 'SimpleStorage',
      description: 'Basic key-value storage — great for testing reads/writes',
      source: SIMPLE_STORAGE_SOURCE,
      get: getSimpleStorageContract,
    },
    TestToken: {
      name: 'TestToken',
      description:
        'ERC-20 token with mint/burn — useful for DeFi and transfer testing',
      source: TEST_TOKEN_SOURCE,
      get: getTestTokenContract,
    },
    Counter: {
      name: 'Counter',
      description:
        'Ownable step counter with increment/decrement/reset — ideal first contract',
      source: COUNTER_SOURCE,
      get: getCounterContract,
    },
    BasicNFT: {
      name: 'BasicNFT',
      description:
        'ERC-721 NFT from scratch — teaches token ownership, approvals, and transfers',
      source: ERC721_SOURCE,
      get: getERC721Contract,
    },
    Voting: {
      name: 'Voting',
      description:
        'Ballot with vote delegation — teaches structs, weighted votes, governance',
      source: VOTING_SOURCE,
      get: getVotingContract,
    },
    Escrow: {
      name: 'Escrow',
      description:
        'Three-party escrow with arbiter — teaches payable, state machines, CFX transfers',
      source: ESCROW_SOURCE,
      get: getEscrowContract,
    },
    MultiSigWallet: {
      name: 'MultiSigWallet',
      description:
        'M-of-N multi-signature wallet — teaches collective governance and low-level call',
      source: MULTISIG_SOURCE,
      get: getMultiSigContract,
    },
    Registry: {
      name: 'Registry',
      description:
        'On-chain name registry — teaches keccak256 keys, mappings, and string storage',
      source: REGISTRY_SOURCE,
      get: getRegistryContract,
    },
  } as const;

  // ── Templates ──────────────────────────────────────────────────────────────

  router.get('/templates', (_req, res) => {
    const list = Object.entries(TEMPLATES).map(([, t]) => ({
      name: t.name,
      description: t.description,
      source: t.source,
    }));
    res.json(list);
  });

  router.get('/templates/:name', (req, res) => {
    const { name } = req.params;
    const template = TEMPLATES[name as keyof typeof TEMPLATES];
    if (!template) {
      res.status(404).json({ error: `Template "${name}" not found` });
      return;
    }
    const { abi, bytecode } = template.get();
    res.json({ name, source: template.source, abi, bytecode });
  });

  // ── Compile ────────────────────────────────────────────────────────────────

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
    if (!result.success || result.contracts.length === 0) {
      res
        .status(422)
        .json({ error: 'Compilation failed', details: result.errors });
      return;
    }
    const contract = result.contracts[0];
    res.json({
      contractName: contract.contractName,
      abi: contract.abi,
      bytecode: contract.bytecode,
    });
  });

  // ── Deploy ─────────────────────────────────────────────────────────────────

  router.post('/deploy', async (req, res) => {
    const {
      bytecode,
      abi,
      args = [],
      chain = 'evm',
      accountIndex = 0,
      contractName = 'Contract',
    } = req.body as {
      bytecode?: string;
      abi?: unknown[];
      args?: unknown[];
      chain?: 'core' | 'evm';
      accountIndex?: number;
      contractName?: string;
    };

    if (!bytecode || !abi) {
      res.status(400).json({ error: 'bytecode and abi are required' });
      return;
    }

    try {
      const result = await orchestrateDeploy({
        bytecode,
        abi,
        args,
        chain,
        accountIndex,
        contractName,
        nodeManager,
      });
      res.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = msg.includes('not found')
        ? 400
        : msg.includes('Node') || msg.includes('node')
          ? 503
          : 500;
      res.status(status).json({ error: msg });
    }
  });

  // ── Deployed contracts ─────────────────────────────────────────────────────

  router.get('/deployed', (req, res) => {
    const chain = req.query.chain as 'evm' | 'core' | undefined;
    res.json(contractStorage.list(chain));
  });

  router.get('/deployed/:id', (req, res) => {
    const contract = contractStorage.get(req.params.id);
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }
    res.json(contract);
  });

  router.delete('/deployed/:id', (req, res) => {
    const deleted = contractStorage.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }
    res.json({ ok: true });
  });

  router.delete('/deployed', (_req, res) => {
    contractStorage.clear();
    res.json({ ok: true });
  });

  // ── Contract call / interact ───────────────────────────────────────────────
  // POST /api/contracts/:id/call
  //   body: { functionName, args?, accountIndex? }
  //   Read (view/pure)  → returns { success, result }
  //   Write             → packMine() + poll → returns { success, txHash, blockNumber, status }

  router.post('/:id/call', async (req, res) => {
    const { id } = req.params;
    const {
      functionName,
      args = [],
      accountIndex = 0,
    } = req.body as {
      functionName?: string;
      args?: unknown[];
      accountIndex?: number;
    };

    if (!functionName) {
      res.status(400).json({ error: 'functionName is required' });
      return;
    }

    const contract = contractStorage.get(id);
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    type AbiFunction = {
      type: string;
      name?: string;
      inputs?: { name: string; type: string }[];
      outputs?: { name: string; type: string }[];
      stateMutability?: string;
    };

    const abiItem = (contract.abi as AbiFunction[]).find(
      (item) => item.type === 'function' && item.name === functionName
    );
    if (!abiItem) {
      res
        .status(400)
        .json({ error: `Function "${functionName}" not found in ABI` });
      return;
    }

    const isRead =
      abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure';

    let manager: ReturnType<NodeManager['requireManager']>;
    try {
      manager = nodeManager.requireManager();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(503).json({ error: msg });
      return;
    }

    const accounts = manager.getAccounts();
    const account = accounts[accountIndex];
    if (!isRead && !account) {
      res
        .status(400)
        .json({ error: `Account index ${accountIndex} not found` });
      return;
    }

    const rpcUrls = manager.getRpcUrls();
    const cfg = nodeManager.getConfig();

    try {
      if (contract.chain === 'evm') {
        const { createPublicClient, createWalletClient, http, defineChain } =
          await import('viem');

        const evmChain = isValidChainId(cfg.evmChainId ?? 2030)
          ? toViemChain(
              getChainConfig((cfg.evmChainId ?? 2030) as SupportedChainId)
            )
          : defineChain({
              id: cfg.evmChainId ?? 2030,
              name: 'Conflux eSpace local',
              nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
              rpcUrls: { default: { http: [rpcUrls.evm] } },
            });

        const publicClient = createPublicClient({
          chain: evmChain,
          transport: http(rpcUrls.evm, { timeout: 30_000 }),
        });

        if (isRead) {
          const result = await publicClient.readContract({
            address: contract.address as `0x${string}`,
            abi: contract.abi,
            functionName,
            // biome-ignore lint/suspicious/noExplicitAny: ABI args are unknown at runtime
            args: args as any[],
          });
          res.json({ success: true, result: serializeValue(result) });
        } else {
          const { privateKeyToAccount } = await import('viem/accounts');
          const walletClient = createWalletClient({
            account: privateKeyToAccount(
              (account.evmPrivateKey ?? account.privateKey) as `0x${string}`
            ),
            chain: evmChain,
            transport: http(rpcUrls.evm, { timeout: 30_000 }),
          });

          const hash = await walletClient.writeContract({
            address: contract.address as `0x${string}`,
            abi: contract.abi,
            functionName,
            // biome-ignore lint/suspicious/noExplicitAny: ABI args are unknown at runtime
            args: args as any[],
            gas: 500_000n,
          });

          await manager.packMine();
          let receipt = null;
          for (let i = 0; i < 30; i++) {
            receipt = await publicClient
              .getTransactionReceipt({ hash })
              .catch(() => null);
            if (receipt) break;
            await manager.mine(1);
            await sleep(300);
          }
          if (!receipt)
            throw new Error(
              'Transaction timed out — receipt not found after 30 blocks'
            );

          res.json({
            success: true,
            txHash: hash,
            blockNumber: receipt.blockNumber.toString(),
            status: receipt.status,
          });
        }
      } else {
        // ── Core Space ──────────────────────────────────────────────────────
        const cive = await import('cive');

        const coreChain = isValidChainId(cfg.chainId ?? 2029)
          ? toCiveChain(
              getChainConfig((cfg.chainId ?? 2029) as SupportedChainId)
            )
          : (() => {
              // biome-ignore lint/suspicious/noExplicitAny: dynamic fallback
              const { defineChain } = cive as any;
              return defineChain({
                id: cfg.chainId ?? 2029,
                name: 'Conflux Core local',
                nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
                rpcUrls: { default: { http: [rpcUrls.core] } },
              });
            })();

        const publicClient = cive.createPublicClient({
          chain: coreChain,
          transport: cive.http(rpcUrls.core, { timeout: 30_000 }),
        });

        if (isRead) {
          const result = await publicClient.readContract({
            address: contract.address as CiveAddress,
            // biome-ignore lint/suspicious/noExplicitAny: ABI types are heterogeneous
            abi: contract.abi as any[],
            functionName,
            // biome-ignore lint/suspicious/noExplicitAny: ABI args are unknown at runtime
            args: args as any[],
          });
          res.json({ success: true, result: serializeValue(result) });
        } else {
          const { privateKeyToAccount } = await import('cive/accounts');
          const walletClient = cive.createWalletClient({
            account: privateKeyToAccount(account.privateKey as `0x${string}`, {
              networkId: cfg.chainId ?? 2029,
            }),
            chain: coreChain,
            transport: cive.http(rpcUrls.core, { timeout: 30_000 }),
          });

          const hash = await walletClient.writeContract({
            chain: coreChain,
            address: contract.address as CiveAddress,
            // biome-ignore lint/suspicious/noExplicitAny: ABI types are heterogeneous
            abi: contract.abi as any[],
            functionName,
            // biome-ignore lint/suspicious/noExplicitAny: ABI args are unknown at runtime
            args: args as any[],
            gas: 500_000n,
          });

          await manager.packMine();
          let receipt = null;
          for (let i = 0; i < 30; i++) {
            receipt = await publicClient
              .getTransactionReceipt({ hash })
              .catch(() => null);
            if (receipt) break;
            await manager.mine(1);
            await sleep(300);
          }
          if (!receipt)
            throw new Error(
              'Transaction timed out — receipt not found after 30 blocks'
            );

          const coreReceipt = receipt as unknown as {
            outcomeStatus?: string; // 'success' | 'failed' | 'skipped'
            epochNumber?: bigint;
          };
          res.json({
            success: true,
            txHash: hash,
            blockNumber: coreReceipt.epochNumber?.toString() ?? 'unknown',
            status:
              coreReceipt.outcomeStatus === 'success' ? 'success' : 'reverted',
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Call failed: ${msg}` });
    }
  });

  return router;
}

// ── Utilities ──────────────────────────────────────────────────────────────

// Recursively convert BigInts and other non-JSON-serializable values so we can
// safely send contract call results over the wire.
// biome-ignore lint/suspicious/noExplicitAny: recursive serialization of unknown return types
function serializeValue(value: any): any {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeValue(v)])
    );
  return value;
}
