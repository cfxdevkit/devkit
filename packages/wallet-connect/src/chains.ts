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

/**
 * Conflux chain definitions for use with wagmi.
 *
 * This file has zero browser-API dependencies and is safe to import in both
 * server and client environments (Next.js Server Components, Edge runtime, etc.)
 *
 * Chain ID reference:
 *   eSpace Mainnet   1030  |  Core Mainnet   1029
 *   eSpace Testnet     71  |  Core Testnet   1001
 *   eSpace Local    2030   |  Core Local     2029
 */

// ── Conflux Core ──────────────────────────────────────────────────────────────

export const confluxCore = {
  id: 1029,
  name: 'Conflux Core',
  network: 'conflux-core',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://main.confluxrpc.com'] },
    public: { http: ['https://main.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://confluxscan.io' },
  },
} as const;

export const confluxCoreTestnet = {
  id: 1001,
  name: 'Conflux Core Testnet',
  network: 'conflux-core-testnet',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://test.confluxrpc.com'] },
    public: { http: ['https://test.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://testnet.confluxscan.io' },
  },
} as const;

export const confluxLocalCore = {
  id: 2029,
  name: 'Conflux Local Core',
  network: 'conflux-local-core',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['http://localhost:12537'] },
    public: { http: ['http://localhost:12537'] },
  },
} as const;

// ── Conflux eSpace ────────────────────────────────────────────────────────────

export const confluxESpace = {
  id: 1030,
  name: 'Conflux eSpace',
  network: 'conflux-espace',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://evm.confluxrpc.com'] },
    public: { http: ['https://evm.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://evm.confluxscan.io' },
  },
} as const;

export const confluxESpaceTestnet = {
  id: 71,
  name: 'Conflux eSpace Testnet',
  network: 'conflux-espace-testnet',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['https://evmtestnet.confluxrpc.com'] },
    public: { http: ['https://evmtestnet.confluxrpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan',
      url: 'https://evmtestnet.confluxscan.io',
    },
  },
} as const;

export const confluxLocalESpace = {
  id: 2030,
  name: 'Conflux Local eSpace',
  network: 'conflux-local-espace',
  nativeCurrency: { decimals: 18, name: 'CFX', symbol: 'CFX' },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
} as const;

// ── Default chain list for CAS ────────────────────────────────────────────────
// eSpace chains only (EVM-compatible — supported by MetaMask, ConnectKit, etc.)
// Re-exported for use in both wagmi.ts (client) and server.ts (server).
export {
  mainnet,
  sepolia,
} from 'wagmi/chains';
