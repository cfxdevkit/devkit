/**
 * Pre-compiled Solidity contract templates.
 *
 * Each template provides:
 * - The raw Solidity source as a string constant (`*_SOURCE`)
 * - A function that returns the compiled artefact on first call (`get*Contract()`)
 *
 * Compiled artefacts are memoised — compilation runs at most once per process.
 *
 * @example
 * ```typescript
 * import { getSimpleStorageContract, TEST_CONTRACTS } from '@cfxdevkit/compiler/templates';
 *
 * const { bytecode, abi } = getSimpleStorageContract();
 *
 * // Enumerate all available templates
 * for (const [name, template] of Object.entries(TEST_CONTRACTS)) {
 *   console.log(name, template.description);
 * }
 * ```
 */

import { COUNTER_SOURCE, getCounterContract } from './counter.js';
import { ERC721_SOURCE, getERC721Contract } from './erc721.js';
import { ESCROW_SOURCE, getEscrowContract } from './escrow.js';
import { getMultiSigContract, MULTISIG_SOURCE } from './multisig.js';
import { getRegistryContract, REGISTRY_SOURCE } from './registry.js';
import {
  getSimpleStorageContract,
  SIMPLE_STORAGE_SOURCE,
} from './simple-storage.js';
import { getTestTokenContract, TEST_TOKEN_SOURCE } from './test-token.js';
import { getVotingContract, VOTING_SOURCE } from './voting.js';

export { COUNTER_SOURCE, getCounterContract } from './counter.js';
export { ERC721_SOURCE, getERC721Contract } from './erc721.js';
export { ESCROW_SOURCE, getEscrowContract } from './escrow.js';
export { getMultiSigContract, MULTISIG_SOURCE } from './multisig.js';
export { getRegistryContract, REGISTRY_SOURCE } from './registry.js';
export {
  getSimpleStorageContract,
  SIMPLE_STORAGE_SOURCE,
} from './simple-storage.js';
export { getTestTokenContract, TEST_TOKEN_SOURCE } from './test-token.js';
export { getVotingContract, VOTING_SOURCE } from './voting.js';

/**
 * Registry of all bundled test contracts.
 *
 * Keys are the contract names that appear in the ABI.
 */
export const TEST_CONTRACTS = {
  SimpleStorage: {
    name: 'SimpleStorage',
    description:
      'Simple value-storage contract — useful for deployment smoke tests',
    source: SIMPLE_STORAGE_SOURCE,
    getCompiled: getSimpleStorageContract,
  },
  TestToken: {
    name: 'TestToken',
    description:
      'Minimal ERC20-compatible token with mint/burn — useful for DEX and approval tests',
    source: TEST_TOKEN_SOURCE,
    getCompiled: getTestTokenContract,
  },
  Counter: {
    name: 'Counter',
    description:
      'Ownable step counter with increment/decrement/reset — ideal first contract',
    source: COUNTER_SOURCE,
    getCompiled: getCounterContract,
  },
  BasicNFT: {
    name: 'BasicNFT',
    description:
      'ERC-721 NFT from scratch — teaches token ownership, approvals, transfer',
    source: ERC721_SOURCE,
    getCompiled: getERC721Contract,
  },
  Voting: {
    name: 'Voting',
    description:
      'Ballot contract with delegation — teaches structs, weighted votes, governance',
    source: VOTING_SOURCE,
    getCompiled: getVotingContract,
  },
  Escrow: {
    name: 'Escrow',
    description:
      'Three-party escrow with arbiter — teaches payable, state machines, CFX transfers',
    source: ESCROW_SOURCE,
    getCompiled: getEscrowContract,
  },
  MultiSigWallet: {
    name: 'MultiSigWallet',
    description:
      'M-of-N multi-signature wallet — teaches collective governance and low-level call',
    source: MULTISIG_SOURCE,
    getCompiled: getMultiSigContract,
  },
  Registry: {
    name: 'Registry',
    description:
      'On-chain name registry — teaches keccak256 keys, mappings, and string storage',
    source: REGISTRY_SOURCE,
    getCompiled: getRegistryContract,
  },
} as const;

export type TestContractName = keyof typeof TEST_CONTRACTS;
