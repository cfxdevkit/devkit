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
 * Smoke tests that run the exact code shown in the docs Playground examples.
 * These run against the LOCAL build (not esm.sh) so we can determine:
 *   - PASS → the code is correct; the bug is in Sandpack/esm.sh bundling
 *   - FAIL → the bug is in the code itself or a transitive dep
 *
 * Tests are marked with the `network` pool configuration so vitest knows
 * they require real network access (Conflux eSpace testnet).
 */

import { describe, expect, it } from 'vitest';
import {
  deriveAccount,
  deriveAccounts,
  ERC20_ABI,
  EspaceClient,
  EVM_TESTNET,
  formatUnits,
  generateMnemonic,
  validateMnemonic,
} from '../index.js';

// ── Shared client ─────────────────────────────────────────────────────────────
const client = new EspaceClient({
  chainId: EVM_TESTNET.id,
  rpcUrl: EVM_TESTNET.rpcUrls.default.http[0],
});

// WCFX on testnet — always live
const WCFX = '0x2ED3dddae5B2F321AF0806181FBFA6D049Be47d8';
const HOLDER = '0x85d80245dc02f5A89589e1f19c5c718E405B56AA';

// ── Example: espace-block-number ─────────────────────────────────────────────
describe('playground: espace-block-number', () => {
  it('reads block number, chain id, gas price, and latest block header', async () => {
    const [connected, blockNumber, onChainId, gasPrice] = await Promise.all([
      client.isConnected(),
      client.getBlockNumber(),
      client.getChainId(),
      client.getGasPrice(),
    ]);

    console.log('Connected :', connected);
    console.log('Block #   :', blockNumber.toString());
    console.log('Chain ID  :', onChainId);
    console.log('Gas Price :', formatUnits(gasPrice, 9), 'Gwei');

    expect(connected).toBe(true);
    expect(typeof blockNumber).toBe('bigint');
    expect(blockNumber).toBeGreaterThan(0n);
    expect(onChainId).toBe(EVM_TESTNET.id);
    expect(typeof gasPrice).toBe('bigint');

    const block = await client.publicClient.getBlock({ blockTag: 'latest' });
    console.log('Hash      :', `${block.hash?.slice(0, 20) ?? 'n/a'}...`);
    console.log('Gas Used  :', block.gasUsed.toString());
    console.log(
      'Timestamp :',
      new Date(Number(block.timestamp) * 1000).toUTCString()
    );

    expect(block.gasUsed).toBeGreaterThanOrEqual(0n);
    expect(block.timestamp).toBeGreaterThan(0n);
  }, 30_000);
});

// ── Example: read-balance ─────────────────────────────────────────────────────
describe('playground: read-balance', () => {
  it('reads native CFX balance', async () => {
    const cfx = await client.getBalance(HOLDER);
    console.log('Balance:', Number(cfx).toFixed(6), 'CFX');
    expect(typeof cfx).toBe('string');
  }, 20_000);

  it('reads ERC-20 token balance via readContract', async () => {
    const [name, symbol, decimals, raw] = await Promise.all([
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [HOLDER],
      }),
    ]);

    console.log('Token   :', name, `(${symbol})`);
    console.log('Decimals:', decimals);
    console.log('Balance :', formatUnits(raw, decimals), symbol);

    expect(typeof name).toBe('string');
    expect(typeof symbol).toBe('string');
    expect(typeof decimals).toBe('number');
    expect(typeof raw).toBe('bigint');
    // formatUnits must not throw — this is where Math.pow BigInt error would surface
    expect(typeof formatUnits(raw, decimals)).toBe('string');
  }, 20_000);
});

// ── Example: erc20-info ───────────────────────────────────────────────────────
describe('playground: erc20-info', () => {
  it('reads all ERC-20 metadata and allowance without throwing', async () => {
    const SPENDER = '0x33e5E5B262e5d8eBC443E1c6c9F14215b020554d';

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      }),
    ]);

    console.log('Name         :', name);
    console.log('Symbol       :', symbol);
    console.log('Decimals     :', decimals);
    console.log('Total Supply :', formatUnits(totalSupply, decimals), symbol);

    const [balance, allowance] = await Promise.all([
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [HOLDER],
      }),
      client.publicClient.readContract({
        address: WCFX,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [HOLDER, SPENDER],
      }),
    ]);

    console.log('Balance  :', formatUnits(balance, decimals), symbol);
    console.log('Allowance:', formatUnits(allowance, decimals), symbol);

    expect(typeof totalSupply).toBe('bigint');
    expect(typeof balance).toBe('bigint');
    expect(typeof allowance).toBe('bigint');
    // formatUnits must not throw
    expect(formatUnits(totalSupply, decimals)).toMatch(/^\d/);
  }, 30_000);
});

// ── Example: send-cfx (HD wallet — no network needed) ────────────────────────
describe('playground: send-cfx (HD wallet)', () => {
  it('generates and validates mnemonics without throwing', () => {
    const mnemonic = generateMnemonic();
    const mnemonic24 = generateMnemonic(256);

    console.log('12-word:', mnemonic);
    console.log('24-word:', mnemonic24);

    const v = validateMnemonic(mnemonic);
    console.log('valid:', v.valid, 'words:', v.wordCount);

    const bad = validateMnemonic('this is not a valid bip39 phrase at all');
    console.log('bad valid:', bad.valid, 'words:', bad.wordCount);

    expect(v.valid).toBe(true);
    expect(v.wordCount).toBe(12);
    expect(bad.valid).toBe(false);
  });

  it('derives HD accounts for both eSpace and Core Space', () => {
    const mnemonic = generateMnemonic();
    const accounts = deriveAccounts(mnemonic, { count: 3 });

    console.log('-- Derived Accounts (first 3) --');
    for (const a of accounts) {
      console.log(`[${a.index}] eSpace : ${a.evmAddress}`);
      console.log(`     Core   : ${a.coreAddress}`);
    }

    expect(accounts).toHaveLength(3);
    expect(accounts[0].evmAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    // Core Space addresses use base32 encoding; prefix varies by chain ID
    // (cfx: mainnet, cfxtest: testnet, net<id>: other)
    expect(accounts[0].coreAddress).toMatch(/^(cfx:|cfxtest:|net\d+:)/);

    const acc5 = deriveAccount(mnemonic, 5);
    console.log('Account #5 eSpace:', acc5.evmAddress);
    console.log('Account #5 Core  :', acc5.coreAddress);
    expect(acc5.index).toBe(5);
  });
});
