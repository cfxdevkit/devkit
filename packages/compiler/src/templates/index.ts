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

import {
  getSimpleStorageContract,
  SIMPLE_STORAGE_SOURCE,
} from './simple-storage.js';
import { getTestTokenContract, TEST_TOKEN_SOURCE } from './test-token.js';

export {
  getSimpleStorageContract,
  SIMPLE_STORAGE_SOURCE,
} from './simple-storage.js';

export { getTestTokenContract, TEST_TOKEN_SOURCE } from './test-token.js';

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
} as const;

export type TestContractName = keyof typeof TEST_CONTRACTS;
