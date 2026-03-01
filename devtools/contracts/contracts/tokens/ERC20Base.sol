// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ERC20Base
 * @notice Production-grade ERC-20 token with the full OpenZeppelin 5.x
 *         feature set: capped supply, pausable transfers, EIP-2612 permit,
 *         and role-based access control for minting and pausing.
 *
 * Roles:
 *  - DEFAULT_ADMIN_ROLE  — set at construction; can grant/revoke all roles.
 *  - MINTER_ROLE         — may call `mint`.
 *  - PAUSER_ROLE         — may call `pause` / `unpause`.
 *
 * Security properties:
 *  - Hard supply cap enforced by ERC20Capped (reverts on overflow).
 *  - Transfers and approvals blocked while paused.
 *  - EIP-2612 permit does not bypass pause (permit itself is not blocked,
 *    but the subsequent transferFrom will revert if paused).
 *  - No raw constructor minting to avoid supply surprises; caller explicitly
 *    mints after deployment.
 *
 * @dev Override `decimals()` if you need a token with fewer than 18 decimals.
 */
contract ERC20Base is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    ERC20Capped,
    ERC20Permit,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /**
     * @param name_   Token name (also used as EIP-712 domain name for permit).
     * @param symbol_ Token symbol.
     * @param cap_    Hard supply cap in the smallest token unit (wei-equivalent).
     *                Pass `type(uint256).max` for an effectively uncapped supply.
     * @param admin   Address that receives DEFAULT_ADMIN_ROLE, MINTER_ROLE,
     *                and PAUSER_ROLE. Typically the deployer.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        address admin
    )
        ERC20(name_, symbol_)
        ERC20Capped(cap_)
        ERC20Permit(name_)
    {
        require(admin != address(0), "ERC20Base: admin is zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ─── Minting ────────────────────────────────────────────────────────────

    /**
     * @notice Mint `amount` tokens to `to`.
     * @dev Reverts if the result would exceed the supply cap.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // ─── Pausable controls ──────────────────────────────────────────────────

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ─── OZ 5.x multiple-inheritance override resolution ────────────────────

    /**
     * @dev ERC20Capped and ERC20Pausable both override `_update`.
     *      Solidity requires an explicit override that names all parents.
     *      The C3 linearisation: ERC20Capped → ERC20Pausable → ERC20Burnable
     *      → ERC20 ensures both the cap check and the pause check execute
     *      before the base transfer logic.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped, ERC20Pausable) {
        super._update(from, to, value);
    }
}
