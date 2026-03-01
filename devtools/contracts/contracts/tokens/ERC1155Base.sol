// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ERC1155Base
 * @notice Production-grade ERC-1155 multi-token contract with supply
 *         tracking, pausable transfers, on-chain royalties (EIP-2981),
 *         and role-based access control.
 *
 * Roles:
 *  - DEFAULT_ADMIN_ROLE — grants/revokes roles; updates base URI; sets royalty.
 *  - MINTER_ROLE        — may call `mint` and `mintBatch`.
 *  - PAUSER_ROLE        — may call `pause` / `unpause`.
 *
 * Security properties:
 *  - Per-token mint cap (0 = unlimited): reverts if `maxSupply[id]` is set and
 *    would be exceeded, preventing accidental over-issuance.
 *  - Transfers and burns are blocked while paused.
 *  - Batch mint limited to 100 ids per call to prevent gas-limit DoS.
 */
contract ERC1155Base is
    ERC1155,
    ERC1155Burnable,
    ERC1155Pausable,
    ERC1155Supply,
    ERC2981,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Per-token hard supply cap.  0 means uncapped.
    mapping(uint256 => uint256) public maxSupply;

    string public name;
    string public symbol;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory uri_,
        address admin
    ) ERC1155(uri_) {
        require(admin != address(0), "ERC1155Base: admin is zero address");
        name   = name_;
        symbol = symbol_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ─── URI management ───────────────────────────────────────────────────────

    function setURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newUri);
    }

    // ─── Supply caps ──────────────────────────────────────────────────────────

    /**
     * @notice Set a hard supply cap for `id`.  Can only be lowered down to the
     *         current total supply; can be raised freely.
     */
    function setMaxSupply(
        uint256 id,
        uint256 cap
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            cap == 0 || cap >= totalSupply(id),
            "ERC1155Base: cap below current supply"
        );
        maxSupply[id] = cap;
    }

    // ─── Minting ──────────────────────────────────────────────────────────────

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyRole(MINTER_ROLE) {
        _checkCap(id, amount);
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyRole(MINTER_ROLE) {
        require(ids.length <= 100, "ERC1155Base: batch too large");
        for (uint256 i = 0; i < ids.length; i++) {
            _checkCap(ids[i], amounts[i]);
        }
        _mintBatch(to, ids, amounts, data);
    }

    function _checkCap(uint256 id, uint256 amount) internal view {
        uint256 cap = maxSupply[id];
        if (cap != 0) {
            require(
                totalSupply(id) + amount <= cap,
                "ERC1155Base: max supply reached"
            );
        }
    }

    // ─── Pausable ─────────────────────────────────────────────────────────────

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }

    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Royalties ────────────────────────────────────────────────────────────

    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    // ─── OZ 5.x override resolution ──────────────────────────────────────────

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC2981, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
