// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WrappedCFX (WCFX)
 * @notice ERC-20 wrapper for native CFX on Conflux eSpace, functionally
 *         equivalent to WETH9 on Ethereum.
 *
 * Users deposit CFX → receive WCFX 1:1.
 * Users withdraw CFX → burn WCFX 1:1.
 *
 * WCFX integrates with any protocol that requires an ERC-20 interface for
 * the native asset (AMMs, lending markets, DEX aggregators, etc.).
 *
 * Security properties:
 *  - No admin, no owner, no upgradeability.  Contract is immutable.
 *  - Reentrancy safe: state updated before CFX transfer (checks-effects-interactions).
 *  - `transfer` and `transferFrom` revert on zero-address destinations.
 *  - `withdraw` reverts if the contract balance is somehow insufficient
 *    (should never happen under normal operation).
 *  - No `permit` to keep the contract minimal, matching WETH9 behaviour.
 *
 * @dev Emit events match the WETH9 standard so existing tooling (dApps,
 *      explorers) recognises WCFX deposits and withdrawals.
 */
contract WrappedCFX {
    string public constant name     = "Wrapped CFX";
    string public constant symbol   = "WCFX";
    uint8  public constant decimals = 18;

    event Approval(address indexed owner,  address indexed spender, uint256 value);
    event Transfer(address indexed from,   address indexed to,      uint256 value);
    event Deposit (address indexed dst,    uint256 wad);
    event Withdrawal(address indexed src,  uint256 wad);

    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ─── Deposit / Withdraw ───────────────────────────────────────────────────

    /// @notice Deposit CFX and receive an equal amount of WCFX.
    receive() external payable {
        deposit();
    }

    /// @notice Wrap `msg.value` CFX into WCFX and credit the caller.
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Unwrap `wad` WCFX into native CFX.
     * @param wad Amount in wei (10^18 = 1 CFX).
     */
    function withdraw(uint256 wad) external {
        require(balanceOf[msg.sender] >= wad, "WCFX: insufficient balance");
        // Effects before interaction (CEI pattern).
        balanceOf[msg.sender] -= wad;
        emit Withdrawal(msg.sender, wad);
        // slither-disable-next-line arbitrary-send-eth
        (bool ok, ) = payable(msg.sender).call{value: wad}("");
        require(ok, "WCFX: CFX transfer failed");
    }

    // ─── ERC-20 interface ─────────────────────────────────────────────────────

    /// @notice Total WCFX supply equals the contract's CFX balance.
    function totalSupply() external view returns (uint256) {
        return address(this).balance;
    }

    function approve(address spender, uint256 wad) external returns (bool) {
        allowance[msg.sender][spender] = wad;
        emit Approval(msg.sender, spender, wad);
        return true;
    }

    function transfer(address dst, uint256 wad) external returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) public returns (bool) {
        require(dst != address(0), "WCFX: transfer to zero address");
        require(balanceOf[src] >= wad, "WCFX: insufficient balance");

        if (src != msg.sender) {
            uint256 allowed = allowance[src][msg.sender];
            // max uint256 is the canonical "infinite approval" sentinel
            if (allowed != type(uint256).max) {
                require(allowed >= wad, "WCFX: insufficient allowance");
                allowance[src][msg.sender] = allowed - wad;
            }
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;
        emit Transfer(src, dst, wad);
        return true;
    }
}
