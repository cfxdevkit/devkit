import { getKeystoreService } from '@cfxdevkit/services';
import { ServerManager } from '@cfxdevkit/devnode';
import type { ServerConfig } from '@cfxdevkit/devnode';
import { logger } from '@cfxdevkit/core/utils';

/** Default local-devnet configuration */
const DEFAULT_CONFIG: ServerConfig = {
  chainId: 1,       // Core Space — local devnet
  evmChainId: 71,   // eSpace  — local devnet
  coreRpcPort: 12537,
  evmRpcPort: 8545,
  wsPort: 12535,
  log: false,
  accounts: 10,
};

/**
 * NodeManager wraps a single ServerManager instance.
 * It integrates with KeystoreService to provide the mnemonic and
 * persisted node config on startup.
 */
export class NodeManager {
  private manager: ServerManager | null = null;
  private config: ServerConfig = { ...DEFAULT_CONFIG };

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

  getConfig(): ServerConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<ServerConfig>): void {
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

    const server = new ServerManager({ ...this.config, mnemonic });
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
}
