// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MultiSigWallet
 * @notice Production-grade M-of-N multi-signature wallet with expiry,
 *         on-chain confirmation model, and owner management.
 *
 * Any owner can:
 *  - `submit`    — propose a transaction.
 *  - `confirm`   — add their approval.
 *  - `revoke`    — withdraw a prior approval before execution.
 *  - `execute`   — trigger execution once the required quorum is met.
 *  - `cancel`    — remove a pending transaction (submitter or owner).
 *
 * The contract also supports:
 *  - Transaction expiry (`expiresAt`; 0 = no expiry).
 *  - Adding / removing owners and changing the required threshold via
 *    the normal multi-sig flow (only executable through `execute`).
 *  - ETH reception for use as a treasury.
 *
 * Security properties:
 *  - ReentrancyGuard on `execute`.
 *  - Duplicate-signer check enforced at confirmation time O(1) via mapping.
 *  - Owner set validated on construction: no duplicates, no zero addresses,
 *    required <= owners.length, required >= 1.
 *  - Owner management (addOwner, removeOwner, changeRequirement) can only be
 *    called by the multisig itself (encodes via `execute`), preventing
 *    single-owner unilateral changes.
 *  - Low-level `call` used (not `transfer` / `send`) to support contracts
 *    with non-trivial fallback receive logic.
 *
 * @dev For cross-chain and off-chain signing variants see EIP-712 / Safe.
 *      This contract is intentionally minimal and fully on-chain.
 */
contract MultiSigWallet is ReentrancyGuard {
    // ─── Events ──────────────────────────────────────────────────────────────

    event Deposit(address indexed sender, uint256 amount);
    event TransactionSubmitted(
        uint256 indexed txId,
        address indexed submitter,
        address indexed to,
        uint256         value,
        bytes           data,
        uint256         expiresAt
    );
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event ConfirmationRevoked(uint256  indexed txId, address indexed owner);
    event TransactionExecuted(uint256  indexed txId);
    event TransactionCancelled(uint256 indexed txId);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);

    // ─── Types ────────────────────────────────────────────────────────────────

    struct Transaction {
        address to;
        uint256 value;
        bytes   data;
        bool    executed;
        bool    cancelled;
        uint256 confirmCount;
        uint256 expiresAt;   // 0 = no expiry
    }

    // ─── State ────────────────────────────────────────────────────────────────

    address[] public owners;
    uint256   public required;

    mapping(address => bool)                       public isOwner;
    mapping(uint256 => Transaction)                public transactions;
    mapping(uint256 => mapping(address => bool))   public confirmed;

    uint256 public transactionCount;

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address[] memory owners_, uint256 required_) {
        require(owners_.length > 0,         "MultiSig: no owners");
        require(required_ >= 1,             "MultiSig: required < 1");
        require(required_ <= owners_.length,"MultiSig: required > owners");

        for (uint256 i = 0; i < owners_.length; i++) {
            address o = owners_[i];
            require(o != address(0), "MultiSig: zero owner");
            require(!isOwner[o],     "MultiSig: duplicate owner");
            isOwner[o] = true;
            owners.push(o);
        }
        required = required_;
    }

    // ─── Receive CFX ──────────────────────────────────────────────────────────

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // ─── Owner view helpers ───────────────────────────────────────────────────

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    // ─── Transaction submission ───────────────────────────────────────────────

    /**
     * @notice Submit a new transaction proposal.
     * @param to        Call target.
     * @param value     ETH value in wei to send with the call.
     * @param data      Calldata (ABI-encoded function call or empty).
     * @param expiresAt UNIX timestamp deadline; 0 for no expiry.
     * @return txId     Assigned transaction identifier.
     */
    function submit(
        address to,
        uint256 value,
        bytes   calldata data,
        uint256 expiresAt
    ) external onlyOwner returns (uint256 txId) {
        require(to != address(0), "MultiSig: to is zero address");
        require(
            expiresAt == 0 || expiresAt > block.timestamp,
            "MultiSig: expiry in the past"
        );

        txId = transactionCount++;
        transactions[txId] = Transaction({
            to:           to,
            value:        value,
            data:         data,
            executed:     false,
            cancelled:    false,
            confirmCount: 0,
            expiresAt:    expiresAt
        });

        emit TransactionSubmitted(txId, msg.sender, to, value, data, expiresAt);
    }

    // ─── Confirmation lifecycle ───────────────────────────────────────────────

    function confirm(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        notCancelled(txId)
        notExpired(txId)
    {
        require(!confirmed[txId][msg.sender], "MultiSig: already confirmed");
        confirmed[txId][msg.sender] = true;
        transactions[txId].confirmCount++;
        emit TransactionConfirmed(txId, msg.sender);
    }

    function revoke(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(confirmed[txId][msg.sender], "MultiSig: not confirmed");
        confirmed[txId][msg.sender] = false;
        transactions[txId].confirmCount--;
        emit ConfirmationRevoked(txId, msg.sender);
    }

    function cancel(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        notCancelled(txId)
    {
        transactions[txId].cancelled = true;
        emit TransactionCancelled(txId);
    }

    // ─── Execution ────────────────────────────────────────────────────────────

    function execute(uint256 txId)
        external
        onlyOwner
        nonReentrant
        txExists(txId)
        notExecuted(txId)
        notCancelled(txId)
        notExpired(txId)
    {
        Transaction storage txn = transactions[txId];
        require(
            txn.confirmCount >= required,
            "MultiSig: insufficient confirmations"
        );

        txn.executed = true;
        // slither-disable-next-line arbitrary-send-eth
        (bool ok, bytes memory returnData) = txn.to.call{value: txn.value}(txn.data);
        if (!ok) {
            // Re-bubble the revert reason from the inner call.
            if (returnData.length > 0) {
                assembly { revert(add(returnData, 32), mload(returnData)) }
            }
            revert("MultiSig: transaction failed");
        }

        emit TransactionExecuted(txId);
    }

    // ─── Owner management (callable only via multi-sig execute) ──────────────

    function addOwner(address owner_) external onlySelf {
        require(owner_ != address(0), "MultiSig: zero address");
        require(!isOwner[owner_],     "MultiSig: already an owner");
        isOwner[owner_] = true;
        owners.push(owner_);
        emit OwnerAdded(owner_);
    }

    function removeOwner(address owner_) external onlySelf {
        require(isOwner[owner_], "MultiSig: not an owner");
        require(owners.length - 1 >= required, "MultiSig: too few owners remaining");
        isOwner[owner_] = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner_) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        emit OwnerRemoved(owner_);
    }

    function changeRequirement(uint256 newRequired) external onlySelf {
        require(newRequired >= 1,            "MultiSig: required < 1");
        require(newRequired <= owners.length,"MultiSig: required > owners");
        required = newRequired;
        emit RequirementChanged(newRequired);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(isOwner[msg.sender], "MultiSig: not an owner");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "MultiSig: caller must be multisig");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactionCount, "MultiSig: tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "MultiSig: already executed");
        _;
    }

    modifier notCancelled(uint256 txId) {
        require(!transactions[txId].cancelled, "MultiSig: cancelled");
        _;
    }

    modifier notExpired(uint256 txId) {
        uint256 exp = transactions[txId].expiresAt;
        require(
            exp == 0 || block.timestamp <= exp,
            "MultiSig: transaction expired"
        );
        _;
    }
}
