/**
 * TestToken Contract Template
 *
 * A minimal ERC20-compatible token for testing transfers, approvals, and
 * allowances in a dev environment.  Includes `mint` and `burn` for faucet
 * use-cases.
 *
 * Constructor: `constructor(string name, string symbol, uint256 initialSupply)`
 * where `initialSupply` is expressed in whole tokens (scaled to 18 decimals
 * internally).
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

/** Solidity source for TestToken */
export const TEST_TOKEN_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10 ** decimals;
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "TestToken: transfer to zero address");
        require(balances[msg.sender] >= amount, "TestToken: insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "TestToken: approve to zero address");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "TestToken: transfer from zero address");
        require(to != address(0), "TestToken: transfer to zero address");
        require(balances[from] >= amount, "TestToken: insufficient balance");
        require(allowances[from][msg.sender] >= amount, "TestToken: insufficient allowance");
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) public {
        require(to != address(0), "TestToken: mint to zero address");
        totalSupply += amount;
        balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(balances[msg.sender] >= amount, "TestToken: burn amount exceeds balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}`;

let _compiled: CompilationOutput | null = null;

/**
 * Get the compiled TestToken contract artefact.
 *
 * The result is memoised: compilation only runs once per process.
 *
 * @throws Error if solc compilation fails
 *
 * @example
 * ```typescript
 * const { bytecode, abi } = getTestTokenContract();
 * // Deploy with (name, symbol, initialSupply) constructor args
 * ```
 */
export function getTestTokenContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'TestToken',
      source: TEST_TOKEN_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Failed to compile TestToken:\n${result.errors.map((e) => e.message).join('\n')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
