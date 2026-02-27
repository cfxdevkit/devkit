/**
 * MultiSig Wallet Contract Template
 *
 * An M-of-N multi-signature wallet: N owners are set at deployment; any owner
 * can submit a transaction; once M owners confirm, anyone can execute it.
 * Teaches: arrays, structs, require-threshold patterns, call{value}.
 *
 * Constructor: `constructor(address[] owners, uint256 required)`
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const MULTISIG_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @notice M-of-N multisig wallet. Teaches: dynamic arrays, structs, the
 *         low-level call pattern, and collaborative governance primitives.
 */
contract MultiSigWallet {
    struct Transaction {
        address to;
        uint256 value;
        bytes   data;
        bool    executed;
        uint256 confirmCount;
    }

    address[] public owners;
    uint256   public required;
    mapping(address => bool) public isOwner;
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmed;

    event Deposit(address indexed sender, uint256 amount);
    event TransactionSubmitted(uint256 indexed txId, address indexed to, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event ConfirmationRevoked(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "MultiSig: not an owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "MultiSig: tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "MultiSig: already executed");
        _;
    }

    modifier notConfirmed(uint256 txId) {
        require(!confirmed[txId][msg.sender], "MultiSig: already confirmed");
        _;
    }

    /// @param _owners   List of owner addresses (no duplicates, no zero address)
    /// @param _required Number of confirmations needed to execute a transaction
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "MultiSig: need at least one owner");
        require(_required > 0 && _required <= _owners.length, "MultiSig: invalid required count");

        for (uint256 i = 0; i < _owners.length; i++) {
            address o = _owners[i];
            require(o != address(0), "MultiSig: zero address owner");
            require(!isOwner[o], "MultiSig: duplicate owner");
            isOwner[o] = true;
            owners.push(o);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Submit a new transaction for confirmation.
    function submitTransaction(address to, uint256 value, bytes calldata data)
        external onlyOwner returns (uint256 txId)
    {
        txId = transactions.length;
        transactions.push(Transaction({ to: to, value: value, data: data, executed: false, confirmCount: 0 }));
        emit TransactionSubmitted(txId, to, value);
    }

    /// @notice Confirm a pending transaction.
    function confirmTransaction(uint256 txId)
        external onlyOwner txExists(txId) notExecuted(txId) notConfirmed(txId)
    {
        confirmed[txId][msg.sender] = true;
        transactions[txId].confirmCount++;
        emit TransactionConfirmed(txId, msg.sender);
    }

    /// @notice Revoke your confirmation for a pending transaction.
    function revokeConfirmation(uint256 txId)
        external onlyOwner txExists(txId) notExecuted(txId)
    {
        require(confirmed[txId][msg.sender], "MultiSig: not confirmed");
        confirmed[txId][msg.sender] = false;
        transactions[txId].confirmCount--;
        emit ConfirmationRevoked(txId, msg.sender);
    }

    /// @notice Execute a transaction once it has enough confirmations.
    function executeTransaction(uint256 txId)
        external onlyOwner txExists(txId) notExecuted(txId)
    {
        Transaction storage txn = transactions[txId];
        require(txn.confirmCount >= required, "MultiSig: not enough confirmations");
        txn.executed = true;
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "MultiSig: execution failed");
        emit TransactionExecuted(txId);
    }

    /// @notice Contract's current CFX balance.
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Total number of submitted transactions.
    function transactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /// @notice List all owner addresses.
    function getOwners() external view returns (address[] memory) {
        return owners;
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getMultiSigContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'MultiSigWallet',
      source: MULTISIG_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `MultiSigWallet compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
