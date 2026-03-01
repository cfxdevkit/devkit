/**
 * @cfxdevkit/protocol — Conflux network precompile ABIs and addresses.
 *
 * All Conflux internal contracts ("precompiles") share the address prefix
 * 0x0888000000000000000000000000000000000000–07.
 *
 * Core Space contracts are accessible via `cive` client.
 * eSpace contracts (CrossSpaceCall, ConfluxContext) are accessible via `viem`.
 */

// ─── Addresses ──────────────────────────────────────────────────────────────

/**
 * Canonical hex addresses for Conflux internal contracts.
 * Valid on both mainnet (chainId 1029/1030) and testnet (1/71).
 */
export const CONFLUX_PRECOMPILE_ADDRESSES = {
  /** Core Space: set/revoke/query admin for a contract */
  AdminControl: '0x0888000000000000000000000000000000000000',
  /** Core Space: gas/storage sponsorship management */
  SponsorWhitelist: '0x0888000000000000000000000000000000000001',
  /** Core Space: PoS staking deposit, withdraw, vote lock */
  Staking: '0x0888000000000000000000000000000000000002',
  /** Core Space: PoS validator registration and reward tracking */
  PoSRegister: '0x0888000000000000000000000000000000000005',
  /** eSpace & Core Space: synchronous Core↔eSpace message passing */
  CrossSpaceCall: '0x0888000000000000000000000000000000000006',
  /** Core Space: on-chain governance parameter control */
  ParamsControl: '0x0888000000000000000000000000000000000007',
} as const;

// ─── AdminControl ────────────────────────────────────────────────────────────

/**
 * AdminControl — Core Space internal contract.
 * Allows an admin to manage the admin relationship of a contract or destroy it.
 *
 * Address: 0x0888000000000000000000000000000000000000
 * Access: Core Space only (use `cive` client).
 */
