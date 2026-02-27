/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Server Manager for xcfx/node lifecycle management
// Based on proven patterns from DevKit CLI, adapted for unified interface

import type { ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defaultNetworkSelector } from '@cfxdevkit/core/config';
import {
  generateMnemonic as coreGenerateMnemonic,
  deriveAccount,
  deriveAccounts,
  deriveFaucetAccount,
} from '@cfxdevkit/core/wallet';
import { createServer } from '@xcfx/node';
import type { TestClient } from 'cive';
import { privateKeyToAccount } from 'cive/accounts';
import { privateKeyToAccount as privateKeyToEvmAccount } from 'viem/accounts';
import {
  type AccountInfo,
  type FaucetBalances,
  type MiningStatus,
  NodeError,
  type ServerConfig,
  type ServerStatus,
} from './types.js';

// Port configuration
const DEFAULT_CORE_RPC_PORT = 12537;
const DEFAULT_EVM_RPC_PORT = 8545;
const DEFAULT_WS_PORT = 12536;
const DEFAULT_EVM_WS_PORT = 8546;

/**
 * Server Manager for xcfx/node lifecycle management
 * Handles starting, stopping, and managing the Conflux development node
 */
export class ServerManager {
  private nodeProcess: ChildProcess | null = null;
  private server: Awaited<ReturnType<typeof createServer>> | null = null;
  private config: ServerConfig;
  private status: ServerStatus = 'stopped';
  private accounts: AccountInfo[] = [];
  private mnemonic: string = '';
  private miningAccount: AccountInfo | null = null;
  private miningStatus: MiningStatus;
  private miningTimer: NodeJS.Timeout | null = null;
  private testClient: TestClient | null = null;
  /** True while packMine() is running — auto-miner skips its tick to avoid concurrent mining RPCs. */
  private _packMining = false;

  constructor(config: ServerConfig) {
    this.config = {
      ...config,
      coreRpcPort: config.coreRpcPort || DEFAULT_CORE_RPC_PORT,
      evmRpcPort: config.evmRpcPort || DEFAULT_EVM_RPC_PORT,
      wsPort: config.wsPort || DEFAULT_WS_PORT,
      evmWsPort: config.evmWsPort || DEFAULT_EVM_WS_PORT,
      chainId: config.chainId || 2029, // Local Core chain ID
      evmChainId: config.evmChainId || 2030, // Local eSpace chain ID
      accounts: config.accounts || 10,
      balance: config.balance || '1000000',
      mnemonic: config.mnemonic,
      // Following xcfx-node test pattern: devPackTxImmediately should be false
      // All mining is managed via testClient.mine() calls
      devPackTxImmediately: false,
    };

    // Initialize mining status
    this.miningStatus = {
      isRunning: false,
      interval: 1000,
      blocksMined: 0,
      startTime: undefined,
    };

    // Generate or use provided mnemonic and immediately generate accounts
    // This ensures accounts are always available regardless of node state
    this.mnemonic = this.config.mnemonic || coreGenerateMnemonic(128);
    this.generateAccountsSync();
    this.generateMiningAccountSync();
  }

  /**
   * Return a sanitized copy of the server config with sensitive fields redacted.
   */
  private redactConfig(config: ServerConfig): Partial<ServerConfig> {
    type SafeConfig = Partial<ServerConfig> & {
      mnemonic?: string;
      accounts?: unknown;
    };
    const safe: SafeConfig = { ...(config as SafeConfig) };
    if (safe.mnemonic) safe.mnemonic = '[REDACTED]';
    // remove accounts and secrets to avoid leaking private keys
    if (safe.accounts) delete safe.accounts;
    return safe;
  }

