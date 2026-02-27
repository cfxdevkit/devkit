/**
 * SimpleStorage Contract Template
 *
 * A simple contract for storing and retrieving an integer value.
 * Useful for testing deployment and basic contract interaction.
 *
 * Constructor: `constructor(uint256 initialValue)`
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

/** Solidity source for SimpleStorage */
export const SIMPLE_STORAGE_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;

    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue, address indexed changedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "SimpleStorage: caller is not the owner");
        _;
    }

    constructor(uint256 initialValue) {
        storedValue = initialValue;
        owner = msg.sender;
        emit ValueChanged(0, initialValue, msg.sender);
    }

    function set(uint256 newValue) public {
        uint256 oldValue = storedValue;
        storedValue = newValue;
        emit ValueChanged(oldValue, newValue, msg.sender);
    }

    function get() public view returns (uint256) {
        return storedValue;
    }

    function increment() public {
        uint256 oldValue = storedValue;
        storedValue += 1;
        emit ValueChanged(oldValue, storedValue, msg.sender);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "SimpleStorage: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}`;

// Lazily populated on first call — avoids compile cost at module load time.
let _compiled: CompilationOutput | null = null;

/**
 * Get the compiled SimpleStorage contract artefact.
 *
 * The result is memoised: compilation only runs once per process.
 *
 * @throws Error if solc compilation fails
 *
 * @example
 * ```typescript
 * const { bytecode, abi } = getSimpleStorageContract();
 * // Deploy with a `uint256 initialValue` constructor argument
 * ```
 */
export function getSimpleStorageContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'SimpleStorage',
      source: SIMPLE_STORAGE_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Failed to compile SimpleStorage:\n${result.errors.map((e) => e.message).join('\n')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
