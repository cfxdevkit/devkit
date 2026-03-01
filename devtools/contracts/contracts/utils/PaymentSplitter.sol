// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentSplitter
 * @notice Immutable revenue-sharing contract that splits incoming CFX and
 *         ERC-20 tokens proportionally among a set of payees.
 *
 * Shares are set at construction and cannot be changed.  All payments are
 * pull-based: payees call `release(payee)` or `releaseERC20(token, payee)`
 * to withdraw their accrued share at any time.
 *
 * Security properties:
 *  - Immutable payee / share configuration — no owner, no upgradeability.
 *  - Pull-only payments (no push) — contract never initiates transfers.
 *  - ReentrancyGuard on both release functions.
 *  - SafeERC20 for all ERC-20 transfers.
 *  - Integer arithmetic: `payment = (totalReceived * shares[payee]) / totalShares
 *    - alreadyReleased[payee]`.  No floating-point.
 *  - Zero-address and duplicate payee checks at construction.
 *  - At least one payee with shares > 0 is required.
 */
contract PaymentSplitter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Events ───────────────────────────────────────────────────────────────

    event PayeeAdded(address indexed account, uint256 shares);
    event NativeReleased(address indexed to, uint256 amount);
    event ERC20Released(address indexed token, address indexed to, uint256 amount);
    event NativeReceived(address indexed from, uint256 amount);

    // ─── State ────────────────────────────────────────────────────────────────

    uint256 public totalShares;
    uint256 public totalNativeReleased;

    address[] private _payees;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public nativeReleased;

    // ERC-20 tracking
    mapping(IERC20 => uint256)                     public erc20TotalReleased;
    mapping(IERC20 => mapping(address => uint256)) public erc20Released;

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address[] memory payees, uint256[] memory shares_) {
        require(payees.length > 0,                    "Splitter: no payees");
        require(payees.length == shares_.length,      "Splitter: length mismatch");

        for (uint256 i = 0; i < payees.length; i++) {
            address account_ = payees[i];
            uint256 share_   = shares_[i];
            require(account_ != address(0), "Splitter: zero address payee");
            require(share_   >  0,          "Splitter: zero share");
            require(shares[account_] == 0,  "Splitter: duplicate payee");
            _addPayee(account_, share_);
        }
    }

    // ─── Receive native CFX ───────────────────────────────────────────────────

    receive() external payable {
        emit NativeReceived(msg.sender, msg.value);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function payee(uint256 index) external view returns (address) {
        return _payees[index];
    }

    function payeeCount() external view returns (uint256) {
        return _payees.length;
    }

    /**
     * @notice Pending native CFX balance for `account`.
     */
    function pendingNative(address account) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + totalNativeReleased;
        return (totalReceived * shares[account]) / totalShares - nativeReleased[account];
    }

    /**
     * @notice Pending ERC-20 `token` balance for `account`.
     */
    function pendingERC20(IERC20 token, address account) public view returns (uint256) {
        uint256 totalReceived = token.balanceOf(address(this)) + erc20TotalReleased[token];
        return (totalReceived * shares[account]) / totalShares - erc20Released[token][account];
    }

    // ─── Release ──────────────────────────────────────────────────────────────

    /**
     * @notice Release accrued native CFX to `account`.
     */
    function release(address payable account) external nonReentrant {
        require(shares[account] > 0, "Splitter: not a payee");
        uint256 payment = pendingNative(account);
        require(payment > 0, "Splitter: nothing to release");

        nativeReleased[account]   += payment;
        totalNativeReleased       += payment;

        // slither-disable-next-line arbitrary-send-eth
        (bool ok, ) = account.call{value: payment}("");
        require(ok, "Splitter: CFX transfer failed");
        emit NativeReleased(account, payment);
    }

    /**
     * @notice Release accrued `token` balance to `account`.
     */
    function releaseERC20(IERC20 token, address account) external nonReentrant {
        require(shares[account] > 0, "Splitter: not a payee");
        uint256 payment = pendingERC20(token, account);
        require(payment > 0, "Splitter: nothing to release");

        erc20Released[token][account] += payment;
        erc20TotalReleased[token]     += payment;

        token.safeTransfer(account, payment);
        emit ERC20Released(address(token), account, payment);
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    function _addPayee(address account, uint256 shares_) private {
        _payees.push(account);
        shares[account]  = shares_;
        totalShares     += shares_;
        emit PayeeAdded(account, shares_);
    }
}