export const adminControlAbi = [
  {
    type: 'function',
    name: 'getAdmin',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setAdmin',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
      { name: 'newAdmin', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'destroy',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const ADMIN_CONTROL_ABI = adminControlAbi;
export const adminControlAddress = CONFLUX_PRECOMPILE_ADDRESSES.AdminControl;

// ─── SponsorWhitelist ────────────────────────────────────────────────────────

/**
 * SponsorWhitelist — Core Space internal contract.
 * Manages gas and collateral sponsorship, enabling gasless dApp UX.
 *
 * Address: 0x0888000000000000000000000000000000000001
 * Access: Core Space only (use `cive` client).
 */
export const sponsorWhitelistAbi = [
  {
    type: 'function',
    name: 'getSponsorForGas',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSponsoredBalanceForGas',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSponsoredGasFeeUpperBound',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSponsorForCollateral',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSponsoredBalanceForCollateral',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isWhitelisted',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
      { name: 'userAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAllWhitelisted',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addPrivilegeByAdmin',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
      { name: 'addresses', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removePrivilegeByAdmin',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
      { name: 'addresses', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSponsorForGas',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
      { name: 'upperBound', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'setSponsorForCollateral',
    inputs: [
      { name: 'contractAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'addPrivilege',
    inputs: [
      { name: 'addresses', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removePrivilege',
    inputs: [
      { name: 'addresses', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'SponsorUpdated',
    inputs: [
      { indexed: true, name: 'contractAddr', type: 'address' },
      { indexed: false, name: 'sponsorType', type: 'uint32' },
      { indexed: false, name: 'sponsor', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WhitelistUpdated',
    inputs: [
      { indexed: true, name: 'contractAddr', type: 'address' },
      { indexed: true, name: 'userAddr', type: 'address' },
      { indexed: false, name: 'isAdded', type: 'bool' },
    ],
    anonymous: false,
  },
] as const;

export const SPONSOR_WHITELIST_ABI = sponsorWhitelistAbi;
export const sponsorWhitelistAddress =
  CONFLUX_PRECOMPILE_ADDRESSES.SponsorWhitelist;

// ─── Staking ─────────────────────────────────────────────────────────────────

/**
 * Staking — Core Space internal contract.
 * Manages PoS staking: deposit CFX, withdraw, and vote-lock for governance.
 *
 * Address: 0x0888000000000000000000000000000000000002
 * Access: Core Space only (use `cive` client).
 */
export const stakingAbi = [
  {
    type: 'function',
    name: 'getStakingBalance',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLockedStakingBalance',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'blockNumber', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVotePower',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'blockNumber', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'voteLock',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'unlockBlock', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdraw',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'VoteLock',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'unlockBlock', type: 'uint256' },
    ],
    anonymous: false,
  },
] as const;

export const STAKING_ABI = stakingAbi;
export const stakingAddress = CONFLUX_PRECOMPILE_ADDRESSES.Staking;

// ─── CrossSpaceCall ───────────────────────────────────────────────────────────

/**
 * CrossSpaceCall — internal contract accessible from both Core Space and eSpace.
 * Enables synchronous cross-space calls: eSpace → Core Space and Core → eSpace.
 *
 * eSpace address: 0x0888000000000000000000000000000000000006
 * Access: Use `viem` client on eSpace, or `cive` client on Core Space.
 */
export const crossSpaceCallAbi = [
  // ─── Called from eSpace ────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'callEVM',
    inputs: [
      { name: 'to', type: 'bytes20', internalType: 'bytes20' },
      { name: 'data', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'staticCallEVM',
    inputs: [
      { name: 'to', type: 'bytes20', internalType: 'bytes20' },
      { name: 'data', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdrawFromMapped',
    inputs: [{ name: 'value', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mappedBalance',
    inputs: [{ name: 'addr', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferEVM',
    inputs: [{ name: 'to', type: 'bytes20', internalType: 'bytes20' }],
    outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'payable',
  },
  // ─── Events ────────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'Call',
    inputs: [
      { indexed: true, name: 'sender', type: 'bytes20' },
      { indexed: true, name: 'receiver', type: 'bytes20' },
      { indexed: false, name: 'value', type: 'uint256' },
      { indexed: false, name: 'nonce', type: 'uint256' },
      { indexed: false, name: 'data', type: 'bytes' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Outcome',
    inputs: [
      { indexed: false, name: 'success', type: 'bool' },
      { indexed: false, name: 'data', type: 'bytes' },
    ],
    anonymous: false,
  },
] as const;

export const CROSS_SPACE_CALL_ABI = crossSpaceCallAbi;
export const crossSpaceCallAddress =
  CONFLUX_PRECOMPILE_ADDRESSES.CrossSpaceCall;

// ─── PoSRegister ─────────────────────────────────────────────────────────────

/**
 * PoSRegister — Core Space internal contract.
 * Manages PoS validator registration and provides staking/reward queries.
 *
 * Address: 0x0888000000000000000000000000000000000005
 * Access: Core Space only (use `cive` client).
 */
export const posRegisterAbi = [
  {
    type: 'function',
    name: 'register',
    inputs: [
      { name: 'indentifier', type: 'bytes32', internalType: 'bytes32' },
      { name: 'votePower', type: 'uint64', internalType: 'uint64' },
      { name: 'blsPubKey', type: 'bytes', internalType: 'bytes' },
      { name: 'vrfPubKey', type: 'bytes', internalType: 'bytes' },
      { name: 'blsPubKeyProof', type: 'bytes[2]', internalType: 'bytes[2]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'increaseStake',
    inputs: [{ name: 'votePower', type: 'uint64', internalType: 'uint64' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'retire',
    inputs: [{ name: 'votePower', type: 'uint64', internalType: 'uint64' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getVotes',
    inputs: [{ name: 'identifier', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'totalVotes', type: 'uint256', internalType: 'uint256' },
      { name: 'unlockedVotes', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'identifierToAddress',
    inputs: [{ name: 'identifier', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addressToIdentifier',
    inputs: [{ name: 'addr', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Register',
    inputs: [
      { indexed: true, name: 'identifier', type: 'bytes32' },
      { indexed: false, name: 'blsPubKey', type: 'bytes' },
      { indexed: false, name: 'vrfPubKey', type: 'bytes' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'IncreaseStake',
    inputs: [
      { indexed: true, name: 'identifier', type: 'bytes32' },
      { indexed: false, name: 'votePower', type: 'uint64' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Retire',
    inputs: [
      { indexed: true, name: 'identifier', type: 'bytes32' },
      { indexed: false, name: 'votePower', type: 'uint64' },
    ],
    anonymous: false,
  },
] as const;

export const POS_REGISTER_ABI = posRegisterAbi;
export const posRegisterAddress = CONFLUX_PRECOMPILE_ADDRESSES.PoSRegister;
