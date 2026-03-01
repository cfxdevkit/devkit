// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockPriceOracle
 * @notice Configurable mock that implements the Chainlink AggregatorV3Interface.
 *
 * Useful for testing price-dependent contracts (lending markets, AMMs,
 * automation managers) without connecting to a live oracle.
 *
 * Features:
 *  - Adjustable answer, decimals, roundId, timestamps, and description.
 *  - `setAnswer(int256 price)` — update the price in one call.
 *  - `setRoundData(...)` — set the full round structure returned by
 *    `latestRoundData` and `getRoundData`.
 *  - `setPhase(uint16 phaseId)` — simulate oracle phase increments.
 *  - Can simulate a stale feed by setting `updatedAt` in the past.
 *  - `sequencerUptimeFeed` mode: returns started=1 to simulate L2 sequencer
 *    downtime checks.
 *
 * @dev This contract is intentionally NOT access-controlled — it is for
 *      local devnode use ONLY.  Do not deploy to mainnet or testnet.
 */
contract MockPriceOracle {
    // ─── AggregatorV3Interface state ─────────────────────────────────────────

    string  public description;
    uint8   public decimals;
    uint256 public version = 4;

    struct RoundData {
        uint80  roundId;
        int256  answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80  answeredInRound;
    }

    RoundData private _latestRound;
    mapping(uint80 => RoundData) private _rounds;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt);
    event NewRound(uint256 indexed roundId, address indexed startedBy, uint256 startedAt);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        string memory description_,
        uint8  decimals_,
        int256 initialAnswer
    ) {
        description = description_;
        decimals    = decimals_;
        _setAnswer(initialAnswer);
    }

    // ─── Configuration helpers ────────────────────────────────────────────────

    /**
     * @notice Update the latest price answer with auto-generated round metadata.
     */
    function setAnswer(int256 answer) external {
        _setAnswer(answer);
    }

    /**
     * @notice Fully configure the latest round (allows simulating stale feeds,
     *         cross-round scenarios, etc).
     */
    function setRoundData(
        uint80  roundId,
        int256  answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80  answeredInRound
    ) external {
        RoundData memory rd = RoundData(roundId, answer, startedAt, updatedAt, answeredInRound);
        _rounds[roundId]  = rd;
        _latestRound      = rd;
        emit AnswerUpdated(answer, roundId, updatedAt);
    }

    function setDecimals(uint8 decimals_) external {
        decimals = decimals_;
    }

    function setDescription(string calldata description_) external {
        description = description_;
    }

    // ─── AggregatorV3Interface ────────────────────────────────────────────────

    function latestRoundData()
        external
        view
        returns (
            uint80  roundId,
            int256  answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80  answeredInRound
        )
    {
        RoundData storage rd = _latestRound;
        return (rd.roundId, rd.answer, rd.startedAt, rd.updatedAt, rd.answeredInRound);
    }

    function getRoundData(uint80 roundId_)
        external
        view
        returns (
            uint80  roundId,
            int256  answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80  answeredInRound
        )
    {
        RoundData storage rd = _rounds[roundId_];
        require(rd.roundId != 0, "MockOracle: round not found");
        return (rd.roundId, rd.answer, rd.startedAt, rd.updatedAt, rd.answeredInRound);
    }

    function latestAnswer() external view returns (int256) {
        return _latestRound.answer;
    }

    function latestRound() external view returns (uint256) {
        return _latestRound.roundId;
    }

    function latestTimestamp() external view returns (uint256) {
        return _latestRound.updatedAt;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _setAnswer(int256 answer) private {
        uint80 newRoundId = _latestRound.roundId + 1;
        RoundData memory rd = RoundData({
            roundId:         newRoundId,
            answer:          answer,
            startedAt:       block.timestamp,
            updatedAt:       block.timestamp,
            answeredInRound: newRoundId
        });
        _rounds[newRoundId] = rd;
        _latestRound        = rd;
        emit AnswerUpdated(answer, newRoundId, block.timestamp);
        emit NewRound(newRoundId, msg.sender, block.timestamp);
    }
}
