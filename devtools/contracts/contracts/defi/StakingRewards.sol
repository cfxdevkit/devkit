// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingRewards
 * @notice Single-asset ERC-20 staking pool distributing a separate ERC-20
 *         reward token pro-rata to stakers.  Architecture follows the
 *         battle-tested Synthetix StakingRewards model.
 *
 * Workflow:
 *  1. Owner transfers reward tokens into the contract.
 *  2. Owner calls `notifyRewardAmount(amount, duration)` to start a new
 *     reward period (or extend the current one).
 *  3. Users `stake(amount)` and later `withdraw(amount)` or `exit()`.
 *  4. Accumulated rewards are claimed via `getReward()`.
 *
 * Security properties:
 *  - ReentrancyGuard on all state-mutating user functions.
 *  - Reward rate validated: `rewardRate <= rewardBalance / duration` prevents
 *    over-committing rewards that haven't been deposited.
 *  - SafeERC20 for all token transfers (protects against non-standard tokens).
 *  - `emergencyWithdraw()` lets users rescue staked principal with zero pending
 *    reward, usable even when the owner calls `pause` style scenarios are added.
 *  - Precision loss minimised via `PRECISION` constant (1e18 multiplier on
 *    `rewardPerTokenStored`).
 *  - stakingToken and rewardToken may be the same (single-sided staking).
 */
contract StakingRewards is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Immutables ───────────────────────────────────────────────────────────

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 private constant PRECISION = 1e18;

    // ─── Reward accounting ────────────────────────────────────────────────────

    uint256 public periodFinish;
    uint256 public rewardRate;           // tokens per second (scaled by PRECISION)
    uint256 public rewardsDuration;      // seconds
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    // ─── Staking balances ─────────────────────────────────────────────────────

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward, uint256 duration);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address stakingToken_,
        address rewardsToken_,
        address owner_
    ) Ownable(owner_) {
        require(stakingToken_ != address(0), "StakingRewards: zero staking token");
        require(rewardsToken_  != address(0), "StakingRewards: zero rewards token");
        stakingToken = IERC20(stakingToken_);
        rewardsToken = IERC20(rewardsToken_);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function totalSupply() external view returns (uint256) { return _totalSupply; }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + (
            (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * PRECISION
        ) / _totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (
            _balances[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account])
        ) / PRECISION + rewards[account];
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate * rewardsDuration;
    }

    // ─── User actions ─────────────────────────────────────────────────────────

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: stake 0");
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: withdraw 0");
        require(_balances[msg.sender] >= amount, "StakingRewards: insufficient stake");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Withdraw all staked tokens and claim pending rewards atomically.
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    /**
     * @notice Emergency withdraw of principal only, forfeiting all pending rewards.
     * @dev Useful if the rewards token becomes inaccessible (e.g., blacklisted).
     */
    function emergencyWithdraw() external nonReentrant {
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "StakingRewards: nothing staked");
        _totalSupply -= balance;
        _balances[msg.sender] = 0;
        rewards[msg.sender]   = 0;
        stakingToken.safeTransfer(msg.sender, balance);
        emit Withdrawn(msg.sender, balance);
    }

    // ─── Owner / reward management ────────────────────────────────────────────

    /**
     * @notice Fund the contract and start (or extend) a reward period.
     * @param reward   Total reward tokens for the period (must already be in this contract).
     * @param duration Period length in seconds.
     */
    function notifyRewardAmount(
        uint256 reward,
        uint256 duration
    ) external onlyOwner updateReward(address(0)) {
        require(duration > 0, "StakingRewards: zero duration");
        rewardsDuration = duration;

        if (block.timestamp >= periodFinish) {
            rewardRate = reward / duration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover  = remaining * rewardRate;
            rewardRate = (reward + leftover) / duration;
        }

        // Safety check: rewardRate must not exceed contract balance.
        uint256 balance = rewardsToken.balanceOf(address(this));
        // If staking and reward tokens are the same, exclude staked principal.
        if (address(rewardsToken) == address(stakingToken)) {
            balance -= _totalSupply;
        }
        require(
            rewardRate <= balance / duration,
            "StakingRewards: reward rate exceeds balance"
        );

        lastUpdateTime = block.timestamp;
        periodFinish   = block.timestamp + duration;
        emit RewardAdded(reward, duration);
    }

    /**
     * @notice Recover ERC-20 tokens accidentally sent to this contract.
     * @dev Cannot recover staking or rewards tokens to prevent owner rug-pull.
     */
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(stakingToken), "StakingRewards: cannot recover staking token");
        require(tokenAddress != address(rewardsToken), "StakingRewards: cannot recover rewards token");
        IERC20(tokenAddress).safeTransfer(owner(), amount);
        emit Recovered(tokenAddress, amount);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime       = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account]               = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
}