  /**
   * Start the Conflux development node
   */
  async start(): Promise<void> {
    if (this.status === 'running') {
      throw new NodeError(
        'Server is already running',
        'SERVER_ALREADY_RUNNING'
      );
    }

    try {
      this.status = 'starting';

      // Mnemonic and accounts are already generated in constructor
      // Mining account is also already generated in constructor

      // Ensure data directory exists with proper permissions
      const dataDir =
        this.config.dataDir || join(homedir(), '.conflux-devkit', 'data');
      try {
        await fs.mkdir(dataDir, { recursive: true, mode: 0o755 });
      } catch (error) {
        console.warn('Failed to create data directory:', error);
        // Continue anyway, might still work if directory exists
      }

      // Create server instance with configuration
      const serverConfig = {
        // Correct property names according to @xcfx/node API
        jsonrpcHttpPort: this.config.coreRpcPort,
        jsonrpcHttpEthPort: this.config.evmRpcPort,
        jsonrpcWsPort: this.config.wsPort,
        jsonrpcWsEthPort: this.config.evmWsPort,
        chainId: this.config.chainId,
        evmChainId: this.config.evmChainId,
        // Specify data directory to avoid permission issues
        confluxDataDir: dataDir,
        // Genesis accounts configuration - include mining account for initial funding
        genesisSecrets: [
          ...this.accounts.map((acc) => acc.privateKey),
          this.requireMiningAccount().privateKey, // Add mining account to get initial funds
        ],
        genesisEvmSecrets: [
          ...this.accounts.map((acc) => acc.evmPrivateKey || acc.privateKey),
          this.requireMiningAccount().evmPrivateKey ||
            this.requireMiningAccount().privateKey, // Add mining account EVM key
        ],
        // Mining configuration - use config value or default to mining account address
        // 'auto' is a sentinel value meaning "use the derived mining account address"
        miningAuthor:
          this.config.miningAuthor && this.config.miningAuthor !== 'auto'
            ? this.config.miningAuthor
            : this.miningAccount?.coreAddress,
        // Following the reference test (xcfx-node/evmManualBlockGeneration.test.ts):
        // devPackTxImmediately: false — eSpace txs are ONLY packed by mine({ numTxs }),
        // never by mine({ blocks }).  This flag only affects Core space.
        devPackTxImmediately: false,
        log: this.config.logging || false,
        // Genesis block initialization can take time; pass a generous timeout so
        // the native binary doesn't abort the startup handshake prematurely.
        timeout: 60000,
        retryInterval: 300,
      };

      this.server = await createServer(serverConfig);

      // Start the server - this is required!
      await this.server.start();

      this.status = 'running';

      // Update network selector with local chain URLs and notify it of node start
      defaultNetworkSelector.updateLocalChainUrls(
        this.config.coreRpcPort || DEFAULT_CORE_RPC_PORT,
        this.config.evmRpcPort || DEFAULT_EVM_RPC_PORT,
        this.config.wsPort || DEFAULT_WS_PORT
      );
      defaultNetworkSelector.onNodeStart(2029, 2030); // Core local, eSpace local

      // Set up cleanup handlers
      this.setupCleanupHandlers();

      // Auto-start mining at 2s intervals using mine({ blocks:1 }).
      // With devPackTxImmediately:true the node packs pending txs into every
      // generated block, so we never need test_generateOneBlock (which can
      // block for >10 s on slow machines and saturate the RPC connection).
      await this.startMining(2000);
    } catch (error) {
      this.status = 'error';
      throw new NodeError(
        `Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
        'SERVER_START_ERROR',
        undefined,
        {
          config: this.redactConfig(this.config as ServerConfig),
          originalError: error,
        }
      );
    }
  }

  /**
   * Stop the Conflux development node
   */
  async stop(): Promise<void> {
    if (this.status === 'stopped') {
      return;
    }

    try {
      this.status = 'stopping';

      // Stop mining if running
      if (this.miningStatus.isRunning) {
        try {
          await this.stopMining();
        } catch (error) {
          console.warn('Failed to stop mining during server shutdown:', error);
        }
      }

      if (this.server) {
        await this.server.stop();
        this.server = null;
      }

      if (this.nodeProcess) {
        this.nodeProcess.kill('SIGTERM');
        this.nodeProcess = null;
      }

      // Clean up test client
      this.testClient = null;

      this.status = 'stopped';

      // Notify network selector that node has stopped
      defaultNetworkSelector.onNodeStop();
    } catch (error) {
      this.status = 'error';
      throw new NodeError(
        `Failed to stop server: ${error instanceof Error ? error.message : String(error)}`,
        'SERVER_STOP_ERROR',
        undefined,
        { originalError: error }
      );
    }
  }

  /**
   * Restart the Conflux development node
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Get current server status
   */
  getStatus(): ServerStatus {
    return this.status;
  }

  /**
   * Get comprehensive node status including mining
   */
  getNodeStatus() {
    return {
      server: this.status,
      mining: this.getMiningStatus(),
      config: this.redactConfig(this.config as ServerConfig),
      accounts: this.accounts.length,
      rpcUrls: this.getRpcUrls(),
    };
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Get server configuration
   */
  getConfig(): ServerConfig {
    // Return a sanitized config to avoid exposing mnemonic/privkeys in logs or API
    return {
      ...(this.redactConfig(this.config as ServerConfig) as ServerConfig),
    };
  }

  /**
   * Get generated accounts
   */
  getAccounts(): AccountInfo[] {
    return [...this.accounts];
  }

  /**
   * Get the mnemonic phrase
   */
  getMnemonic(): string {
    return this.mnemonic;
  }

  /**
   * Get RPC URLs
   */
  getRpcUrls(): {
    core: string;
    evm: string;
    coreWs: string;
    evmWs: string;
    ws: string;
  } {
    const coreWs = `ws://localhost:${this.config.wsPort}`;
    return {
      core: `http://localhost:${this.config.coreRpcPort}`,
      evm: `http://localhost:${this.config.evmRpcPort}`,
      coreWs,
      evmWs: `ws://localhost:${this.config.evmWsPort}`,
      ws: coreWs, // backward-compat alias for Core WS
    };
  }

  /**
   * Add a new account to the server
   */
  async addAccount(privateKey?: string): Promise<AccountInfo> {
    const accountPrivateKey =
      privateKey || `0x${randomBytes(32).toString('hex')}`;

    const coreAccount = privateKeyToAccount(
      accountPrivateKey as `0x${string}`,
      {
        networkId: this.config.chainId || 1,
      }
    );
    const evmAccount = privateKeyToEvmAccount(
      accountPrivateKey as `0x${string}`
    );

    const accountInfo: AccountInfo = {
      index: this.accounts.length,
      privateKey: accountPrivateKey,
      coreAddress: coreAccount.address,
      evmAddress: evmAccount.address,
      mnemonic: this.mnemonic,
      path: `m/44'/503'/0'/0/${this.accounts.length}`,
    };

    this.accounts.push(accountInfo);

    // Note: @xcfx/node automatically funds genesis accounts
    // Additional funding would require separate RPC calls to the running node

    return accountInfo;
  }

  /**
   * Fund an account with CFX
   * Note: @xcfx/node doesn't provide direct funding methods.
   * This would require using RPC calls to send transactions from funded genesis accounts.
   */
  async fundAccount(
    address: string,
    amount: string,
    chainType: 'core' | 'evm' = 'core'
  ): Promise<void> {
    if (!this.isRunning() || !this.server) {
      throw new NodeError('Server is not running', 'SERVER_NOT_RUNNING');
    }

    // This functionality would need to be implemented using RPC calls
    // to transfer funds from genesis accounts to the target address
    throw new NodeError(
      'Direct account funding not implemented. Genesis accounts are automatically funded by @xcfx/node.',
      'NOT_IMPLEMENTED',
      chainType,
      { address, amount, chainType }
    );
  }

  /**
   * Set next block timestamp (for testing)
   * Note: @xcfx/node doesn't provide direct timestamp control.
   * Use createTestClient from 'cive' and connect to the running node's RPC.
   */
  async setNextBlockTimestamp(timestamp: number): Promise<void> {
    if (!this.isRunning() || !this.server) {
      throw new NodeError('Server is not running', 'SERVER_NOT_RUNNING');
    }

    // This functionality would need to be implemented using createTestClient
    // from 'cive' library connected to the running server's RPC endpoint
    throw new NodeError(
      'Direct timestamp control not implemented. Use createTestClient from cive to control block timestamps via RPC.',
      'NOT_IMPLEMENTED',
      'core',
      { timestamp }
    );
  }

  /**
   * Get server logs
   * Note: @xcfx/node doesn't provide direct log access.
   * Logs would need to be captured during server startup or accessed via system logs.
   */
  async getLogs(lines: number = 50): Promise<string[]> {
    if (!this.isRunning() || !this.server) {
      throw new NodeError('Server is not running', 'SERVER_NOT_RUNNING');
    }

    // @xcfx/node doesn't provide log access methods
    // This would need to be implemented by capturing stdout/stderr during server startup
    // or by accessing system logs where the node process writes its output
    return [
      'Log access not implemented for @xcfx/node.',
      'Consider capturing server output during startup or checking system logs.',
      `Requested ${lines} lines of logs.`,
    ];
  }

  /**
   * Save server configuration to file
   */
  async saveConfig(filepath: string): Promise<void> {
    try {
      // Save a sanitized config file by redacting the mnemonic and removing private data
      const configData = {
        ...this.redactConfig(this.config as ServerConfig),
        mnemonic: '[REDACTED]',
        accounts: this.accounts.map((a) => ({
          index: a.index,
          coreAddress: a.coreAddress,
          evmAddress: a.evmAddress,
          path: a.path,
        })),
        rpcUrls: this.getRpcUrls(),
      };

      await fs.writeFile(filepath, JSON.stringify(configData, null, 2), 'utf8');
    } catch (error) {
      throw new NodeError(
        `Failed to save config: ${error instanceof Error ? error.message : String(error)}`,
        'CONFIG_SAVE_ERROR',
        'core',
        { filepath, originalError: error }
      );
    }
  }

  /**
   * Load server configuration from file
   */
  static async loadConfig(filepath: string): Promise<ServerConfig> {
    try {
      const configData = await fs.readFile(filepath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      throw new NodeError(
        `Failed to load config: ${error instanceof Error ? error.message : String(error)}`,
        'CONFIG_LOAD_ERROR',
        'core',
        { filepath, originalError: error }
      );
    }
  }

  /**
   * Generate accounts from mnemonic using core wallet module
   * Called from constructor to ensure accounts are always available
   */
  private generateAccountsSync(): void {
    // Use core wallet module for account derivation
    const derivedAccounts = deriveAccounts(this.mnemonic, {
      count: this.config.accounts || 10,
      coreNetworkId: this.config.chainId || 2029,
    });

    this.accounts = derivedAccounts.map((account) => ({
      index: account.index,
      privateKey: account.corePrivateKey, // Keep Conflux private key as primary
      coreAddress: account.coreAddress,
      evmAddress: account.evmAddress,
      mnemonic: this.mnemonic,
      path: account.paths.core,
      // Store additional EVM-specific info
      evmPrivateKey: account.evmPrivateKey,
      evmPath: account.paths.evm,
    }));
  }

  /**
   * Generate dedicated mining account (separate from genesis accounts)
   * This account will receive mining rewards and serve as the faucet
   * Called synchronously from constructor to ensure always available
   */
  private generateMiningAccountSync(): void {
    // Use core wallet module for faucet/mining account derivation
    const faucetAccount = deriveFaucetAccount(
      this.mnemonic,
      this.config.chainId || 2029
    );

    this.miningAccount = {
      index: -1, // Special index for mining account
      privateKey: faucetAccount.corePrivateKey, // Core/Conflux private key
      coreAddress: faucetAccount.coreAddress,
      evmAddress: faucetAccount.evmAddress,
      mnemonic: this.mnemonic,
      path: faucetAccount.paths.core,
      // Store additional EVM-specific info
      evmPrivateKey: faucetAccount.evmPrivateKey,
      evmPath: faucetAccount.paths.evm,
    };

    console.log(
      `Generated mining account: Core=${this.miningAccount.coreAddress}, eSpace=${this.miningAccount.evmAddress}`
    );
  }

  /**
   * Returns the mining account, throwing if it has not been initialized.
   * In practice this is always set by generateMiningAccountSync() in the
   * constructor, so the throw is a safety net for unexpected states.
   */
  private requireMiningAccount(): AccountInfo {
    if (!this.miningAccount) {
      throw new Error('Mining account has not been initialized.');
    }
    return this.miningAccount;
  }

  // ===== MINING METHODS =====

  /**
   * Start automatic block mining using testClient
   * This creates an interval that mines blocks automatically
   * @param interval Mining interval in milliseconds (default: 2000ms)
   */
  async startMining(interval?: number): Promise<void> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to start mining',
        'SERVER_NOT_RUNNING'
      );
    }

    if (this.miningStatus.isRunning) {
      throw new NodeError(
        'Mining is already running',
        'MINING_ALREADY_RUNNING'
      );
    }

    // Initialize test client if not already created
    if (!this.testClient) {
      const { createTestClient, http } = await import('cive');
      this.testClient = createTestClient({
        transport: http(`http://localhost:${this.config.coreRpcPort}`, {
          timeout: 60_000,
        }),
      });
    }

    const miningInterval = interval || 2000; // Default 2s — empty blocks are fast

    this.miningStatus = {
      ...this.miningStatus,
      isRunning: true,
      interval: miningInterval,
      startTime: new Date(),
    };

    // Start the mining loop
    this.miningTimer = setInterval(async () => {
      try {
        if (this.testClient && !this._packMining) {
          // mine({ blocks: 1 }) = empty block that also packs pending txs
          // when devPackTxImmediately: true (fast, never calls test_generateOneBlock)
          await this.testClient.mine({ blocks: 1 });
          this.miningStatus = {
            ...this.miningStatus,
            blocksMined: (this.miningStatus.blocksMined || 0) + 1,
          };
        }
      } catch (error) {
        console.error('Mining error:', error);
        // Continue mining even if a single block fails
      }
    }, miningInterval);

    console.log(`Mining started with ${miningInterval}ms interval`);
  }

