/**
 * Escrow Contract Template
 *
 * A three-party escrow: depositor locks funds, arbiter can release to
 * beneficiary or refund to depositor. Teaches: payable, msg.value, address.transfer.
 *
 * Constructor: `constructor(address arbiter, address beneficiary)`
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const ESCROW_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Escrow
 * @notice A three-party escrow contract. The depositor locks ETH/CFX, the
 *         arbiter decides to release funds to the beneficiary or refund the
 *         depositor. Teaches: payable functions, value transfers, state machines.
 */
contract Escrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }

    address public depositor;
    address public beneficiary;
    address public arbiter;
    uint256 public amount;
    State   public state;

    event Deposited(address indexed depositor, uint256 amount);
    event Released(address indexed beneficiary, uint256 amount);
    event Refunded(address indexed depositor, uint256 amount);

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Escrow: not the arbiter");
        _;
    }

    modifier inState(State expected) {
        require(state == expected, "Escrow: invalid state");
        _;
    }

    /// @param _arbiter   Trusted third party who can release or refund
    /// @param _beneficiary Address that will receive funds on approval
    constructor(address _arbiter, address _beneficiary) {
        require(_arbiter != address(0) && _beneficiary != address(0), "Escrow: zero address");
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = msg.sender;
        state = State.AWAITING_PAYMENT;
    }

    /// @notice Deposit funds into escrow. Must be called by the depositor.
    function deposit() external payable inState(State.AWAITING_PAYMENT) {
        require(msg.sender == depositor, "Escrow: only depositor can fund");
        require(msg.value > 0, "Escrow: must send CFX");
        amount = msg.value;
        state = State.AWAITING_DELIVERY;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Release funds to the beneficiary (arbiter only).
    function release() external onlyArbiter inState(State.AWAITING_DELIVERY) {
        state = State.COMPLETE;
        uint256 bal = address(this).balance;
        payable(beneficiary).transfer(bal);
        emit Released(beneficiary, bal);
    }

    /// @notice Refund depositor (arbiter only).
    function refund() external onlyArbiter inState(State.AWAITING_DELIVERY) {
        state = State.REFUNDED;
        uint256 bal = address(this).balance;
        payable(depositor).transfer(bal);
        emit Refunded(depositor, bal);
    }

    /// @notice Returns the current balance held in escrow.
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Human-readable state name.
    function stateName() external view returns (string memory) {
        if (state == State.AWAITING_PAYMENT)  return "AWAITING_PAYMENT";
        if (state == State.AWAITING_DELIVERY) return "AWAITING_DELIVERY";
        if (state == State.COMPLETE)          return "COMPLETE";
        return "REFUNDED";
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getEscrowContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'Escrow',
      source: ESCROW_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Escrow compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
