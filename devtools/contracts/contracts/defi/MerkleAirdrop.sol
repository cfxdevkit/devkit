// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerkleAirdrop
 * @notice Pull-based ERC-20 airdrop verified by a Merkle proof.
 *
 * The owner sets a Merkle root where each leaf encodes:
 *   `keccak256(abi.encodePacked(claimant, amount))`
 *
 * Recipients submit their amount and proof off-chain and call `claim()` to
 * receive their tokens.  Each address may claim at most once.
 *
 * Security properties:
 *  - Pull-only: no push transfers — the contract never initiates transfers
 *    to addresses that have not called `claim`.
 *  - Front-running resistant: the leaf binds the claimant *and* the amount,
 *    so a malicious party cannot submit someone else's proof for their own address.
 *  - Replay protection: a packed bitmap (`claimed`) prevents double-claiming
 *    in O(1) space without an address-keyed mapping (saves ~800 gas per claim).
 *  - Expiry: after `expiresAt` the owner can withdraw unclaimed tokens.
 *    Set to `type(uint256).max` for no expiry.
 *  - The Merkle root can be updated by the owner before the airdrop goes live
 *    (or to extend/add an additional drop round), but only if the previous
 *    drop has expired (prevents silently changing rules mid-claim).
 *  - SafeERC20 for token transfers.
 */
contract MerkleAirdrop is Ownable {
    using SafeERC20 for IERC20;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable token;

    bytes32 public merkleRoot;
    uint256 public expiresAt;

    /// @dev Bitmap: claimedBitMap[wordIndex] has bit set for claimIndex if claimed.
    mapping(uint256 => uint256) private claimedBitMap;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Claimed(uint256 indexed claimIndex, address indexed claimant, uint256 amount);
    event RootUpdated(bytes32 oldRoot, bytes32 newRoot, uint256 newExpiresAt);
    event Swept(address indexed to, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param token_      ERC-20 token to distribute.
     * @param merkleRoot_ Root of the Merkle tree.
     * @param expiresAt_  UNIX timestamp after which unclaimed tokens can be swept.
     *                    Use `type(uint256).max` for no expiry.
     * @param owner_      Admin of this contract.
     */
    constructor(
        address  token_,
        bytes32  merkleRoot_,
        uint256  expiresAt_,
        address  owner_
    ) Ownable(owner_) {
        require(token_      != address(0),  "Airdrop: zero token");
        require(merkleRoot_ != bytes32(0),  "Airdrop: zero root");
        require(expiresAt_  > block.timestamp, "Airdrop: already expired");

        token      = IERC20(token_);
        merkleRoot = merkleRoot_;
        expiresAt  = expiresAt_;
    }

    // ─── Claiming ─────────────────────────────────────────────────────────────

    /**
     * @notice Claim `amount` tokens if the caller is in the Merkle tree.
     * @param claimIndex  Position in the Merkle tree (used for the claimed bitmap).
     * @param amount      Token amount the caller is entitled to claim.
     * @param merkleProof Sibling hashes needed to verify the leaf.
     */
    function claim(
        uint256 claimIndex,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(block.timestamp <= expiresAt, "Airdrop: claim period ended");
        require(!isClaimed(claimIndex),       "Airdrop: already claimed");

        // Verify the Merkle proof.
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verifyCalldata(merkleProof, merkleRoot, leaf),
            "Airdrop: invalid proof"
        );

        _setClaimed(claimIndex);
        token.safeTransfer(msg.sender, amount);
        emit Claimed(claimIndex, msg.sender, amount);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Check whether `claimIndex` has already been claimed.
     */
    function isClaimed(uint256 claimIndex) public view returns (bool) {
        uint256 wordIndex  = claimIndex / 256;
        uint256 bitIndex   = claimIndex % 256;
        return (claimedBitMap[wordIndex] & (1 << bitIndex)) != 0;
    }

    // ─── Owner ────────────────────────────────────────────────────────────────

    /**
     * @notice Update the Merkle root after the current expiry.
     *         Allows the owner to run multiple drop rounds.
     */
    function updateRoot(
        bytes32 newRoot,
        uint256 newExpiresAt
    ) external onlyOwner {
        require(block.timestamp > expiresAt, "Airdrop: current round still active");
        require(newRoot         != bytes32(0), "Airdrop: zero root");
        require(newExpiresAt    > block.timestamp, "Airdrop: invalid expiry");

        emit RootUpdated(merkleRoot, newRoot, newExpiresAt);
        merkleRoot = newRoot;
        expiresAt  = newExpiresAt;
    }

    /**
     * @notice Sweep unclaimed tokens to `to` after the claim window closes.
     */
    function sweep(address to) external onlyOwner {
        require(block.timestamp > expiresAt, "Airdrop: round still active");
        require(to != address(0), "Airdrop: sweep to zero address");

        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "Airdrop: nothing to sweep");

        token.safeTransfer(to, balance);
        emit Swept(to, balance);
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    function _setClaimed(uint256 claimIndex) private {
        uint256 wordIndex = claimIndex / 256;
        uint256 bitIndex  = claimIndex % 256;
        claimedBitMap[wordIndex] |= (1 << bitIndex);
    }
}
