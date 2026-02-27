/**
 * Registry Contract Template
 *
 * A simple on-chain name→address registry where any account can register a
 * unique name. Teaches: require/revert for uniqueness checks, string→bytes32
 * hashing, and mapping patterns.
 *
 * Constructor: none
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const REGISTRY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Registry
 * @notice A name-service-style registry. Any account can register a unique
 *         human-readable name and point it to an address (or any string of
 *         metadata). Teaches: keccak256 hashing, mapping lookups, require.
 */
contract Registry {
    struct Record {
        address owner;
        string  value;      // arbitrary value, e.g. an address string or URL
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(bytes32 => Record) private _records;   // keccak256(name) → Record
    mapping(address => string[]) private _ownedNames;

    event NameRegistered(string indexed name, address indexed owner, string value);
    event NameUpdated(string indexed name, address indexed owner, string newValue);
    event NameReleased(string indexed name, address indexed owner);

    modifier onlyNameOwner(string calldata name) {
        require(_records[_key(name)].owner == msg.sender, "Registry: not the name owner");
        _;
    }

    /// @notice Register \`name\` pointing to \`value\`.  Name must not already be taken.
    function register(string calldata name, string calldata value) external {
        require(bytes(name).length > 0, "Registry: empty name");
        bytes32 key = _key(name);
        require(_records[key].owner == address(0), "Registry: name already taken");
        _records[key] = Record({
            owner: msg.sender,
            value: value,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        _ownedNames[msg.sender].push(name);
        emit NameRegistered(name, msg.sender, value);
    }

    /// @notice Update the value stored under a name you own.
    function update(string calldata name, string calldata newValue)
        external onlyNameOwner(name)
    {
        bytes32 key = _key(name);
        _records[key].value = newValue;
        _records[key].updatedAt = block.timestamp;
        emit NameUpdated(name, msg.sender, newValue);
    }

    /// @notice Release a name you own, making it available for re-registration.
    function release(string calldata name) external onlyNameOwner(name) {
        bytes32 key = _key(name);
        emit NameReleased(name, msg.sender);
        delete _records[key];
    }

    /// @notice Resolve a name to its stored value.
    function resolve(string calldata name) external view returns (string memory) {
        return _records[_key(name)].value;
    }

    /// @notice Return the full record for a name.
    function lookup(string calldata name)
        external view
        returns (address nameOwner, string memory value, uint256 createdAt, uint256 updatedAt)
    {
        Record storage r = _records[_key(name)];
        return (r.owner, r.value, r.createdAt, r.updatedAt);
    }

    /// @notice Check whether a name is available (not yet registered).
    function isAvailable(string calldata name) external view returns (bool) {
        return _records[_key(name)].owner == address(0);
    }

    /// @notice Return all names registered by \`account\`.
    function namesOf(address account) external view returns (string[] memory) {
        return _ownedNames[account];
    }

    function _key(string calldata name) private pure returns (bytes32) {
        return keccak256(bytes(name));
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getRegistryContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'Registry',
      source: REGISTRY_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Registry compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
