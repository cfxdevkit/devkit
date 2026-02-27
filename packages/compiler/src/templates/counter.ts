/**
 * Counter Contract Template
 *
 * A simple on-chain counter demonstrating state mutation, modifiers, and events.
 * Perfect as a first contract — no constructor arguments needed.
 *
 * Constructor: none (counter starts at 0, owner = deployer)
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const COUNTER_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Counter
 * @notice A simple counter contract — great first contract to understand
 *         state variables, modifiers, events, and ownership.
 */
contract Counter {
    uint256 public count;
    address public owner;
    uint256 public step;

    event CountChanged(uint256 indexed previous, uint256 indexed current, address indexed by);
    event StepChanged(uint256 newStep);

    modifier onlyOwner() {
        require(msg.sender == owner, "Counter: not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        step = 1;
    }

    /// @notice Increment the counter by \`step\`.
    function increment() external {
        uint256 prev = count;
        count += step;
        emit CountChanged(prev, count, msg.sender);
    }

    /// @notice Decrement the counter by \`step\` (reverts on underflow).
    function decrement() external {
        require(count >= step, "Counter: underflow");
        uint256 prev = count;
        count -= step;
        emit CountChanged(prev, count, msg.sender);
    }

    /// @notice Reset the counter to zero (owner only).
    function reset() external onlyOwner {
        uint256 prev = count;
        count = 0;
        emit CountChanged(prev, 0, msg.sender);
    }

    /// @notice Change the increment/decrement step (owner only).
    function setStep(uint256 newStep) external onlyOwner {
        require(newStep > 0, "Counter: step must be > 0");
        step = newStep;
        emit StepChanged(newStep);
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getCounterContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'Counter',
      source: COUNTER_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Counter compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
