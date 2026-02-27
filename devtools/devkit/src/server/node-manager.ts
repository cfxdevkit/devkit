import { rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { logger } from '@cfxdevkit/core/utils';
import type { ServerConfig } from '@cfxdevkit/devnode';
import { ServerManager } from '@cfxdevkit/devnode';
import { getKeystoreService } from '@cfxdevkit/services';
import { contractStorage } from './contract-storage.js';

/** Default local-devnet configuration */
const DEFAULT_CONFIG: Omit<ServerConfig, 'dataDir'> = {
  chainId: 2029, // Core Space — local devnet
  evmChainId: 2030, // eSpace  — local devnet
  coreRpcPort: 12537,
  evmRpcPort: 8545,
  wsPort: 12535,
  evmWsPort: 8546,
  log: false,
  accounts: 10,
};

/** Returns the data directory path for a given wallet ID. */
function walletDataDir(walletId: string): string {
  return join(homedir(), '.conflux-devkit', 'wallets', walletId, 'data');
}

/**
 * NodeManager wraps a single ServerManager instance.
 * It integrates with KeystoreService to provide the mnemonic and
 * persisted node config on startup.
 */
export class NodeManager {
  private manager: ServerManager | null = null;
  private config: Omit<ServerConfig, 'dataDir'> = { ...DEFAULT_CONFIG };

  /** Called once at server start to load persisted state from the keystore. */
  async initialize(): Promise<void> {
    const keystore = getKeystoreService();
    await keystore.initialize();

    if (await keystore.isSetupCompleted()) {
      try {
        const active = await keystore.getActiveMnemonic();
        const nodeConfig = await keystore.getNodeConfig(active.id);
        if (nodeConfig) {
          this.config = { ...DEFAULT_CONFIG, ...nodeConfig };
        }
      } catch {
        // No active mnemonic yet — setup not complete
      }
    }

    logger.info('NodeManager ready');
  }

  getManager(): ServerManager | null {
    return this.manager;
  }

  requireManager(): ServerManager {
    if (!this.manager) throw new Error('Node is not running. Start it first.');
    return this.manager;
  }

  isRunning(): boolean {
    return this.manager?.isRunning() ?? false;
  }

  getConfig(): Omit<ServerConfig, 'dataDir'> {
    return { ...this.config };
  }

  updateConfig(partial: Partial<Omit<ServerConfig, 'dataDir'>>): void {
    this.config = { ...this.config, ...partial };
  }

  async start(): Promise<void> {
    if (this.manager?.isRunning()) {
      throw new Error('Node is already running.');
    }

    const keystore = getKeystoreService();
    if (!(await keystore.isSetupCompleted())) {
      throw new Error('Setup not completed. Configure a mnemonic first.');
    }

    const active = await keystore.getActiveMnemonic();
    const mnemonic = await keystore.getDecryptedMnemonic(active.id);
    const dataDir = walletDataDir(active.id);

    // Point contract storage at this wallet's directory before starting
    contractStorage.setDataDir(dataDir);

    const server = new ServerManager({ ...this.config, dataDir, mnemonic });
    await server.start();
    this.manager = server;
  }

  async stop(): Promise<void> {
    if (this.manager) {
      await this.manager.stop();
      this.manager = null;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /** Stop, wipe the active wallet's data directory (including contracts.json), then start fresh. */
  async restartWipe(): Promise<void> {
    await this.wipeData();
    await this.start();
  }

  /** Stop the node if running, then wipe the active wallet's data directory.  Does NOT restart. */
  async wipeData(): Promise<void> {
    const keystore = getKeystoreService();
    const active = await keystore.getActiveMnemonic();
    const dataDir = walletDataDir(active.id);
    await this.stop();
    // Clear in-memory contract storage before wiping
    await contractStorage.wipeFile();
    await rm(dataDir, { recursive: true, force: true });
    logger.info(`Wiped data directory: ${dataDir}`);
  }
}
