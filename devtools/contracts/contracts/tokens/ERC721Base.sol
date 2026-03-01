// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ERC721Base
 * @notice Production-grade ERC-721 NFT with enumeration, per-token URI
 *         storage, on-chain royalties (EIP-2981), pausable transfers, and
 *         role-based access control.
 *
 * Roles:
 *  - DEFAULT_ADMIN_ROLE — grants/revokes all roles; sets royalty receiver.
 *  - MINTER_ROLE        — may call `safeMint`.
 *  - PAUSER_ROLE        — may call `pause` / `unpause`.
 *
 * Security properties:
 *  - Hard supply cap: minting reverts once `maxSupply` is reached.
 *    Set `maxSupply` to `type(uint256).max` for an effectively unlimited collection.
 *  - Transfers blocked while paused; burn is also blocked while paused.
 *  - Royalty numerator is capped to 10 000 (100 %) by ERC2981; recommended
 *    maximum is 1 000 (10 %).
 */
contract ERC721Base is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    ERC721Pausable,
    ERC2981,
    AccessControl
{
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public immutable maxSupply;

    // Internal counter — not using OZ Counters (deprecated in OZ 5).
    uint256 private _nextTokenId;

    /**
     * @param name_             Collection name.
     * @param symbol_           Collection symbol.
     * @param maxSupply_        Hard cap on total supply.
     * @param royaltyReceiver   Address that receives ERC-2981 royalties.
     * @param royaltyFeeNumer   Royalty fee in basis points (e.g. 500 = 5 %).
     * @param admin             Address that receives all admin roles.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        address royaltyReceiver,
        uint96 royaltyFeeNumer,
        address admin
    ) ERC721(name_, symbol_) {
        require(admin != address(0), "ERC721Base: admin is zero address");
        require(maxSupply_ > 0, "ERC721Base: maxSupply must be > 0");

        maxSupply = maxSupply_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        if (royaltyReceiver != address(0)) {
            _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumer);
        }
    }

    // ─── Minting ─────────────────────────────────────────────────────────────

    /**
     * @notice Mint a new token with `uri_` as its on-chain token URI.
     * @dev Uses `safeMint` — reverts if `to` is a contract that does not
     *      implement IERC721Receiver.
     */
    function safeMint(
        address to,
        string calldata uri_
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        require(
            totalSupply() < maxSupply,
            "ERC721Base: max supply reached"
        );
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri_);
    }

    // ─── Royalty management ───────────────────────────────────────────────────

    /**
     * @notice Update the global default royalty (applies to all tokens without
     *         a per-token override).
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @notice Set a per-token royalty override.
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    // ─── Pausable controls ────────────────────────────────────────────────────

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ─── OZ 5.x multiple-inheritance override resolution ─────────────────────

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
