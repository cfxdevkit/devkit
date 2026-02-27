/**
 * Typed fetch helpers for all devkit API endpoints.
 */

const BASE = '/api';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body?: unknown) =>
  request<T>('POST', path, body);
const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, body);
const del = <T>(path: string) => request<T>('DELETE', path);

/* ─── node ────────────────────────────────────────────────────────── */
export interface NodeStatus {
  server: 'running' | 'stopped' | 'starting' | 'stopping';
  epochNumber?: number;
  miningStatus?: string;
  rpcUrls?: { core: string; evm: string; ws: string };
}

export const nodeApi = {
  status: () => get<NodeStatus>('/node/status'),
  start: () => post<NodeStatus>('/node/start'),
  stop: () => post<{ success: boolean }>('/node/stop'),
  restart: () => post<NodeStatus>('/node/restart'),
};

/* ─── accounts ────────────────────────────────────────────────────── */
export interface AccountInfo {
  index: number;
  coreAddress: string;
  evmAddress: string;
  coreBalance: string;
  evmBalance: string;
  privateKey: string;
}

export interface FaucetInfo {
  coreAddress: string;
  evmAddress: string;
  coreBalance: string;
  evmBalance: string;
}

export const accountsApi = {
  list: () => get<AccountInfo[]>('/accounts'),
  faucet: () => get<FaucetInfo>('/accounts/faucet'),
  fund: (address: string, amount?: string, chain?: 'core' | 'evm') =>
    post<{ success: boolean; txHash: string }>('/accounts/fund', {
      address,
      amount,
      chain,
    }),
};

/* ─── contracts ────────────────────────────────────────────────────── */
export interface ContractTemplate {
  name: string;
  source: string;
}

export interface CompileResult {
  abi: unknown[];
  bytecode: string;
  contractName: string;
}

export interface DeployResult {
  address: string;
  txHash: string;
  chain: string;
}

export const contractsApi = {
  templates: () => get<ContractTemplate[]>('/contracts/templates'),
  template: (name: string) => get<ContractTemplate>(`/contracts/templates/${name}`),
  compile: (source: string, contractName: string) =>
    post<CompileResult>('/contracts/compile', { source, contractName }),
  deploy: (opts: {
    bytecode: string;
    abi: unknown[];
    args?: unknown[];
    chain?: 'core' | 'evm';
    accountIndex?: number;
  }) => post<DeployResult>('/contracts/deploy', opts),
};

/* ─── mining ────────────────────────────────────────────────────────── */
export interface MiningStatus {
  enabled: boolean;
  blockTime?: number;
  latestEpoch: number;
}

export const miningApi = {
  status: () => get<MiningStatus>('/mining/status'),
  mine: (blocks?: number) => post<{ mined: number }>('/mining/mine', { blocks }),
  start: (intervalMs?: number) => post<{ success: boolean }>('/mining/start', { intervalMs }),
  stop: () => post<{ success: boolean }>('/mining/stop'),
};

/* ─── network ────────────────────────────────────────────────────────── */
export interface NetworkConfig {
  coreRpcPort: number;
  evmRpcPort: number;
  wsPort: number;
  chainId: number;
  evmChainId: number;
}

export interface RpcUrls {
  core: string;
  evm: string;
  ws: string;
}

export const networkApi = {
  config: () => get<NetworkConfig>('/network/config'),
  updateConfig: (config: Partial<NetworkConfig>) =>
    put<{ success: boolean }>('/network/config', config),
  rpcUrls: () => get<RpcUrls>('/network/rpc-urls'),
};

/* ─── keystore ────────────────────────────────────────────────────────── */
export interface KeystoreStatus {
  initialized: boolean;
  locked: boolean;
  encryptionEnabled: boolean;
  activeId?: string;
}

export interface WalletEntry {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: number;
}

export const keystoreApi = {
  status: () => get<KeystoreStatus>('/keystore/status'),
  generate: () => post<{ mnemonic: string }>('/keystore/generate'),
  setup: (opts: { mnemonic: string; label?: string; password?: string }) =>
    post<{ success: boolean }>('/keystore/setup', opts),
  unlock: (password: string) => post<{ success: boolean }>('/keystore/unlock', { password }),
  lock: () => post<{ success: boolean }>('/keystore/lock'),
  wallets: () => get<WalletEntry[]>('/keystore/wallets'),
  addWallet: (mnemonic: string, label?: string) =>
    post<WalletEntry>('/keystore/wallets', { mnemonic, label }),
  activateWallet: (id: string) =>
    post<{ success: boolean }>(`/keystore/wallets/${id}/activate`),
  deleteWallet: (id: string) => del<{ success: boolean }>(`/keystore/wallets/${id}`),
};
