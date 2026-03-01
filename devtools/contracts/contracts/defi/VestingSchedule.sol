// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VestingSchedule
 * @notice Multi-beneficiary, cliff + linear vesting contract.
 *
 * The owner creates schedules for any number of beneficiaries.  Each schedule
 * specifies:
 *  - start timestamp
 *  - cliff duration (no tokens released before cliff)
 *  - total vesting duration (linear release after cliff)
 *  - total token amount
 *  - revocability
 *
 * Beneficiaries call `release()` to pull vested tokens at any time.
 * Revocable schedules can be cancelled by the owner; unvested tokens are
 * returned to a configurable treasury address.
 *
 * Security properties:
 *  - ReentrancyGuard on all state-changing external functions.
 *  - Uses SafeERC20 (handles non-standard tokens that don't return bool).
 *  - Integer-only arithmetic (no floating-point rounding errors).
 *  - Cannot create a schedule without the contract holding sufficient tokens.
 *  - Revoked schedules still allow beneficiary to claim already-vested tokens.
 *  - Treasury address validated at construction (not zero address).
 */
contract VestingSchedule is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    struct Schedule {
        address beneficiary;
        uint256 start;          // UNIX timestamp when vesting begins
        uint256 cliffDuration;  // seconds until first tokens unlock
        uint256 totalDuration;  // total vesting period in seconds (>= cliffDuration)
        uint256 totalAmount;    // total tokens granted
        uint256 released;       // tokens already claimed
        bool    revocable;
        bool    revoked;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    IERC20 public immutable token;

    /// @notice Address that receives unvested tokens on revocation.
    address public treasury;

    /// @dev Schedule id → Schedule.
    mapping(bytes32 => Schedule) public schedules;

    /// @notice Beneficiary → list of schedule ids.
    mapping(address => bytes32[]) public beneficiarySchedules;

    /// @notice Total tokens locked across all active schedules.
    uint256 public totalLocked;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ScheduleCreated(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliffDuration,
        uint256 totalDuration,
        bool revocable
    );
    event TokensReleased(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );
    event ScheduleRevoked(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 unvestedReturned
    );
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address token_,
        address treasury_,
        address owner_
    ) Ownable(owner_) {
        require(token_    != address(0), "Vesting: zero token");
        require(treasury_ != address(0), "Vesting: zero treasury");
        token    = IERC20(token_);
        treasury = treasury_;
    }

    // ─── Schedule management ──────────────────────────────────────────────────

    /**
     * @notice Create a vesting schedule for `beneficiary`.
     * @dev The contract must already hold `amount` tokens beyond existing
     *      `totalLocked` to prevent over-commitment.
     * @param beneficiary    Recipient of vested tokens.
     * @param start          Vesting start timestamp (can be in the past).
     * @param cliffDuration  Seconds before any tokens unlock.
     * @param totalDuration  Total vesting period in seconds (>= cliffDuration).
     * @param amount         Total tokens to vest.
     * @param revocable      Whether the owner can cancel this schedule.
     * @return scheduleId    Unique identifier for the created schedule.
     */
    function createSchedule(
        address beneficiary,
        uint256 start,
        uint256 cliffDuration,
        uint256 totalDuration,
        uint256 amount,
        bool revocable
    ) external onlyOwner nonReentrant returns (bytes32 scheduleId) {
        require(beneficiary    != address(0), "Vesting: zero beneficiary");
        require(amount         >  0,          "Vesting: zero amount");
        require(totalDuration  >  0,          "Vesting: zero duration");
        require(cliffDuration  <= totalDuration, "Vesting: cliff > duration");

        // Ensure contract holds enough uncommitted tokens.
        uint256 available = token.balanceOf(address(this)) - totalLocked;
        require(available >= amount, "Vesting: insufficient token balance");

        scheduleId = _computeScheduleId(beneficiary, start, amount, beneficiarySchedules[beneficiary].length);

        schedules[scheduleId] = Schedule({
            beneficiary:   beneficiary,
            start:         start,
            cliffDuration: cliffDuration,
            totalDuration: totalDuration,
            totalAmount:   amount,
            released:      0,
            revocable:     revocable,
            revoked:       false
        });

        beneficiarySchedules[beneficiary].push(scheduleId);
        totalLocked += amount;

        emit ScheduleCreated(
            scheduleId, beneficiary, amount, start, cliffDuration, totalDuration, revocable
        );
    }

    /**
     * @notice Release all currently vested tokens for `scheduleId`.
     *         Callable by the beneficiary or the owner.
     */
    function release(bytes32 scheduleId) external nonReentrant {
        Schedule storage s = schedules[scheduleId];
        require(
            msg.sender == s.beneficiary || msg.sender == owner(),
            "Vesting: not authorised"
        );
        require(!s.revoked, "Vesting: schedule revoked");

        uint256 releasable = _vestedAmount(s) - s.released;
        require(releasable > 0, "Vesting: nothing to release");

        s.released  += releasable;
        totalLocked -= releasable;

        token.safeTransfer(s.beneficiary, releasable);
        emit TokensReleased(scheduleId, s.beneficiary, releasable);
    }

    /**
     * @notice Revoke a revocable schedule.  Vested-but-unclaimed tokens
     *         remain claimable by the beneficiary; unvested tokens go to
     *         the treasury.
     */
    function revoke(bytes32 scheduleId) external onlyOwner nonReentrant {
        Schedule storage s = schedules[scheduleId];
        require(s.revocable,  "Vesting: not revocable");
        require(!s.revoked,   "Vesting: already revoked");

        uint256 vested    = _vestedAmount(s);
        uint256 releasable = vested - s.released;
        uint256 unvested  = s.totalAmount - vested;

        s.revoked = true;
        totalLocked -= (unvested + releasable);

        // Transfer any already-vested portion directly to beneficiary.
        if (releasable > 0) {
            s.released += releasable;
            token.safeTransfer(s.beneficiary, releasable);
            emit TokensReleased(scheduleId, s.beneficiary, releasable);
        }

        // Return unvested to treasury.
        if (unvested > 0) {
            token.safeTransfer(treasury, unvested);
        }

        emit ScheduleRevoked(scheduleId, s.beneficiary, unvested);
    }

    /**
     * @notice Update the treasury address (admin function).
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Vesting: zero treasury");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function vestedAmount(bytes32 scheduleId) external view returns (uint256) {
        return _vestedAmount(schedules[scheduleId]);
    }

    function releasableAmount(bytes32 scheduleId) external view returns (uint256) {
        Schedule storage s = schedules[scheduleId];
        if (s.revoked) return 0;
        return _vestedAmount(s) - s.released;
    }

    function getScheduleIds(address beneficiary) external view returns (bytes32[] memory) {
        return beneficiarySchedules[beneficiary];
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    function _vestedAmount(Schedule storage s) internal view returns (uint256) {
        if (block.timestamp < s.start + s.cliffDuration) return 0;
        if (block.timestamp >= s.start + s.totalDuration) return s.totalAmount;
        return (s.totalAmount * (block.timestamp - s.start)) / s.totalDuration;
    }

    function _computeScheduleId(
        address beneficiary,
        uint256 start,
        uint256 amount,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(beneficiary, start, amount, nonce));
    }
}