  /**
   * Stop automatic block mining
   */
  async stopMining(): Promise<void> {
    if (!this.miningStatus.isRunning) {
      throw new NodeError('Mining is not running', 'MINING_NOT_RUNNING');
    }

    if (this.miningTimer) {
      clearInterval(this.miningTimer);
      this.miningTimer = null;
    }

    this.miningStatus = {
      ...this.miningStatus,
      isRunning: false,
      startTime: undefined,
    };

    console.log('Mining stopped');
  }

  /**
   * Change mining interval (stops and restarts mining with new interval)
   */
  async setMiningInterval(interval: number): Promise<void> {
    if (interval < 100) {
      throw new NodeError(
        'Mining interval must be at least 100ms',
        'INVALID_INTERVAL'
      );
    }

    const wasRunning = this.miningStatus.isRunning;

    if (wasRunning) {
      await this.stopMining();
    }

    // Update the status interval
    this.miningStatus = {
      ...this.miningStatus,
      interval,
    };

    if (wasRunning) {
      await this.startMining(interval);
    }

    console.log(`Mining interval set to ${interval}ms`);
  }

  /**
   * Mine a specific number of blocks immediately
   */
  async mine(blocks: number = 1): Promise<void> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to mine blocks',
        'SERVER_NOT_RUNNING'
      );
    }

    if (!this.testClient) {
      const { createTestClient, http } = await import('cive');
      this.testClient = createTestClient({
        transport: http(`http://localhost:${this.config.coreRpcPort}`, {
          timeout: 60_000,
        }),
      });
    }

    try {
      // mine({ blocks }) with devPackTxImmediately:true also packs pending txs
      await this.testClient.mine({ blocks });
      this.miningStatus = {
        ...this.miningStatus,
        blocksMined: (this.miningStatus.blocksMined || 0) + blocks,
      };
      console.log(`Mined ${blocks} empty block(s)`);
    } catch (error) {
      throw new NodeError(
        `Failed to mine blocks: ${error instanceof Error ? error.message : String(error)}`,
        'MINING_ERROR',
        'core',
        { blocks, originalError: error }
      );
    }
  }

  /**
   * Pack and mine: calls test_generateOneBlock (mine({ numTxs:1 })) which
   * forces pending eSpace/Core transactions into a block.  Each call
   * internally generates deferredStateEpochCount (default 5) blocks.
   *
   * This is the ONLY way to include eSpace (EVM) transactions — mine({ blocks })
   * skips the txpool for eSpace.  Uses a long timeout because
   * test_generateOneBlock can take several seconds on slow machines.
   */
  async packMine(): Promise<void> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to mine blocks',
        'SERVER_NOT_RUNNING'
      );
    }

    // Use a separate client with a generous timeout for this slow operation
    const { createTestClient, http } = await import('cive');
    const packClient = createTestClient({
      transport: http(`http://localhost:${this.config.coreRpcPort}`, {
        timeout: 120_000,
      }),
    });

    // Block the auto-miner interval so it does not fire a concurrent mining RPC
    // that would crash xcfx while test_generateOneBlock is running.
    this._packMining = true;
    try {
      await packClient.mine({ numTxs: 1 });
      this.miningStatus = {
        ...this.miningStatus,
        blocksMined: (this.miningStatus.blocksMined || 0) + 5, // generates 5 blocks internally
      };
      console.log('Pack-mined: 5 blocks generated, pending txs included');
    } catch (error) {
      throw new NodeError(
        `Failed to pack-mine: ${error instanceof Error ? error.message : String(error)}`,
        'MINING_ERROR',
        'core',
        { originalError: error }
      );
    } finally {
      this._packMining = false;
    }
  }

  /**
   * Get current mining status
   */
  getMiningStatus(): MiningStatus {
    return { ...this.miningStatus };
  }

  // ===== FAUCET METHODS =====

  /**
   * Get the faucet/mining account (dedicated mining account with separate derivation path)
   * This account receives mining rewards and serves as the faucet
   * Derivation paths: Core=m/44'/503'/1'/0/0, EVM=m/44'/60'/1'/0/0
   */
  getFaucetAccount(): AccountInfo {
    if (!this.miningAccount) {
      throw new NodeError(
        'Mining account not available. Server must be started first.',
        'NO_MINING_ACCOUNT'
      );
    }
    return this.miningAccount;
  }

  /**
   * Fund a Core Space account using the faucet account
   */
  async fundCoreAccount(
    targetAddress: string,
    amount: string
  ): Promise<string> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to fund accounts',
        'SERVER_NOT_RUNNING'
      );
    }

    const faucetAccount = this.getFaucetAccount();

    try {
      // Create wallet client for the faucet account
      const { createWalletClient, http } = await import('cive');
      const { privateKeyToAccount } = await import('cive/accounts');

      const account = privateKeyToAccount(
        faucetAccount.privateKey as `0x${string}`,
        {
          networkId: this.config.chainId || 1,
        }
      );

      const walletClient = createWalletClient({
        account,
        chain:
          (this.config.chainId || 1) === 1029
            ? {
                id: 1029,
                name: 'Conflux Core',
                nativeCurrency: {
                  name: 'Conflux',
                  symbol: 'CFX',
                  decimals: 18,
                },
                rpcUrls: {
                  default: {
                    http: [`http://localhost:${this.config.coreRpcPort}`],
                  },
                },
              }
            : {
                id: this.config.chainId || 1,
                name: 'Conflux Core Testnet',
                nativeCurrency: {
                  name: 'Conflux',
                  symbol: 'CFX',
                  decimals: 18,
                },
                rpcUrls: {
                  default: {
                    http: [`http://localhost:${this.config.coreRpcPort}`],
                  },
                },
              },
        transport: http(`http://localhost:${this.config.coreRpcPort}`),
      });

      const { parseCFX } = await import('cive');

      const hash = await walletClient.sendTransaction({
        account,
        to: targetAddress as `cfx:${string}`,
        value: parseCFX(amount),
      });

      console.log(
        `Funded Core account ${targetAddress} with ${amount} CFX. TX: ${hash}`
      );
      return hash;
    } catch (error) {
      throw new NodeError(
        `Failed to fund Core account: ${error instanceof Error ? error.message : String(error)}`,
        'FAUCET_ERROR',
        'core',
        {
          targetAddress,
          amount,
          faucetAccount: faucetAccount.coreAddress,
          originalError: error,
        }
      );
    }
  }

  /**
   * Fund an eSpace account from the Core-Space faucet/mining account.
   *
   * Funds ALWAYS originate from the Core-Space faucet wallet (which accumulates
   * mining rewards).  For eSpace (0x…) targets the transfer is routed through the
   * Conflux internal cross-chain bridge contract (0x0888…0006 / transferEVM),
   * which locks CFX on Core and mints it on eSpace — no separate eSpace balance is
   * needed on the faucet account.
   */
  async fundEvmAccount(targetAddress: string, amount: string): Promise<string> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to fund accounts',
        'SERVER_NOT_RUNNING'
      );
    }

    const faucetAccount = this.getFaucetAccount();

    try {
      const { createWalletClient, http, parseCFX } = await import('cive');
      const { privateKeyToAccount } = await import('cive/accounts');
      const { hexAddressToBase32, encodeFunctionData, defineChain } =
        await import('cive/utils');

      const chainId = this.config.chainId || 2029;
      const chain = defineChain({
        id: chainId,
        name: 'Conflux Core Local',
        nativeCurrency: { decimals: 18, name: 'Conflux', symbol: 'CFX' },
        rpcUrls: {
          default: { http: [`http://localhost:${this.config.coreRpcPort}`] },
        },
      });

      const account = privateKeyToAccount(
        faucetAccount.privateKey as `0x${string}`,
        { networkId: chainId }
      );

      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(`http://localhost:${this.config.coreRpcPort}`),
      });

      // Internal cross-chain bridge contract on Core Space
      const bridgeAddress = hexAddressToBase32({
        hexAddress: '0x0888000000000000000000000000000000000006',
        networkId: chainId,
      });

      const hash = await walletClient.sendTransaction({
        account,
        chain,
        to: bridgeAddress,
        value: parseCFX(amount),
        data: encodeFunctionData({
          abi: [
            {
              type: 'function',
              name: 'transferEVM',
              inputs: [{ name: 'to', type: 'bytes20' }],
              outputs: [{ name: 'output', type: 'bytes' }],
              stateMutability: 'payable',
            },
          ],
          functionName: 'transferEVM',
          args: [targetAddress as `0x${string}`],
        }),
      });

      console.log(
        `Funded eSpace account ${targetAddress} with ${amount} CFX via Core→eSpace bridge. TX: ${hash}`
      );
      return hash;
    } catch (error) {
      throw new NodeError(
        `Failed to fund eSpace account: ${error instanceof Error ? error.message : String(error)}`,
        'FAUCET_ERROR',
        'evm',
        {
          targetAddress,
          amount,
          faucetCoreAddress: faucetAccount.coreAddress,
          originalError: error,
        }
      );
    }
  }

  /**
   * Fund both Core and eSpace accounts for the same private key
   */
  async fundDualChainAccount(
    privateKey: string,
    coreAmount: string,
    evmAmount: string
  ): Promise<{
    coreHash: string;
    evmHash: string;
    coreAddress: string;
    evmAddress: string;
  }> {
    // Create accounts from private key
    const { privateKeyToAccount } = await import('cive/accounts');
    const { privateKeyToAccount: privateKeyToEvmAccount } = await import(
      'viem/accounts'
    );

    const coreAccount = privateKeyToAccount(privateKey as `0x${string}`, {
      networkId: this.config.chainId || 1,
    });
    const evmAccount = privateKeyToEvmAccount(privateKey as `0x${string}`);

    // Fund both accounts
    const [coreHash, evmHash] = await Promise.all([
      this.fundCoreAccount(coreAccount.address, coreAmount),
      this.fundEvmAccount(evmAccount.address, evmAmount),
    ]);

    return {
      coreHash,
      evmHash,
      coreAddress: coreAccount.address,
      evmAddress: evmAccount.address,
    };
  }

  /**
   * Check faucet account balances on both chains
   */
  async getFaucetBalances(): Promise<FaucetBalances> {
    if (!this.isRunning()) {
      throw new NodeError(
        'Server must be running to check balances',
        'SERVER_NOT_RUNNING'
      );
    }

    const faucetAccount = this.getFaucetAccount();

    try {
      const [core, evm] = await Promise.all([
        this.getCoreBalance(faucetAccount.coreAddress),
        this.getEvmBalance(faucetAccount.evmAddress),
      ]);

      return { core, evm };
    } catch (error) {
      throw new NodeError(
        `Failed to get faucet balances: ${error instanceof Error ? error.message : String(error)}`,
        'BALANCE_CHECK_ERROR',
        undefined,
        { faucetAccount, originalError: error }
      );
    }
  }

  /**
   * Check Core Space balance
   */
  private async getCoreBalance(address: string): Promise<string> {
    const { createPublicClient, http, formatCFX } = await import('cive');

    const publicClient = createPublicClient({
      chain:
        this.config.chainId === 1029
          ? {
              id: 1029,
              name: 'Conflux Core',
              nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
              rpcUrls: {
                default: {
                  http: [`http://localhost:${this.config.coreRpcPort}`],
                },
              },
            }
          : {
              id: 1,
              name: 'Conflux Core Testnet',
              nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
              rpcUrls: {
                default: {
                  http: [`http://localhost:${this.config.coreRpcPort}`],
                },
              },
            },
      transport: http(`http://localhost:${this.config.coreRpcPort}`),
    });

    const balance = await publicClient.getBalance({
      address: address as `cfx:${string}`,
    });
    return formatCFX(balance);
  }

  /**
   * Check eSpace balance
   */
  private async getEvmBalance(address: string): Promise<string> {
    const { createPublicClient, http, formatEther } = await import('viem');

    const publicClient = createPublicClient({
      chain: {
        id: this.config.evmChainId || 71,
        name: 'Conflux eSpace Local',
        nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
        rpcUrls: {
          default: { http: [`http://localhost:${this.config.evmRpcPort}`] },
        },
      },
      transport: http(`http://localhost:${this.config.evmRpcPort}`),
    });

    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    return formatEther(balance);
  }

  /**
   * Get Ethereum-compatible admin address derived from mnemonic
   * Uses the standard Ethereum derivation path: m/44'/60'/0'/0/0
   * This address will match what MetaMask and other Ethereum wallets derive
   */
  getEthereumAdminAddress(): string {
    // Use core wallet module for account derivation
    const account = deriveAccount(
      this.mnemonic,
      0,
      this.config.chainId || 2029
    );

    return account.evmAddress.toLowerCase();
  }

  /**
   * Set up cleanup handlers for graceful shutdown
   */
  private setupCleanupHandlers(): void {
    const cleanup = async () => {
      if (this.isRunning()) {
        console.log('Shutting down Conflux development node...');
        await this.stop();
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }
}
