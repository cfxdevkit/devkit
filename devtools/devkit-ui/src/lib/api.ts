/**
 * Typed fetch helpers for all devkit API endpoints.
 *
 * In development, set NEXT_PUBLIC_API_URL=http://localhost:7748 so the UI
 * (running on a different port via `next dev`) can reach the Express backend.
 * In production the UI is served by Express itself so the empty default works.
 */

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api`;

async function request<T>(
  method: string,
  path: string,
  body?: unknown
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
const del = <T>(path: string) => request<T>('DELETE', path);
const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, body);
const patch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);

/* ─── node ────────────────────────────────────────────────────────── */
export interface NodeStatus {
  server: 'running' | 'stopped' | 'starting' | 'stopping';
  epochNumber?: number;
  mining?: { isRunning: boolean; interval?: number; blocksMined?: number };
  accounts?: number;
  rpcUrls?: {
    core: string;
    evm: string;
    coreWs: string;
    evmWs: string;
    ws: string;
  };
}

export const nodeApi = {
  status: () => get<NodeStatus>('/node/status'),
  start: () => post<NodeStatus>('/node/start'),
  stop: () => post<{ success: boolean }>('/node/stop'),
  restart: () => post<NodeStatus>('/node/restart'),
  restartWipe: () => post<NodeStatus>('/node/restart-wipe'),
  wipe: () => post<{ ok: boolean; server: string }>('/node/wipe'),
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
  description?: string;
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
  id: string;
}

export interface StoredContract {
  id: string;
  name: string;
  address: string;
  chain: 'evm' | 'core';
  chainId: number;
  txHash: string;
  deployer: string;
  deployedAt: string;
  abi: unknown[];
  constructorArgs: unknown[];
}

export interface CallResult {
  success: boolean;
  result?: unknown; // read call return value
  txHash?: string; // write call tx hash
  blockNumber?: string; // block/epoch mined in
  status?: string; // 'success' | 'reverted'
}

export const contractsApi = {
  templates: () => get<ContractTemplate[]>('/contracts/templates'),
  template: (name: string) =>
    get<ContractTemplate>(`/contracts/templates/${name}`),
  compile: (source: string, contractName: string) =>
    post<CompileResult>('/contracts/compile', { source, contractName }),
  deploy: (opts: {
    bytecode: string;
    abi: unknown[];
    args?: unknown[];
    chain?: 'core' | 'evm';
    accountIndex?: number;
    contractName?: string;
  }) => post<DeployResult>('/contracts/deploy', opts),
  deployed: (chain?: 'evm' | 'core') =>
    get<StoredContract[]>(
      `/contracts/deployed${chain ? `?chain=${chain}` : ''}`
    ),
  deleteDeployed: (id: string) =>
    del<{ ok: boolean }>(`/contracts/deployed/${id}`),
  call: (
    id: string,
    functionName: string,
    args: unknown[],
    accountIndex?: number
  ) =>
    post<CallResult>(`/contracts/${id}/call`, {
      functionName,
      args,
      accountIndex,
    }),
};

/* ─── mining ────────────────────────────────────────────────────────── */
export interface MiningStatus {
  isRunning: boolean;
  interval?: number; // auto-mine block interval in ms
  blocksMined?: number;
}

export const miningApi = {
  status: () => get<MiningStatus>('/mining/status'),
  mine: (blocks?: number) =>
    post<{ mined: number }>('/mining/mine', { blocks }),
  start: (intervalMs?: number) =>
    post<{ success: boolean }>('/mining/start', { intervalMs }),
  stop: () => post<{ success: boolean }>('/mining/stop'),
};

/* ─── network ────────────────────────────────────────────────────────── */
export interface NetworkConfig {
  coreRpcPort: number;
  evmRpcPort: number;
  wsPort: number; // Core Space WebSocket port
  evmWsPort: number; // eSpace WebSocket port
  chainId: number;
  evmChainId: number;
}

export interface RpcUrls {
  core: string;
  evm: string;
  coreWs: string; // Core Space WebSocket
  evmWs: string; // eSpace WebSocket
  ws: string; // alias for coreWs (backward compat)
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
  unlock: (password: string) =>
    post<{ success: boolean }>('/keystore/unlock', { password }),
  lock: () => post<{ success: boolean }>('/keystore/lock'),
  wallets: () => get<WalletEntry[]>('/keystore/wallets'),
  addWallet: (mnemonic: string, label?: string) =>
    post<WalletEntry>('/keystore/wallets', { mnemonic, label }),
  activateWallet: (id: string) =>
    post<{ success: boolean }>(`/keystore/wallets/${id}/activate`),
  renameWallet: (id: string, label: string) =>
    patch<{ success: boolean }>(`/keystore/wallets/${id}`, { label }),
  deleteWallet: (id: string) =>
    del<{ success: boolean }>(`/keystore/wallets/${id}`),
};

export interface ServerSettings {
  host: string;
  port: number;
  isPublic: boolean;
  authEnabled: boolean;
  corsOrigins: string | string[];
  rateLimit: { windowMs: number; maxRequests: number };
}

export const settingsApi = {
  get: () => get<ServerSettings>('/settings'),
};
