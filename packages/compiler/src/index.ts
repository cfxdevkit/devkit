/**
 * @cfxdevkit/compiler
 *
 * Runtime Solidity compiler and pre-built contract templates for Conflux DevKit.
 *
 * Uses solc-js to compile Solidity source code in the browser or Node.js,
 * targeting the 'paris' EVM version by default for full Conflux eSpace
 * compatibility (avoids the PUSH0 opcode which Conflux does not support).
 *
 * @example
 * ```typescript
 * import { compileSolidity, getSimpleStorageContract } from '@cfxdevkit/compiler';
 *
 * // Compile arbitrary Solidity source
 * const result = compileSolidity({
 *   contractName: 'Counter',
 *   source: `pragma solidity ^0.8.20; contract Counter { uint256 public count; function inc() public { count++; } }`,
 * });
 *
 * // Use a pre-built template
 * const { bytecode, abi } = getSimpleStorageContract();
 * ```
 */

export type {
  CompilationError,
  CompilationInput,
  CompilationOutput,
  CompilationResult,
} from './compiler/index.js';
// Compiler
export {
  compileMultipleSources,
  compileSolidity,
  getSolcVersion,
} from './compiler/index.js';
export type { TestContractName } from './templates/index.js';
// Templates
export {
  getSimpleStorageContract,
  getTestTokenContract,
  SIMPLE_STORAGE_SOURCE,
  TEST_CONTRACTS,
  TEST_TOKEN_SOURCE,
} from './templates/index.js';
