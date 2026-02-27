/**
 * ContractStorageService — persists deployed contract records for the active
 * wallet under `<walletDataDir>/contracts.json`.
 *
 * The NodeManager calls setDataDir() each time a wallet's node starts so the
 * correct per-wallet file is used.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { logger } from '@cfxdevkit/core/utils';

export interface StoredContract {
  id: string; // e.g. "evm-1713000000000"
  name: string; // contract name as deployed
  address: string; // deployed address (0x… or cfx:…)
  chain: 'evm' | 'core';
  chainId: number;
  txHash: string;
  deployer: string; // deployer address
  deployedAt: string; // ISO timestamp
  abi: unknown[];
  constructorArgs: unknown[];
}

interface ContractsFile {
  version: 1;
  walletDataDir: string;
  contracts: StoredContract[];
  updatedAt: string;
}

class ContractStorageService {
  private dataDir: string | null = null;
  private contracts: Map<string, StoredContract> = new Map();
  private initialized = false;

  /** Call when a wallet's node starts so storage points to the right directory. */
  setDataDir(walletDataDir: string): void {
    if (this.dataDir !== walletDataDir) {
      this.dataDir = walletDataDir;
      this.contracts.clear();
      this.initialized = false;
    }
  }

  private get storagePath(): string {
    if (!this.dataDir)
      throw new Error('ContractStorageService: dataDir not set');
    return `${this.dataDir}/contracts.json`;
  }

  private ensureLoaded(): void {
    if (this.initialized) return;
    if (!this.dataDir) return;

    try {
      if (existsSync(this.storagePath)) {
        const raw = readFileSync(this.storagePath, 'utf-8');
        const file: ContractsFile = JSON.parse(raw);
        this.contracts.clear();
        for (const c of file.contracts ?? []) {
          this.contracts.set(c.id, c);
        }
        logger.info(
          `ContractStorage: loaded ${this.contracts.size} contracts from ${this.storagePath}`
        );
      }
    } catch (err) {
      logger.error('ContractStorage: failed to load contracts file', err);
    }

    this.initialized = true;
  }

  private save(): void {
    if (!this.dataDir) return;
    try {
      const dir = dirname(this.storagePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const file: ContractsFile = {
        version: 1,
        walletDataDir: this.dataDir,
        contracts: Array.from(this.contracts.values()),
        updatedAt: new Date().toISOString(),
      };
      writeFileSync(this.storagePath, JSON.stringify(file, null, 2), 'utf-8');
    } catch (err) {
      logger.error('ContractStorage: failed to save contracts file', err);
      throw err;
    }
  }

  add(contract: StoredContract): StoredContract {
    this.ensureLoaded();
    this.contracts.set(contract.id, contract);
    this.save();
    logger.info(
      `ContractStorage: saved ${contract.name} at ${contract.address} (${contract.chain})`
    );
    return contract;
  }

  list(chain?: 'evm' | 'core'): StoredContract[] {
    this.ensureLoaded();
    const all = Array.from(this.contracts.values());
    const filtered = chain ? all.filter((c) => c.chain === chain) : all;
    return filtered.sort(
      (a, b) =>
        new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
    );
  }

  get(id: string): StoredContract | undefined {
    this.ensureLoaded();
    return this.contracts.get(id);
  }

  delete(id: string): boolean {
    this.ensureLoaded();
    const deleted = this.contracts.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  clear(): void {
    this.ensureLoaded();
    this.contracts.clear();
    this.save();
  }

  /** Wipe the contracts.json file entirely (called from restartWipe). */
  async wipeFile(): Promise<void> {
    if (!this.dataDir) return;
    this.contracts.clear();
    this.initialized = false;
    await rm(this.storagePath, { force: true });
  }
}

// Singleton
export const contractStorage = new ContractStorageService();
