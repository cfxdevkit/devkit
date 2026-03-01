//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AutomationManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x33e5e5b262e5d8ebc443e1c6c9f14215b020554d)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x9D5B131e5bA37A238cd1C485E2D9d7c2A68E1d0F)
 */
export const automationManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_priceAdapter', internalType: 'address', type: 'address' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'DCACompleted',
  },
  {
    type: 'error',
    inputs: [
      { name: 'nextExecution', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DCAIntervalNotReached',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'reason', internalType: 'string', type: 'string' }],
    name: 'InvalidParams',
  },
  {
    type: 'error',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'JobExpiredError',
  },
  {
    type: 'error',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'JobNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'JobNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PriceConditionNotMet',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'maxAllowed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SlippageTooHigh',
  },
  {
    type: 'error',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'TooManyJobs',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jobId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'canceller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'JobCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jobId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'jobType',
        internalType: 'enum AutomationManager.JobType',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'JobCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jobId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'keeper',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountOut',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'JobExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jobId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'JobExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'keeper',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'KeeperUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MaxJobsPerUserUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAdapter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PriceAdapterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'activeJobCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancelJob',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct AutomationManager.DCAParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'amountPerSwap', internalType: 'uint256', type: 'uint256' },
          { name: 'intervalSeconds', internalType: 'uint256', type: 'uint256' },
          { name: 'totalSwaps', internalType: 'uint256', type: 'uint256' },
          { name: 'swapsCompleted', internalType: 'uint256', type: 'uint256' },
          { name: 'nextExecution', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'slippageBps', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createDCAJob',
    outputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct AutomationManager.LimitOrderParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'targetPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'triggerAbove', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'slippageBps', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createLimitOrder',
    outputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'dcaJobs',
    outputs: [
      { name: 'tokenIn', internalType: 'address', type: 'address' },
      { name: 'tokenOut', internalType: 'address', type: 'address' },
      { name: 'amountPerSwap', internalType: 'uint256', type: 'uint256' },
      { name: 'intervalSeconds', internalType: 'uint256', type: 'uint256' },
      { name: 'totalSwaps', internalType: 'uint256', type: 'uint256' },
      { name: 'swapsCompleted', internalType: 'uint256', type: 'uint256' },
      { name: 'nextExecution', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'jobId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'router', internalType: 'address', type: 'address' },
      { name: 'swapCalldata', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'executeDCATick',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'jobId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'router', internalType: 'address', type: 'address' },
      { name: 'swapCalldata', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'executeLimitOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'expireJob',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getDCAJob',
    outputs: [
      {
        name: '',
        internalType: 'struct AutomationManager.DCAParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'amountPerSwap', internalType: 'uint256', type: 'uint256' },
          { name: 'intervalSeconds', internalType: 'uint256', type: 'uint256' },
          { name: 'totalSwaps', internalType: 'uint256', type: 'uint256' },
          { name: 'swapsCompleted', internalType: 'uint256', type: 'uint256' },
          { name: 'nextExecution', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getJob',
    outputs: [
      {
        name: '',
        internalType: 'struct AutomationManager.Job',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'bytes32', type: 'bytes32' },
          { name: 'owner', internalType: 'address', type: 'address' },
          {
            name: 'jobType',
            internalType: 'enum AutomationManager.JobType',
            type: 'uint8',
          },
          {
            name: 'status',
            internalType: 'enum AutomationManager.JobStatus',
            type: 'uint8',
          },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSlippageBps', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'jobId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getLimitOrder',
    outputs: [
      {
        name: '',
        internalType: 'struct AutomationManager.LimitOrderParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'targetPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'triggerAbove', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserJobs',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'jobs',
    outputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'jobType',
        internalType: 'enum AutomationManager.JobType',
        type: 'uint8',
      },
      {
        name: 'status',
        internalType: 'enum AutomationManager.JobStatus',
        type: 'uint8',
      },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSlippageBps', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'keeperFeeFlat',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'keepers',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'limitOrders',
    outputs: [
      { name: 'tokenIn', internalType: 'address', type: 'address' },
      { name: 'tokenOut', internalType: 'address', type: 'address' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'targetPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'triggerAbove', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxJobsPerUser',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxSlippageBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'priceAdapter',
    outputs: [
      { name: '', internalType: 'contract IPriceAdapter', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'keeper', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'setKeeper',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_max', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxJobsPerUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_maxBps', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxSlippageBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_priceAdapter', internalType: 'address', type: 'address' },
    ],
    name: 'setPriceAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userJobs',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x33e5e5b262e5d8ebc443e1c6c9f14215b020554d)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x9D5B131e5bA37A238cd1C485E2D9d7c2A68E1d0F)
 */
export const automationManagerAddress = {
  71: '0x33e5E5B262e5d8eBC443E1c6c9F14215b020554d',
  1030: '0x9D5B131e5bA37A238cd1C485E2D9d7c2A68E1d0F',
} as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x33e5e5b262e5d8ebc443e1c6c9f14215b020554d)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x9D5B131e5bA37A238cd1C485E2D9d7c2A68E1d0F)
 */
export const automationManagerConfig = {
  address: automationManagerAddress,
  abi: automationManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1155Base
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1155BaseAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'uri_', internalType: 'string', type: 'string' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidApprover',
  },
  {
    type: 'error',
    inputs: [
      { name: 'idsLength', internalType: 'uint256', type: 'uint256' },
      { name: 'valuesLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InvalidArrayLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1155MissingApprovalForAll',
  },
  {
    type: 'error',
    inputs: [
      { name: 'numerator', internalType: 'uint256', type: 'uint256' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC2981InvalidDefaultRoyalty',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC2981InvalidDefaultRoyaltyReceiver',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'numerator', internalType: 'uint256', type: 'uint256' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC2981InvalidTokenRoyalty',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2981InvalidTokenRoyaltyReceiver',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'values',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'TransferBatch',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferSingle',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'value', internalType: 'string', type: 'string', indexed: false },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'URI',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accounts', internalType: 'address[]', type: 'address[]' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'burnBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'exists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'maxSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mintBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'salePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'royaltyInfo',
    outputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'feeNumerator', internalType: 'uint96', type: 'uint96' },
    ],
    name: 'setDefaultRoyalty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxSupply',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'feeNumerator', internalType: 'uint96', type: 'uint96' },
    ],
    name: 'setTokenRoyalty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newUri', internalType: 'string', type: 'string' }],
    name: 'setURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20Base
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20BaseAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'cap_', internalType: 'uint256', type: 'uint256' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'increasedSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20ExceededCap',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'cap', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC20InvalidCap',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721Base
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721BaseAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'maxSupply_', internalType: 'uint256', type: 'uint256' },
      { name: 'royaltyReceiver', internalType: 'address', type: 'address' },
      { name: 'royaltyFeeNumer', internalType: 'uint96', type: 'uint96' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'numerator', internalType: 'uint256', type: 'uint256' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC2981InvalidDefaultRoyalty',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC2981InvalidDefaultRoyaltyReceiver',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'numerator', internalType: 'uint256', type: 'uint256' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC2981InvalidTokenRoyalty',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2981InvalidTokenRoyaltyReceiver',
  },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_fromTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_toTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BatchMetadataUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MetadataUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'salePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'royaltyInfo',
    outputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'uri_', internalType: 'string', type: 'string' },
    ],
    name: 'safeMint',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'feeNumerator', internalType: 'uint96', type: 'uint96' },
    ],
    name: 'setDefaultRoyalty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'feeNumerator', internalType: 'uint96', type: 'uint96' },
    ],
    name: 'setTokenRoyalty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MerkleAirdrop
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const merkleAirdropAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'token_', internalType: 'address', type: 'address' },
      { name: 'merkleRoot_', internalType: 'bytes32', type: 'bytes32' },
      { name: 'expiresAt_', internalType: 'uint256', type: 'uint256' },
      { name: 'owner_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'claimIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'claimant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'newRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'newExpiresAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RootUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Swept',
  },
  {
    type: 'function',
    inputs: [
      { name: 'claimIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'merkleProof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expiresAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'claimIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'isClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleRoot',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'sweep',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newRoot', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newExpiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockPriceOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockPriceOracleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'description_', internalType: 'string', type: 'string' },
      { name: 'decimals_', internalType: 'uint8', type: 'uint8' },
      { name: 'initialAnswer', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'current',
        internalType: 'int256',
        type: 'int256',
        indexed: true,
      },
      {
        name: 'roundId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'updatedAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AnswerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'roundId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'startedBy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'startedAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NewRound',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'roundId_', internalType: 'uint80', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { name: 'roundId', internalType: 'uint80', type: 'uint80' },
      { name: 'answer', internalType: 'int256', type: 'int256' },
      { name: 'startedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'updatedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'answeredInRound', internalType: 'uint80', type: 'uint80' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestRound',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', internalType: 'uint80', type: 'uint80' },
      { name: 'answer', internalType: 'int256', type: 'int256' },
      { name: 'startedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'updatedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'answeredInRound', internalType: 'uint80', type: 'uint80' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'answer', internalType: 'int256', type: 'int256' }],
    name: 'setAnswer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'decimals_', internalType: 'uint8', type: 'uint8' }],
    name: 'setDecimals',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'description_', internalType: 'string', type: 'string' }],
    name: 'setDescription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'roundId', internalType: 'uint80', type: 'uint80' },
      { name: 'answer', internalType: 'int256', type: 'int256' },
      { name: 'startedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'updatedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'answeredInRound', internalType: 'uint80', type: 'uint80' },
    ],
    name: 'setRoundData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MultiSigWallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const multiSigWalletAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'owners_', internalType: 'address[]', type: 'address[]' },
      { name: 'required_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txId', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ConfirmationRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'required',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RequirementChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'TransactionCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txId', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TransactionConfirmed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'TransactionExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txId', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'submitter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'expiresAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransactionSubmitted',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner_', internalType: 'address', type: 'address' }],
    name: 'addOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'txId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newRequired', internalType: 'uint256', type: 'uint256' }],
    name: 'changeRequirement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'txId', internalType: 'uint256', type: 'uint256' }],
    name: 'confirm',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'confirmed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'txId', internalType: 'uint256', type: 'uint256' }],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwners',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'owners',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner_', internalType: 'address', type: 'address' }],
    name: 'removeOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'required',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'txId', internalType: 'uint256', type: 'uint256' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'submit',
    outputs: [{ name: 'txId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'transactionCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'transactions',
    outputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'executed', internalType: 'bool', type: 'bool' },
      { name: 'cancelled', internalType: 'bool', type: 'bool' },
      { name: 'confirmCount', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PaymentSplitter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const paymentSplitterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'payees', internalType: 'address[]', type: 'address[]' },
      { name: 'shares_', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ERC20Released',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NativeReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NativeReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PayeeAdded',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'contract IERC20', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'erc20Released',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    name: 'erc20TotalReleased',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'nativeReleased',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'payee',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'payeeCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'pendingERC20',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'pendingNative',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address payable', type: 'address' },
    ],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'releaseERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'shares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalNativeReleased',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PermitHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x4240882f2d9d70cdb9fbcc859cdd4d3e59f5d137)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x0D566aC9Dd1e20Fc63990bEEf6e8abBA876c896B)
 */
export const permitHandlerAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'PermitFailed',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'deadline',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PermitApplied',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permitAndApprove',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
      { name: 'createJobCalldata', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'permitApproveAndCall',
    outputs: [{ name: 'result', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x4240882f2d9d70cdb9fbcc859cdd4d3e59f5d137)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x0D566aC9Dd1e20Fc63990bEEf6e8abBA876c896B)
 */
export const permitHandlerAddress = {
  71: '0x4240882f2D9D70Cdb9fBCC859cdD4d3e59f5d137',
  1030: '0x0D566aC9Dd1e20Fc63990bEEf6e8abBA876c896B',
} as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x4240882f2d9d70cdb9fbcc859cdd4d3e59f5d137)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0x0D566aC9Dd1e20Fc63990bEEf6e8abBA876c896B)
 */
export const permitHandlerConfig = {
  address: permitHandlerAddress,
  abi: permitHandlerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StakingRewards
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const stakingRewardsAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'stakingToken_', internalType: 'address', type: 'address' },
      { name: 'rewardsToken_', internalType: 'address', type: 'address' },
      { name: 'owner_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Recovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardPaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsDurationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Staked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawn',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'earned',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'exit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRewardForDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTimeRewardApplicable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastUpdateTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'periodFinish',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardPerToken',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardPerTokenStored',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'rewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardsDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardsToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stakingToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userRewardPerTokenPaid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SwappiPriceAdapter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x88c48e0e8f76493bb926131a2be779cc17ecbedf)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0xD2Cc2a7Eb4A5792cE6383CcD0f789C1A9c48ECf9)
 */
export const swappiPriceAdapterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_router', internalType: 'address', type: 'address' },
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFactory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FactoryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'QuoteAmountUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newRouter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RouterUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [
      { name: '', internalType: 'contract ISwappiFactory', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIn', internalType: 'address', type: 'address' },
      { name: 'tokenOut', internalType: 'address', type: 'address' },
    ],
    name: 'getPrice',
    outputs: [{ name: 'price', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'quoteAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'router',
    outputs: [
      { name: '', internalType: 'contract ISwappiRouter', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_factory', internalType: 'address', type: 'address' }],
    name: 'setFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_quoteAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setQuoteAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_router', internalType: 'address', type: 'address' }],
    name: 'setRouter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x88c48e0e8f76493bb926131a2be779cc17ecbedf)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0xD2Cc2a7Eb4A5792cE6383CcD0f789C1A9c48ECf9)
 */
export const swappiPriceAdapterAddress = {
  71: '0x88C48e0E8F76493Bb926131a2BE779cc17ecBEdF',
  1030: '0xD2Cc2a7Eb4A5792cE6383CcD0f789C1A9c48ECf9',
} as const

/**
 * - [__View Contract on Conflux E Space Testnet Conflux Scan__](https://evmtestnet.confluxscan.org/address/0x88c48e0e8f76493bb926131a2be779cc17ecbedf)
 * - [__View Contract on Conflux E Space Conflux Scan__](https://evm.confluxscan.org/address/0xD2Cc2a7Eb4A5792cE6383CcD0f789C1A9c48ECf9)
 */
export const swappiPriceAdapterConfig = {
  address: swappiPriceAdapterAddress,
  abi: swappiPriceAdapterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VestingSchedule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const vestingScheduleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'token_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'owner_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'scheduleId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'beneficiary',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'start',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'cliffDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'revocable', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ScheduleCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'scheduleId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'beneficiary',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'unvestedReturned',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ScheduleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'scheduleId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'beneficiary',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'beneficiarySchedules',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'beneficiary', internalType: 'address', type: 'address' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
      { name: 'cliffDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'revocable', internalType: 'bool', type: 'bool' },
    ],
    name: 'createSchedule',
    outputs: [{ name: 'scheduleId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'beneficiary', internalType: 'address', type: 'address' }],
    name: 'getScheduleIds',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'scheduleId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'releasableAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'scheduleId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'scheduleId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'schedules',
    outputs: [
      { name: 'beneficiary', internalType: 'address', type: 'address' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
      { name: 'cliffDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'released', internalType: 'uint256', type: 'uint256' },
      { name: 'revocable', internalType: 'bool', type: 'bool' },
      { name: 'revoked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalLocked',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'scheduleId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'vestedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedCFX
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wrappedCfxAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dst', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Withdrawal',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dst', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'src', internalType: 'address', type: 'address' },
      { name: 'dst', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'wad', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// hardhat-bytecode
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ─── Deployment bytecode ─────────────────────────────────────────────────────
// Used by devtools/contracts/scripts/deploy.ts via viem deployContract.
// Regenerate with: pnpm contracts:codegen
export const automationManagerBytecode =
  '0x608034620001255762002420601f38829003908101601f19168301906001600160401b038211848310176200012a57808491604094859485528339810103126200012557816200005160209362000140565b6001600160a01b0393909184916200006a910162000140565b1680156200010d57600080546001600160a01b0319808216841783558551969294909291849083167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08780a36001805560146009556101f4600a5584600b5516908115620000fe5784955060025416176002558152600860205220600160ff19825416179055516122ca9081620001568239f35b63d92e233d60e01b8652600486fd5b8251631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203620001255756fe6080604052600436101561001257600080fd5b60e0600035811c806317f5f04914611845578063225f079d146114b157806325fc1b3d1461144e5780632b7aabee146114305780633651588e1461131057806338ed5b34146112f257806338ed7cfc1461126c5780633bbd64bc1461122d5780633f0b1d741461116c5780633f4ba83a146110fa5780633fa7276c1461104657806340fba24314610fdd57806359c9bbeb14610f915780635c975abb14610f6b5780635fae145014610e665780636683e21514610a89578063715018a614610a305780638456cb59146109ce5780638da5cb5b146109a55780638faa8b6c1461096b5780639309838214610942578063c17ff9d2146108ea578063c4aa7395146108cc578063ca697db414610859578063d033f1501461077e578063d1b9e853146106dd578063dc4c46ab1461036c578063dd7f9305146102f5578063f2fde38b1461026c5763f729cf0d1461016757600080fd5b3461026757602036600319011261026757610180611e27565b50600435600052600360205260406000206040519061019e82611d05565b8054825260018101546001600160a01b03808216602085019081529291604085019060a081901c60ff169060028210156102515760ff91835260a81c16606086019060048110156102515761023d9261023291835260028601549460808901958652600460038801549760a08b0198895201549760c08a0198895260405199518a5251166020890152516040880190611c19565b516060860190611c26565b5160808401525160a08301525160c0820152f35b634e487b7160e01b600052602160045260246000fd5b600080fd5b3461026757602036600319011261026757610285611c33565b61028d611f46565b6001600160a01b039081169081156102dc57600054826001600160601b0360a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a3005b604051631e4fbdf760e01b815260006004820152602490fd5b5034610267576020366003190112610267576004356000526005602052604060002060018060a01b0390818154169160018201541690600281015460038201546004830154916006600585015494015494604051968752602087015260408601526060850152608084015260a083015260c0820152f35b346102675761037a36611c49565b929190610385611f72565b61038d611ef9565b336000526020906008825260ff60406000205416156106cc5760008481526003835260409020600101546001600160a01b0391908216156106b3578460005260038352604060002090600484526040600020966103e983611f95565b6103f283611fc9565b600254885460018a018054604051635620c32d60e11b81526001600160a01b0393891684811660048301529189169093166024840152959094929091908890829060449082908b165afa90811561060b57600091610686575b5060058b015460ff161561066d5760048b01541161065457906104946001602494935b01956104878c60028a8a54169101928354913091612067565b89888d5416915491612180565b8584541693878787541695604051958680926370a0823160e01b998a835260048301525afa93841561060b57889388938b92600097610617575b506104fa9282600080949381946040519384928337810182815203925af16104f4611e7f565b50611ebf565b5485546040519586528716600486015284916024918391165afa801561060b576000906105dc575b61052c9250611e72565b95600381015487106105a2577e89088bf76a5e8c7f0949b234e1b713c4d71b6c75b4578745a6c711ac70189594836105659254166120c2565b805460ff60a81b198116600160a81b179091551660009081526007825260409020805461059190611e1a565b90556040519384523393a360018055005b60405163a8c278dd60e01b815260206004820152601160248201527014db1a5c1c1859d948195e18d959591959607a1b6044820152606490fd5b508482813d8311610604575b6105f28183611d8b565b810103126102675761052c9151610522565b503d6105e8565b6040513d6000823e3d90fd5b9450955093905082813d831161064d575b6106328183611d8b565b810103126102675790519287928792918a91906104fa6104ce565b503d610628565b604051630771e7a760e31b8152600481018a9052602490fd5b60048b015410610654579061049460016024949361046e565b90508781813d83116106ac575b61069d8183611d8b565b8101031261026757518b61044b565b503d610693565b60405163c182b72d60e01b815260048101869052602490fd5b6040516282b42960e81b8152600490fd5b34610267576040366003190112610267576106f6611c33565b60243590811515908183036102675761070d611f46565b6001600160a01b031691821561076c577f786c9db967bf0c6b16c7c91adae8a8c554b15a57d373fa2059607300f4616c0091610763602092856000526008845260406000209060ff801983541691151516179055565b604051908152a2005b60405163d92e233d60e01b8152600490fd5b3461026757602036600319011261026757600060a060405161079f81611d37565b8281528260208201528260408201528260608201528260808201520152600435600052600460205260c060406000206040516107da81611d37565b60018060a01b03918281541692838352806001830154169060208401918252600283015490604085019182526003840154926060860193845260a060ff600560048801549760808a01988952015416960195151586526040519687525116602086015251604085015251606084015251608083015251151560a0820152f35b3461026757602036600319011261026757600435600052600460205260c0604060002060018060a01b0390818154169160018201541690600281015460038201549060ff6005600485015494015416936040519586526020860152604085015260608401526080830152151560a0820152f35b34610267576000366003190112610267576020600a54604051908152f35b3461026757604036600319011261026757610903611c33565b6001600160a01b03166000908152600660205260409020805460243591908210156102675760209161093491611cab565b90546040519160031b1c8152f35b34610267576000366003190112610267576002546040516001600160a01b039091168152602090f35b34610267576020366003190112610267576001600160a01b0361098c611c33565b1660005260076020526020604060002054604051908152f35b34610267576000366003190112610267576000546040516001600160a01b039091168152602090f35b34610267576000366003190112610267576109e7611f46565b6109ef611ef9565b6000805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b3461026757600036600319011261026757610a49611f46565b600080546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461026757610a9736611c49565b929190610aa2611f72565b610aaa611ef9565b33600052600860205260ff60406000205416156106cc576000838152600360205260409020600101546001600160a01b031615610e4d578260005260036020526040600020916005602052604060002091610b0484611f95565b610b0d84611fc9565b600583015460048401541115610e34576006830154804210610e1c575060025483546001850154604051635620c32d60e11b81526001600160a01b03928316600482018190529183166024820152909892909160209183916044918391165afa90811561060b57600091610dea575b50670de0b6b3a7640000610b9560028701549283611e5f565b049060048701549161271083810311610d6b57610bbb61271091610bd594830390611e5f565b60018901549190049930916001600160a01b031690612067565b83546002850154610bf09185906001600160a01b0316612180565b600184810154908601546040516370a0823160e01b81526001600160a01b039182166004820152929160209184916024918391165afa91821561060b57600092610db5575b50600081610c5b9394829360405192839283378101838152039082875af16104f4611e7f565b600183810154908501546040516370a0823160e01b81526001600160a01b039182166004820152929160209184916024918391165afa801561060b57600090610d81575b610ca99250611e72565b9485106105a2578154610cc591906001600160a01b03166120c2565b610cd26005820154611e0b565b908160058201556003810154420190814211610d6b57600491600682015501541115610d2b575b506040519182527e89088bf76a5e8c7f0949b234e1b713c4d71b6c75b4578745a6c711ac70189560203393a360018055005b600101805460ff60a81b198116600160a81b179091556001600160a01b031660009081526007602052604090208054610d6390611e1a565b905582610cf9565b634e487b7160e01b600052601160045260246000fd5b506020823d602011610dad575b81610d9b60209383611d8b565b8101031261026757610ca99151610c9f565b3d9150610d8e565b91506020823d602011610de2575b81610dd060209383611d8b565b81010312610267579051906000610c35565b3d9150610dc3565b90506020813d602011610e14575b81610e0560209383611d8b565b81010312610267575188610b7c565b3d9150610df8565b6024906040519063a9155b0960e01b82526004820152fd5b604051637c2dd0fd60e01b815260048101869052602490fd5b60405163c182b72d60e01b815260048101849052602490fd5b34610267576020366003190112610267576004356000818152600360205260409020600101546001600160a01b0390811615610f52578160005260036020526001604060002001805482811692833314159081610f43575b506106cc5760ff8160a81c16600481101561025157610f2a5760ff60a81b1916600160a91b17905560009081526007602052604090208054610eff90611e1a565b905533907f97729287f7ba8b32555258e73e27488f492c99bf34e2869740c56843a2ffb23b600080a3005b604051631e9c917d60e21b815260048101859052602490fd5b90506000541633141585610ebe565b60405163c182b72d60e01b815260048101839052602490fd5b3461026757600036600319011261026757602060ff60005460a01c166040519015158152f35b34610267576020366003190112610267577f2c514bdb606b8075ec8a6022ddd1f50d6a8a2e9d242c88ddd3cbe3764c2256696020600435610fd0611f46565b80600955604051908152a1005b3461026757602036600319011261026757610ff6611c33565b610ffe611f46565b6001600160a01b0316801561076c57600280546001600160a01b031916821790557f5407ae21524903b1268620a61ddba526c26493c2d0df65cea711edd9b018bca9600080a2005b3461026757602080600319360112610267576001600160a01b03611068611c33565b1660005260068152604060002060405190818382549182815201908192600052846000209060005b868282106110e65786866110a682880383611d8b565b604051928392818401908285525180915260408401929160005b8281106110cf57505050500390f35b8351855286955093810193928101926001016110c0565b835485529093019260019283019201611090565b3461026757600036600319011261026757611113611f46565b60005460ff8160a01c161561115a5760ff60a01b19166000556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b604051638dfc202b60e01b8152600490fd5b503461026757602036600319011261026757611186611e27565b50600435600052600560205260406000206040516111a381611d05565b60018060a01b03918281541692838352806001830154169060208401918252600283015460408501908152600384015491606086019283526004850154936080870194855260c0600660058801549760a08a0198895201549701968752604051978852511660208701525160408601525160608501525160808401525160a08301525160c0820152f35b34610267576020366003190112610267576001600160a01b0361124e611c33565b166000526008602052602060ff604060002054166040519015158152f35b5034610267576020366003190112610267576004356000526003602052604060002080549060018101549060028101546112e1600460038401549301549360405195865260018060a01b03811660208701526112d16040870160ff8360a01c16611c19565b60ff606087019160a81c16611c26565b608084015260a083015260c0820152f35b34610267576000366003190112610267576020600b54604051908152f35b34610267576020366003190112610267576004356000818152600360205260409020600101546001600160a01b0390811615610f525781600052600360205260406000206001810180549160ff8360a81c166004811015610251576114175760030154801590811561140d575b506113d55760ff60a81b198216600360a81b17905516600090815260076020526040902080546113ac90611e1a565b90557fc4b18028cd4e987c6f51b76fe353bf20701009babc05208e39e32044646b0557600080a2005b60405163a8c278dd60e01b815260206004820152600f60248201526e139bdd081e595d08195e1c1a5c9959608a1b6044820152606490fd5b905042108561137d565b604051631e9c917d60e21b815260048101869052602490fd5b34610267576000366003190112610267576020600954604051908152f35b346102675760203660031901126102675760043561146a611f46565b6107d0811161147857600a55005b60405162461bcd60e51b815260206004820152601160248201527043616e6e6f74206578636565642032302560781b6044820152606490fd5b3461026757366003190161010081126102675760c0136102675760c43560e4356114d9611ef9565b6114e282611f1a565b6001600160a01b03806114f3611cd9565b16158015611834575b61076c5760443580156117fb5760643580156117be57608435918215611782573360005260209560078752604060002054600954111561176a5785151580611760575b6117225761154b611cd9565b611553611cef565b9060405190898201926001600160601b03198092813360601b1686526000603486015242603586015260601b16605584015260601b16606982015283607d820152607d81526115a181611d6f565b51902095604051916115b283611d05565b8783528883019133835260408401600081526060850160008152608086019142835260a0870193845260c087019485528b60005260038d526040600020965187558a60018801965116865491516002811015610251576001600160a81b03199092161760a09190911b60ff60a01b16178555519360048510156102515760049461163b91611dad565b51600285015551600384015551910155846000526004865260406000209380611662611cd9565b166001600160601b0360a01b90818754161786556001860191611683611cef565b169082541617905560028401556003830155600482015560a43580151581036102675760056116be92019060ff801983541691151516179055565b33600052600682526116d4816040600020611dd1565b336000526007825260406000206116eb8154611e0b565b905560405160008152817f7370673d457fb4191e82186e03f9dc23b87e7116cd4e67a291ed3b6596dfd697843393a3604051908152f35b60405163a8c278dd60e01b8152602060048201526015602482015274195e1c1a5c995cd05d081a5b881d1a19481c185cdd605a1b6044820152606490fd5b504286111561153f565b604051636d8d999b60e01b8152336004820152602490fd5b60405163a8c278dd60e01b81526020600482015260136024820152727461726765745072696365206973207a65726f60681b6044820152606490fd5b60405163a8c278dd60e01b81526020600482015260146024820152736d696e416d6f756e744f7574206973207a65726f60601b6044820152606490fd5b60405163a8c278dd60e01b815260206004820152601060248201526f616d6f756e74496e206973207a65726f60801b6044820152606490fd5b508061183e611cef565b16156114fc565b50346102675736600319016101208112610267571261026757611866611ef9565b61187160e435611f1a565b6001600160a01b03611881611cd9565b16158015611c01575b61076c576044358015611bc357606435603c8110611b7d576084358015611b4257336000526007602052604060002054600954111561176a5761010435151580611b35575b611722576118db611cd9565b6118e3611cef565b906040519060208201926001600160601b03198092813360601b168652600160f81b603486015242603586015260601b16605584015260601b16606982015284607d820152607d815261193581611d6f565b519020916040519361194685611d05565b61194e611c33565b85526024356001600160a01b038116810361026757602086015260408501526060840152608083015260c43560c0830152600060a083015260c43515611b2a575b6040519161199c83611d05565b8183526020830133815260408401600181526060850190600082524260808701526101043560a087015260e43560c08701528460005260036020526040600020928651845560018060a01b03905116600184015491516002811015610251576001600160a81b03199092161760a09190911b60ff60a01b16176001830155519360048510156102515760c0600491611a3960209760018601611dad565b6080810151600285015560a0810151600385015501519101558160005260058352600660c060406000209260018060a01b038151166001600160601b0360a01b9081865416178555600185019060018060a01b0388840151169082541617905560408101516002850155606081015160038501556080810151600485015560a0810151600585015501519101553360005260068252611adc816040600020611dd1565b33600052600782526040600020611af38154611e0b565b905560405160018152817f7370673d457fb4191e82186e03f9dc23b87e7116cd4e67a291ed3b6596dfd697843393a3604051908152f35b4260c083015261198f565b50426101043511156118cf565b60405163a8c278dd60e01b8152602060048201526012602482015271746f74616c5377617073206973207a65726f60701b6044820152606490fd5b60405163a8c278dd60e01b815260206004820152601c60248201527f696e74657276616c20746f6f2073686f727420286d696e2036307329000000006044820152606490fd5b60405163a8c278dd60e01b8152602060048201526015602482015274616d6f756e7450657253776170206973207a65726f60581b6044820152606490fd5b506001600160a01b03611c12611cef565b161561188a565b9060028210156102515752565b9060048210156102515752565b600435906001600160a01b038216820361026757565b90606060031983011261026757600435916024356001600160a01b0381168103610267579160443567ffffffffffffffff9283821161026757806023830112156102675781600401359384116102675760248483010111610267576024019190565b8054821015611cc35760005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b6004356001600160a01b03811681036102675790565b6024356001600160a01b03811681036102675790565b60e0810190811067ffffffffffffffff821117611d2157604052565b634e487b7160e01b600052604160045260246000fd5b60c0810190811067ffffffffffffffff821117611d2157604052565b6080810190811067ffffffffffffffff821117611d2157604052565b60a0810190811067ffffffffffffffff821117611d2157604052565b90601f8019910116810190811067ffffffffffffffff821117611d2157604052565b90600481101561025157815460ff60a81b191660a89190911b60ff60a81b16179055565b805468010000000000000000811015611d2157611df391600182018155611cab565b819291549060031b91821b91600019901b1916179055565b6000198114610d6b5760010190565b8015610d6b576000190190565b60405190611e3482611d05565b8160c06000918281528260208201528260408201528260608201528260808201528260a08201520152565b81810292918115918404141715610d6b57565b91908203918211610d6b57565b3d15611eba573d9067ffffffffffffffff8211611d215760405191611eae601f8201601f191660200184611d8b565b82523d6000602084013e565b606090565b15611ec657565b60405162461bcd60e51b815260206004820152600b60248201526a14ddd85c0819985a5b195960aa1b6044820152606490fd5b60ff60005460a01c16611f0857565b60405163d93c066560e01b8152600490fd5b600a54808211611f28575050565b6044925060405191633b5d56ed60e11b835260048301526024820152fd5b6000546001600160a01b03163303611f5a57565b60405163118cdaa760e01b8152336004820152602490fd5b600260015414611f83576002600155565b604051633ee5aeb560e01b8152600490fd5b60ff600182015460a81c16600481101561025157611fb05750565b6024905460405190631e9c917d60e21b82526004820152fd5b6003810154801515908161205c575b50611fe05750565b60018101805460ff60a81b198116600360a81b179091556001600160a01b031660009081526007602052604090208054602492919061201e90611e1a565b90555460405190807fc4b18028cd4e987c6f51b76fe353bf20701009babc05208e39e32044646b0557600080a26335053fa960e21b82526004820152fd5b905042101538611fd8565b6040516323b872dd60e01b60208201526001600160a01b03928316602482015292909116604483015260648083019390935291815260a081019181831067ffffffffffffffff841117611d21576120c092604052612238565b565b60405190602082019263095ea7b360e01b80855260018060a01b03809216918260248601526020600080978160448901526044885261210088611d53565b87519082885af1903d8751908361215f575b50505015612122575b5050505050565b6121559461215092604051926020840152602483015260448201526044815261214a81611d53565b82612238565b612238565b388080808061211b565b91925090612176575083163b15155b388080612112565b600191501461216e565b60405163095ea7b360e01b60208083018281526001600160a01b039586166024850181905260448086019890985296845291959294916000906121c287611d53565b86519082875af1903d6000519083612217575b505050156121e4575b50505050565b61220e93612150916040519160208301526024820152600060448201526044815261214a81611d53565b388080806121de565b9192509061222e575082163b15155b3880806121d5565b6001915014612226565b906000602091828151910182855af11561060b576000513d61228b57506001600160a01b0381163b155b6122695750565b604051635274afe760e01b81526001600160a01b039091166004820152602490fd5b6001141561226256fea26469706673582212209245c9d5b6a9e297da6e8ca78f132e346c2948ac1521e373793357ed65b9cf5964736f6c63430008180033' as const
export const swappiPriceAdapterBytecode =
  '0x60803461014957601f61086b38819003918201601f19168301916001600160401b0383118484101761014e5780849260609460405283398101031261014957604061004982610164565b9161005660208201610164565b6001600160a01b03929091839161006d9101610164565b1692831561013057826000549160018060a01b03199580878516176000558260405194167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a3670de0b6b3a7640000600355169081151580610125575b156100f55750836001541617600155169060025416176002556040516106f290816101798239f35b62461bcd60e51b815260206004820152600b60248201526a5a65726f4164647265737360a81b6044820152606490fd5b5083831615156100cd565b604051631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101495756fe60806040818152600436101561001457600080fd5b600091823560e01c9081630d40886d146103a3575080634e15d2831461030b5780635bb478081461029c578063715018a6146102425780638da5cb5b1461021b578063ac41865a146101da578063c0d7865514610168578063c45a015514610140578063f2fde38b146100bb5763f887ea401461009057600080fd5b346100b757816003193601126100b75760015490516001600160a01b039091168152602090f35b5080fd5b50346100b75760203660031901126100b7576100d56103bf565b6100dd610690565b6001600160a01b03908116918215610129575082546001600160a01b0319811683178455167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08380a380f35b51631e4fbdf760e01b815260048101849052602490fd5b50346100b757816003193601126100b75760025490516001600160a01b039091168152602090f35b82346101d75760203660031901126101d7576101826103bf565b61018a610690565b6001600160a01b031661019e8115156103da565b600180546001600160a01b031916821790557f7aed1d3e8155a07ccf395e44ea3109a0e2d6c9b29bbbe9f142d9790596f4dc808280a280f35b80fd5b50346100b757806003193601126100b7576101f36103bf565b602435926001600160a01b03841684036101d7575060209261021491610472565b9051908152f35b50346100b757816003193601126100b757905490516001600160a01b039091168152602090f35b82346101d757806003193601126101d75761025b610690565b80546001600160a01b03198116825581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b82346101d75760203660031901126101d7576102b66103bf565b6102be610690565b6001600160a01b03166102d28115156103da565b600280546001600160a01b031916821790557f24cd1310c8883cbeaf5b805ab13586ce018b79c022827158ff3e8df14d3449368280a280f35b50346100b75760203660031901126100b75760043590610329610690565b811561036057816020917f1c9c437472a65d9d30272a49ca8c4f80f30703f7691e605dd789f56645b2ddb99360035551908152a180f35b5162461bcd60e51b815260206004820152601760248201527f51756f7465416d6f756e74206d757374206265203e20300000000000000000006044820152606490fd5b8390346100b757816003193601126100b7576020906003548152f35b600435906001600160a01b03821682036103d557565b600080fd5b156103e157565b60405162461bcd60e51b815260206004820152600b60248201526a5a65726f4164647265737360a81b6044820152606490fd5b90601f8019910116810190811067ffffffffffffffff82111761043657604052565b634e487b7160e01b600052604160045260246000fd5b80516001101561045c5760400190565b634e487b7160e01b600052603260045260246000fd5b60018060a01b038060025416908060409381855193849263e6a4390560e01b84521696876004840152169384602483015281604460209586935afa9081156106855790829160009161064a575b5016156106405783519467ffffffffffffffff93606087018581118882101761043657865260028752838701918636843787511561045c57829792526105048261044c565b5260019582600154169260035497875198899463d06ca61f60e01b865260448601916004870152896024870152518091526064850193926000905b888383106106265750505050505091818060009403915afa938493600095610581575b50505050156000146105745750600090565b61057d9061044c565b5190565b90919293943d8082853e6105958185610414565b83019284818503126100b75780519086821161062257019083601f830112156101d757815195861161060e578560051b9251956105d486850188610414565b865284808701938301019384116101d757508301905b8282106105ff57505050509038808080610562565b815181529083019083016105ea565b634e487b7160e01b81526041600452602490fd5b8280fd5b8551821687528c975095860195909401939083019061053f565b5050505050600090565b9091508381813d831161067e575b6106628183610414565b810103126100b757519082821682036101d757508190386104bf565b503d610658565b85513d6000823e3d90fd5b6000546001600160a01b031633036106a457565b60405163118cdaa760e01b8152336004820152602490fdfea2646970667358221220c10b223e834089e9444951c7ad37f3dafbfee5eca308265a397febeda5206ecc64736f6c63430008180033' as const
export const permitHandlerBytecode =
  '0x6080806040523461001b5760016000556106de90816100218239f35b600080fdfe6040608081526004908136101561001557600080fd5b6000803560e01c80635854e9bf146102e05763686f13fa1461003657600080fd5b346102dd576101203660031901126102dd576100506104f1565b9061005961050c565b93610062610522565b60843590606435610071610538565b610104359167ffffffffffffffff978884116102d957366023850112156102d95783870135928984116102d55736602485870101116102d5576100b2610685565b6001600160a01b039682881691821580156102cb575b6102bb57888e169333850361029c5750823b15610298579b818b829f819e9f61014a8e9f9d9e928a938e938851978896879663d505accf60e01b885260e4359560c4359589019360ff929897969360c0969260e087019a60018060a01b0380921688521660208701526040860152606085015216608083015260a08201520152565b038183885af1908161026f575b50916024979593918a9b8b989694610234575b509250505082915051948593018337810182815203925af13d1561022b573d938411610218578451936101a7601f8201601f1916602001866105f1565b84523d83602086013e5b156101d557509160016101d1935551918291602083526020830190610548565b0390f35b606490602085519162461bcd60e51b8352820152601d60248201527f4175746f6d6174696f6e4d616e616765722063616c6c206661696c65640000006044820152fd5b634e487b7160e01b835260418252602483fd5b606093506101b1565b7ff1888f4efa1fe5ad83325dd9d700a5cfee681bc32eb7ab040e1727368faf96ba92825196875260208701528a1694a4388080808e8161016a565b61028391939597999b9496989a92506105c7565b61029857918c8b989694929997959338610157565b8a80fd5b8d516308f14ec160e11b81529081906102b790828e01610588565b0390fd5b8c5163d92e233d60e01b81528a90fd5b50888816156100c8565b8880fd5b8780fd5b80fd5b509190346104ed576101003660031901126104ed576102fd6104f1565b9261030661050c565b9361030f610522565b906064359160843590610320610538565b91610329610685565b6001600160a01b03848116999093908a1580156104e3575b6104d357848116953387036104b8575086156104a8578a3b156102d957885163d505accf60e01b81526001600160a01b039182168b82019081529185166020830152604082018890526060820184905260ff92909216608082015260c43560a082015260e43560c08201528790829081900360e00181838e5af19081610495575b5061045b5750505050508060033d1161044b575b506308c379a014610413575b6084928151926308f14ec160e11b8452830152602482015260076044820152663ab735b737bbb760c91b6064820152fd5b61041b610613565b8061042657506103e2565b816102b792519485946308f14ec160e11b865285015260248401526044830190610548565b90508281803e5160e01c386103d6565b88927ff1888f4efa1fe5ad83325dd9d700a5cfee681bc32eb7ab040e1727368faf96ba928892835197885260208801521694a46001815580f35b6104a1909791976105c7565b95386103c2565b8851631f2a200560e01b81528a90fd5b89516308f14ec160e11b81529081906102b790828e01610588565b885163d92e233d60e01b81528a90fd5b5084841615610341565b8280fd5b600435906001600160a01b038216820361050757565b600080fd5b602435906001600160a01b038216820361050757565b604435906001600160a01b038216820361050757565b60a4359060ff8216820361050757565b919082519283825260005b848110610574575050826000602080949584010152601f8019910116010190565b602081830181015184830182015201610553565b6001600160a01b0390911681526040602082018190526014908201527337bbb732b91036bab9ba1031329031b0b63632b960611b606082015260800190565b67ffffffffffffffff81116105db57604052565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff8211176105db57604052565b600060443d1061067157604051600319913d83016004833e815167ffffffffffffffff918282113d6024840111176106745781840194855193841161067c573d850101602084870101116106745750610671929101602001906105f1565b90565b949350505050565b50949350505050565b600260005414610696576002600055565b604051633ee5aeb560e01b8152600490fdfea264697066735822122048df7123008527f31c193ab0b904724dd3c10843f6afd019948c9ebbc518411964736f6c63430008180033' as const
export const erc20BaseBytecode =
  '0x61018060409080825234620004f157620020968038038091620000238285620004f6565b8339810191608082840312620004f15781516001600160401b039290838111620004f15784620000559183016200053f565b916020948583015190858211620004f157620000739184016200053f565b8183015160609093015190946001600160a01b03821693848303620004f15783519784890189811084821117620003f1578552600191828a52818a0192603160f81b84528851858111620003f15760038054918383811c93168015620004e6575b86841014620004d057601f9283811162000485575b508086848211600114620004135760009162000407575b5060001982841b1c191690841b1781555b8b5191878311620003f15760049c8d548581811c91168015620003e6575b88821014620003d1578e83821162000386575b50508d879285116001146200031b57509383949184926000956200030f575b50501b92600019911b1c19161789555b8015620002f85760805262000186876200075c565b95610140968752620001988a62000904565b97610160988952828151910120926101009a848c525190209261012099848b524660c052875194848601927f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f84528987015260608601524660808601523060a086015260a0855260c085019585871090871117620002e357508487528351902060a0523060e05215620002a25750505080620002386200024b926200059a565b5062000244816200061b565b50620006be565b50519261161a948562000a5c863960805185818161087801526109f1015260a0518561104a015260c05185611116015260e0518561101401525184611099015251836110bf0152518261056b015251816105950152f35b610104606493927f4552433230426173653a2061646d696e206973207a65726f20616464726573739262461bcd60e51b85528060c483015260e48201520152fd5b604190634e487b7160e01b6000525260246000fd5b855163392e1e2760e01b81526000818b0152602490fd5b01519350388062000161565b929190601f1985169360005284886000209460005b8a898383106200036e575050501062000353575b50505050811b01895562000171565b01519060f884600019921b161c191690553880808062000344565b86860151895590970196948501948893500162000330565b600052876000208380870160051c8201928a8810620003c7575b0160051c019086905b828110620003ba5750508e62000142565b60008155018690620003a9565b92508192620003a0565b60228f634e487b7160e01b6000525260246000fd5b90607f16906200012f565b634e487b7160e01b600052604160045260246000fd5b90508c01513862000100565b8592508d90601f1983169185600052896000209260005b8b8282106200046457505084116200044b575b505050811b01815562000111565b015160001983861b60f8161c1916905538808e6200043d565b929484849395979892960151815501940192018f909188959493926200042a565b82600052866000208480840160051c820192898510620004c6575b0160051c019085905b828110620004b9575050620000e9565b60008155018590620004a9565b92508192620004a0565b634e487b7160e01b600052602260045260246000fd5b92607f1692620000d4565b600080fd5b601f909101601f19168101906001600160401b03821190821017620003f157604052565b60005b8381106200052e5750506000910152565b81810151838201526020016200051d565b81601f82011215620004f15780516001600160401b038111620003f1576040519262000576601f8301601f191660200185620004f6565b81845260208284010111620004f1576200059791602080850191016200051a565b90565b6001600160a01b031660008181527fec8156718a8372b1db44bb411437d0870f3e3790d4a08526d024ce1b0b668f6b602052604081205490919060ff16620006175781805260096020526040822081835260205260408220600160ff198254161790553391600080516020620020768339815191528180a4600190565b5090565b6001600160a01b031660008181527fd5d09b8f3165a736d25b1a14611612ac91830c1b82012b1c33b2dac7c90a064960205260408120549091907f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a69060ff16620006b95780835260096020526040832082845260205260408320600160ff1982541617905560008051602062002076833981519152339380a4600190565b505090565b6001600160a01b031660008181527f84574a31e2f767388bfa57bc81ff2590df95d3022c04c363cca3e37ee960863160205260408120549091907f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff16620006b95780835260096020526040832082845260205260408320600160ff1982541617905560008051602062002076833981519152339380a4600190565b805160209081811015620007da5750601f8251116200079857808251920151908083106200078957501790565b82600019910360031b1b161790565b604490620007cc9260405193849263305a27a960e01b8452806004850152825192839182602487015286860191016200051a565b601f01601f19168101030190fd5b906001600160401b038211620003f157600654926001938481811c91168015620008f9575b83821014620004d057601f8111620008bf575b5081601f841160011462000853575092829391839260009462000847575b50501b916000199060031b1c19161760065560ff90565b01519250388062000830565b919083601f198116600660005284600020946000905b88838310620008a457505050106200088a575b505050811b0160065560ff90565b015160001960f88460031b161c191690553880806200087c565b85870151885590960195948501948793509081019062000869565b600660005284601f84600020920160051c820191601f860160051c015b828110620008ec57505062000812565b60008155018590620008dc565b90607f1690620007ff565b805160209081811015620009315750601f8251116200079857808251920151908083106200078957501790565b906001600160401b038211620003f157600754926001938481811c9116801562000a50575b83821014620004d057601f811162000a16575b5081601f8411600114620009aa57509282939183926000946200099e575b50501b916000199060031b1c19161760075560ff90565b01519250388062000987565b919083601f198116600760005284600020946000905b88838310620009fb5750505010620009e1575b505050811b0160075560ff90565b015160001960f88460031b161c19169055388080620009d3565b858701518855909601959485019487935090810190620009c0565b600760005284601f84600020920160051c820191601f860160051c015b82811062000a4357505062000969565b6000815501859062000a33565b90607f16906200095656fe608060408181526004918236101561001657600080fd5b600092833560e01c91826301ffc9a714610be65750816306fdde0314610b0b578163095ea7b314610ae157816318160ddd14610ac257816323b872dd14610a85578163248a9ca314610a5a5781632f2ff15d14610a30578163313ce56714610a14578163355274ea146109d95781633644e515146109b557816336568abe1461096f5781633f4ba83a1461090557816340c10f19146107b257816342966c68146107945781635c975abb1461077057816370a082311461073957816379cc6790146107065781637ecebe00146106ce5781638456cb591461067357816384b0196e1461055357816391d148541461050c57816395d89b411461041c578163a217fddf14610401578163a9059cbb146103d0578163d505accf14610268578163d53913931461022d578163d547741f146101e957508063dd62ed3e146101a15763e63ab1e91461016457600080fd5b3461019d578160031936011261019d57602090517f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a8152f35b5080fd5b503461019d578060031936011261019d57806020926101be610c79565b6101c6610c94565b6001600160a01b0391821683526001865283832091168252845220549051908152f35b919050346102295780600319360112610229576102259135610220600161020e610c94565b93838752600960205286200154610f6b565b61113c565b5080f35b8280fd5b50503461019d578160031936011261019d57602090517f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a68152f35b8391503461019d5760e036600319011261019d57610284610c79565b61028c610c94565b906044359260643560843560ff811681036103cc578142116103b55760018060a01b0390818516928389526008602052898920908154916001830190558a519060208201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98452868d840152858a1660608401528a608084015260a083015260c082015260c0815260e0810181811067ffffffffffffffff8211176103a2578b525190206103709161036791610341611011565b908c519161190160f01b83526002830152602282015260c43591604260a43592206114cf565b9092919261155f565b16818103610387578661038487878761125a565b80f35b87516325c0072360e11b815292830152602482015260449150fd5b634e487b7160e01b8b526041875260248bfd5b875163313c898160e11b8152808401839052602490fd5b8680fd5b50503461019d578060031936011261019d576020906103fa6103f0610c79565b6024359033610e0b565b5160018152f35b50503461019d578160031936011261019d5751908152602090f35b91905034610229578260031936011261022957805183819490845461044081610caa565b91828552602096600192886001821691826000146104e2575050600114610487575b858861048389610474848a0385610d16565b51928284938452830190610c39565b0390f35b815286935091907f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b5b8284106104ca575050508201018161047461048338610462565b8054848a0186015288955087949093019281016104b0565b60ff19168882015294151560051b8701909401945085935061047492506104839150389050610462565b9050346102295781600319360112610229578160209360ff9261052d610c94565b90358252600986528282206001600160a01b039091168252855220549151911615158152f35b9190503461022957826003193601126102295761058f7f000000000000000000000000000000000000000000000000000000000000000061130b565b926105b97f000000000000000000000000000000000000000000000000000000000000000061140f565b90825192602092602085019585871067ffffffffffffffff8811176106605750926020610616838896610609998b9996528686528151998a99600f60f81b8b5260e0868c015260e08b0190610c39565b91898303908a0152610c39565b924660608801523060808801528460a088015286840360c088015251928381520193925b82811061064957505050500390f35b83518552869550938101939281019260010161063a565b634e487b7160e01b845260419052602483fd5b50503461019d578160031936011261019d5760207f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258916106b1610ef1565b6106b96112ed565b600160ff19600554161760055551338152a180f35b50503461019d57602036600319011261019d5760209181906001600160a01b036106f6610c79565b1681526008845220549051908152f35b50503461019d5736600319011261073657610384610722610c79565b60243590610731823383610d38565b6111b3565b80fd5b50503461019d57602036600319011261019d5760209181906001600160a01b03610761610c79565b16815280845220549051908152f35b50503461019d578160031936011261019d5760209060ff6005541690519015158152f35b83903461019d57602036600319011261019d576103849035336111b3565b919050346102295780600319360112610229576107cd610c79565b602435907f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6808652600960205283862033875260205260ff8487205416156108e757506001600160a01b03169081156108d0576108286112ed565b6002548181018091116108bd57602086927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef926002558484528382528584208181540190558551908152a36002547f0000000000000000000000000000000000000000000000000000000000000000918282116108a3578480f35b5163279e7e1560e21b815292830152602482015260449150fd5b634e487b7160e01b865260118552602486fd5b825163ec442f0560e01b8152808501869052602490fd5b835163e2517d3f60e01b815233818701526024810191909152604490fd5b90503461022957826003193601126102295761091f610ef1565b6005549060ff821615610961575060ff1916600555513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a180f35b8251638dfc202b60e01b8152fd5b83833461019d578060031936011261019d57610989610c94565b90336001600160a01b038316036109a6575061022591923561113c565b5163334bd91960e11b81528390fd5b50503461019d578160031936011261019d576020906109d2611011565b9051908152f35b50503461019d578160031936011261019d57602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b50503461019d578160031936011261019d576020905160128152f35b919050346102295780600319360112610229576102259135610a55600161020e610c94565b610f91565b9050346102295760203660031901126102295781602093600192358152600985522001549051908152f35b50503461019d57606036600319011261019d576020906103fa610aa6610c79565b610aae610c94565b60443591610abd833383610d38565b610e0b565b50503461019d578160031936011261019d576020906002549051908152f35b50503461019d578060031936011261019d576020906103fa610b01610c79565b602435903361125a565b8284346107365780600319360112610736578151918282600354610b2e81610caa565b9081845260209560019187600182169182600014610bbf575050600114610b63575b5050506104839291610474910385610d16565b9190869350600383527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b5b828410610ba75750505082010181610474610483610b50565b8054848a018601528895508794909301928101610b8e565b60ff19168782015293151560051b8601909301935084925061047491506104839050610b50565b849134610229576020366003190112610229573563ffffffff60e01b81168091036102295760209250637965db0b60e01b8114908115610c28575b5015158152f35b6301ffc9a760e01b14905083610c21565b919082519283825260005b848110610c65575050826000602080949584010152601f8019910116010190565b602081830181015184830182015201610c44565b600435906001600160a01b0382168203610c8f57565b600080fd5b602435906001600160a01b0382168203610c8f57565b90600182811c92168015610cda575b6020831014610cc457565b634e487b7160e01b600052602260045260246000fd5b91607f1691610cb9565b6040810190811067ffffffffffffffff821117610d0057604052565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff821117610d0057604052565b9160018060a01b038093169160009383855260016020526040938486209183169182875260205284862054926000198410610d77575b50505050505050565b848410610ddb57508015610dc3578115610dab57855260016020528385209085526020520391205538808080808080610d6e565b8451634a1406b160e11b815260048101879052602490fd5b845163e602df0560e01b815260048101879052602490fd5b8551637dc7a0d960e11b81526001600160a01b039190911660048201526024810184905260448101859052606490fd5b916001600160a01b03808416928315610ed85716928315610ebf57610e2e6112ed565b60009083825281602052604082205490838210610e8d575091604082827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef958760209652828652038282205586815220818154019055604051908152a3565b60405163391434e360e21b81526001600160a01b03919091166004820152602481019190915260448101839052606490fd5b60405163ec442f0560e01b815260006004820152602490fd5b604051634b637e8f60e11b815260006004820152602490fd5b3360009081527f84574a31e2f767388bfa57bc81ff2590df95d3022c04c363cca3e37ee960863160205260409020547f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff1615610f4d5750565b6044906040519063e2517d3f60e01b82523360048301526024820152fd5b80600052600960205260406000203360005260205260ff6040600020541615610f4d5750565b906000918083526009602052604083209160018060a01b03169182845260205260ff6040842054161560001461100c5780835260096020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b505090565b307f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161480611113575b1561106c577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f82527f000000000000000000000000000000000000000000000000000000000000000060408201527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260a0815260c0810181811067ffffffffffffffff821117610d005760405251902090565b507f00000000000000000000000000000000000000000000000000000000000000004614611043565b906000918083526009602052604083209160018060a01b03169182845260205260ff60408420541660001461100c578083526009602052604083208284526020526040832060ff1981541690557ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b339380a4600190565b906001600160a01b038216908115610ed8576111cd6112ed565b600092828452836020526040842054908282106112285750817fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef926020928587528684520360408620558060025403600255604051908152a3565b60405163391434e360e21b81526001600160a01b03919091166004820152602481019190915260448101829052606490fd5b6001600160a01b039081169182156112d457169182156112bb5760207f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925918360005260018252604060002085600052825280604060002055604051908152a3565b604051634a1406b160e11b815260006004820152602490fd5b60405163e602df0560e01b815260006004820152602490fd5b60ff600554166112f957565b60405163d93c066560e01b8152600490fd5b60ff81146113495760ff811690601f8211611337576040519161132d83610ce4565b8252602082015290565b604051632cd44ac360e21b8152600490fd5b5060405160065481600061135c83610caa565b808352926020906001908181169081156113eb575060011461138a575b505061138792500382610d16565b90565b91509260066000527ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f936000925b8284106113d357506113879450505081016020013880611379565b855487850183015294850194869450928101926113b8565b9150506020925061138794915060ff191682840152151560051b8201013880611379565b60ff81146114315760ff811690601f8211611337576040519161132d83610ce4565b5060405160075481600061144483610caa565b808352926020906001908181169081156113eb575060011461146e57505061138792500382610d16565b91509260076000527fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c688936000925b8284106114b757506113879450505081016020013880611379565b8554878501830152948501948694509281019261149c565b91907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0841161155357926020929160ff608095604051948552168484015260408301526060820152600092839182805260015afa156115475780516001600160a01b0381161561153e57918190565b50809160019190565b604051903d90823e3d90fd5b50505060009160039190565b60048110156115ce5780611571575050565b6001810361158b5760405163f645eedf60e01b8152600490fd5b600281036115ac5760405163fce698f760e01b815260048101839052602490fd5b6003146115b65750565b602490604051906335e2f38360e21b82526004820152fd5b634e487b7160e01b600052602160045260246000fdfea26469706673582212208d6507bd0169dff0338696c69007f0768ccc393a37fc8867a17a1cf1290bc7ca64736f6c634300081800332f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d' as const
export const erc721BaseBytecode =
  '0x604060a0815234620004db57620026d1803803806200001e81620004e0565b928339810160c082820312620004db5781516001600160401b039290838111620004db57826200005091830162000506565b916020908183015190858211620004db576200006e91840162000506565b85830151620000806060850162000578565b6080850151956001600160601b03871695868803620004db5760a0620000a7910162000578565b90805194898611620004c5576000958654906001938483811c93168015620004ba575b8a841014620003c3578190601f9384811162000467575b508a9084831160011462000402578a92620003f6575b5050600019600383901b1c191690841b1787555b8151918b8311620003e25783548481811c91168015620003d7575b8a821014620003c357908183859493116200036e575b50899183116001146200030a578892620002fe575b5050600019600383901b1c191690821b1790555b6001600160a01b039281841615620002b05780156200026257608052620001a49062000191816200058d565b506200019d816200060e565b50620006b1565b50169485158015620001d0575b8751611f61908162000750823960805181818161023801526103940152f35b6127108086116200024557506200022d57865191828801918211838310176200021957508652848152015260a01b6001600160a01b03191617600c5538808080808080620001b1565b634e487b7160e01b81526041600452602490fd5b8651635b6cc80560e11b815260048101839052602490fd5b856044918a5191636f483d0960e01b835260048301526024820152fd5b895162461bcd60e51b815260048101879052602160248201527f455243373231426173653a206d6178537570706c79206d757374206265203e206044820152600360fc1b6064820152608490fd5b895162461bcd60e51b815260048101879052602160248201527f455243373231426173653a2061646d696e206973207a65726f206164647265736044820152607360f81b6064820152608490fd5b01519050388062000151565b8489528989208594509190601f1984168a5b8c8282106200035757505084116200033d575b505050811b01905562000165565b015160001960f88460031b161c191690553880806200032f565b83850151865588979095019493840193016200031c565b909192508489528989208380860160051c8201928c8710620003b9575b91869588929594930160051c01915b828110620003aa5750506200013c565b8b81558695508791016200039a565b925081926200038b565b634e487b7160e01b89526022600452602489fd5b90607f169062000126565b634e487b7160e01b88526041600452602488fd5b015190503880620000f7565b8a80528b8b208794509190601f1984168c8e5b8282106200044f575050841162000435575b505050811b0187556200010b565b015160001960f88460031b161c1916905538808062000427565b8385015186558a979095019493840193018e62000415565b9091508980528a8a208480850160051c8201928d8610620004b0575b918891869594930160051c01915b828110620004a1575050620000e1565b8c815585945088910162000491565b9250819262000483565b92607f1692620000ca565b634e487b7160e01b600052604160045260246000fd5b600080fd5b6040519190601f01601f191682016001600160401b03811183821017620004c557604052565b919080601f84011215620004db5782516001600160401b038111620004c5576020906200053c601f8201601f19168301620004e0565b92818452828287010111620004db5760005b8181106200056457508260009394955001015290565b85810183015184820184015282016200054e565b51906001600160a01b0382168203620004db57565b6001600160a01b031660008181527fe710864318d4a32f37d6ce54cb3fadbef648dd12d8dbdf53973564d56b7f881c602052604081205490919060ff166200060a57818052600e6020526040822081835260205260408220600160ff198254161790553391600080516020620026b18339815191528180a4600190565b5090565b6001600160a01b031660008181527ffc2ff4086eabd76dbcc4dfadf31e7eddf5c878012eab6736c3b5e33f6766000e60205260408120549091907f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a69060ff16620006ac57808352600e6020526040832082845260205260408320600160ff19825416179055600080516020620026b1833981519152339380a4600190565b505090565b6001600160a01b031660008181527f0746d22269a00cc56ea7d4eae993d6e8ba105d071f8caeb6f80d9cc718adb88960205260408120549091907f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff16620006ac57808352600e6020526040832082845260205260408320600160ff19825416179055600080516020620026b1833981519152339380a460019056fe608080604052600436101561001357600080fd5b60003560e01c90816301ffc9a7146116565750806304634d8d146115af57806306fdde0314611504578063081812fc146114c6578063095ea7b3146113df57806318160ddd146113c157806323b872dd146113aa578063248a9ca31461137b5780632a55205a146112ea5780632f2ff15d146112ab5780632f745c591461122757806336568abe146111e05780633f4ba83a1461117657806342842e0e1461114857806342966c6814610e8e5780634f6ccce714610e385780635944c75314610d635780635c975abb14610d405780636352211e14610d1057806370a0823114610ce55780638456cb5914610c8b57806391d1485414610c3e57806395d89b4114610b5b578063a217fddf14610b3f578063a22cb46514610a9a578063b88d4fde14610a2e578063c87b56dd1461093b578063d204c45e146102d7578063d53913931461029c578063d547741f1461025b578063d5abeb0114610220578063e63ab1e9146101e55763e985e9c51461018a57600080fd5b346101e05760403660031901126101e0576101a3611729565b6101ab61173f565b9060018060a01b03809116600052600560205260406000209116600052602052602060ff604060002054166040519015158152f35b600080fd5b346101e05760003660031901126101e05760206040517f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a8152f35b346101e05760003660031901126101e05760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346101e05760403660031901126101e05761029a60043561027a61173f565b9080600052600e602052610295600160406000200154611c67565b611d48565b005b346101e05760003660031901126101e05760206040517f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a68152f35b346101e05760403660031901126101e0576102f0611729565b67ffffffffffffffff602435116101e0573660236024350112156101e05767ffffffffffffffff60243560040135116101e05736602480356004013581350101116101e0573360009081527ffc2ff4086eabd76dbcc4dfadf31e7eddf5c878012eab6736c3b5e33f6766000e60205260409020547f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a69060ff161561091d57506008547f000000000000000000000000000000000000000000000000000000000000000011156108d857600f549060001982146107e95760018201600f55604051906103da826117e6565b600082526001600160a01b0391818316156108bf576103f7611f0d565b83600052600260205282604060002054168015908115610888575b848416600052600360205260406000206001815401905585600052600260205260406000208585166001600160601b0360a01b82541617905585858516827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef600080a481156107ff5760085486600052600960205280604060002055600160401b81101561064357866104ae8260016104c79401600855611b4b565b90919082549060031b91821b91600019901b1916179055565b848416036107a2575b1561078957813b610659575b5050506104f436602435600401356024803501611840565b81600052600a60205260406000209181519267ffffffffffffffff84116106435761051f8154611877565b93601f85116105fb575b602094508493601f821160011461059857938192939460009261058d575b50508160011b916000199060031b1c19161790555b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce782604051838152a1604051908152f35b015190508580610547565b601f1982169483600052866000209160005b8781106105e45750836001959697106105cb575b505050811b01905561055c565b015160001960f88460031b161c191690558580806105be565b9192886001819286850151815501940192016105aa565b816000526020600020601f820160051c81019560208310610639575b601f0160051c01945b85811061062d5750610529565b60008155600101610620565b9095508590610617565b634e487b7160e01b600052604160045260246000fd5b6040939192935160208180610697630a85bd0160e11b9586835233600484015260006024840152876044840152608060648401526084830190611755565b038160008989165af160009181610744575b5061070e575050503d600014610706573d916106c483611824565b926106d26040519485611802565b83523d6000602085013e5b825192836106ff57604051633250574960e11b81528284166004820152602490fd5b6020849101fd5b6060916106dd565b9193916001600160e01b0319160361072a5750508180806104dc565b604051633250574960e11b81529116600482015260249150fd5b9091506020813d602011610781575b8161076060209383611802565b810103126101e057516001600160e01b0319811681036101e05790866106a9565b3d9150610753565b6040516339e3563760e11b815260006004820152602490fd5b6107ab83611b98565b60001981019081116107e9578484166000526006602052604060002081600052602052856040600020558560005260076020526040600020556104d0565b634e487b7160e01b600052601160045260246000fd5b83851681146104c75761081181611b98565b8660005260076020526040600020549082600052600660205260406000209181810361085b575b5087600052600760205260006040812055600052602052600060408120556104c7565b81600052826020526040600020548160005280604060002055600052600760205260406000205588610838565b600086815260046020526040902080546001600160a01b031916905580600052600360205260406000206000198154019055610412565b604051633250574960e11b815260006004820152602490fd5b60405162461bcd60e51b815260206004820152601e60248201527f455243373231426173653a206d617820737570706c79207265616368656400006044820152606490fd5b6044906040519063e2517d3f60e01b82523360048301526024820152fd5b346101e0576020806003193601126101e05760043561095981611c8d565b50600052600a815260406000209060405191826000825461097981611877565b9384845260019186600182169182600014610a0c5750506001146109cd575b50506109a692500383611802565b60006040516109b4816117e6565b526109c9604051928284938452830190611755565b0390f35b85925060005281600020906000915b8583106109f45750506109a693508201018580610998565b805483890185015287945086939092019181016109dc565b92509350506109a694915060ff191682840152151560051b8201018580610998565b346101e05760803660031901126101e057610a47611729565b610a4f61173f565b906044356064359267ffffffffffffffff84116101e057366023850112156101e057610a8861029a943690602481600401359101611840565b92610a948383836118b1565b33611dbf565b346101e05760403660031901126101e057610ab3611729565b602435908115158092036101e0576001600160a01b0316908115610b2657336000526005602052604060002082600052602052604060002060ff1981541660ff83161790556040519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b604051630b61174360e31b815260048101839052602490fd5b346101e05760003660031901126101e057602060405160008152f35b346101e05760003660031901126101e057604051600060018260015492610b8184611877565b9283835260209485600182169182600014610c1e575050600114610bc1575b50610bad92500383611802565b6109c9604051928284938452830190611755565b84915060016000527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6906000915b858310610c06575050610bad935082010185610ba0565b80548389018501528794508693909201918101610bef565b60ff191685820152610bad95151560051b8501019250879150610ba09050565b346101e05760403660031901126101e057610c5761173f565b600435600052600e60205260406000209060018060a01b0316600052602052602060ff604060002054166040519015158152f35b346101e05760003660031901126101e057610ca4611c0b565b610cac611f0d565b600160ff19600b541617600b557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a1005b346101e05760203660031901126101e0576020610d08610d03611729565b611b98565b604051908152f35b346101e05760203660031901126101e0576020610d2e600435611c8d565b6040516001600160a01b039091168152f35b346101e05760003660031901126101e057602060ff600b54166040519015158152f35b346101e05760603660031901126101e057600435610d7f61173f565b604435906001600160601b0382168092036101e057610d9c611bd1565b612710808311610e1457506001600160a01b03908116928315610df55760405193610dc6856117ca565b845260208085019384526000918252600d9052604090209251915160a01b6001600160a01b0319169116179055005b60449060405190634b4f842960e11b8252600482015260006024820152fd5b83606491846040519263dfd1fc1b60e01b8452600484015260248301526044820152fd5b346101e05760203660031901126101e057600435600854811015610e6f57610e61602091611b4b565b90546040519160031b1c8152f35b6044906040519063295f44f760e21b8252600060048301526024820152fd5b346101e0576020806003193601126101e057600435610eab611f0d565b60008181526002835260409020546001600160a01b039081169033151590816110a1575b505080158015908161106e575b6000848152600286526040812080546001600160a01b03191690558490847fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8280a415610fe9575050600854816000526009835280604060002055600160401b81101561064357816104ae826001610f579401600855611b4b565b600854600019928382019182116107e95760099083600052818152610f8160406000205493611b4b565b90549060031b1c610f95816104ae86611b4b565b60005252604060002055600052600060408120556008548015610fd357810190610fbe82611b4b565b909182549160031b1b19169055600855600080f35b634e487b7160e01b600052603160045260246000fd5b610ff4575b50610f57565b610ffd81611b98565b82600052600784526040600020549160005260068452604060002091818103611043575b5082600052600784526000604081205560005282526000604081205582610fee565b8160005282855260406000205481600052806040600020556000526007855260406000205584611021565b60008481526004602052604080822080546001600160a01b03191690558482526003875290208054600019019055610edc565b816110f0575b50156110b4578380610ecf565b6110d05760249060405190637e27328960e01b82526004820152fd5b60405163177e802f60e01b81523360048201526024810191909152604490fd5b33831491508115611124575b811561110a575b50846110a7565b905082600052600484523390604060002054161484611103565b90508160005260058452604060002033600052845260ff60406000205416906110fc565b346101e05761029a61115936611795565b9060405192611167846117e6565b60008452610a948383836118b1565b346101e05760003660031901126101e05761118f611c0b565b600b5460ff8116156111ce5760ff1916600b557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6020604051338152a1005b604051638dfc202b60e01b8152600490fd5b346101e05760403660031901126101e0576111f961173f565b336001600160a01b038216036112155761029a90600435611d48565b60405163334bd91960e11b8152600490fd5b346101e05760403660031901126101e057611240611729565b6024359061124d81611b98565b8210156112805760018060a01b031660005260066020526040600020906000526020526020604060002054604051908152f35b60405163295f44f760e21b81526001600160a01b039190911660048201526024810191909152604490fd5b346101e05760403660031901126101e05761029a6004356112ca61173f565b9080600052600e6020526112e5600160406000200154611c67565b611cc8565b346101e05760403660031901126101e057602435600435600052600d6020526040600020549060018060a01b038083169260a01c908315611361575b506001600160601b0316908181029181830414901517156107e957604080516001600160a01b03939093168352612710909104602083015290f35b600c54908116935060a01c90506001600160601b03611326565b346101e05760203660031901126101e057600435600052600e6020526020600160406000200154604051908152f35b346101e05761029a6113bb36611795565b916118b1565b346101e05760003660031901126101e0576020600854604051908152f35b346101e05760403660031901126101e0576113f8611729565b60243561140481611c8d565b331515806114b3575b80611486575b61146e576001600160a01b039283169282918491167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925600080a4600090815260046020526040902080546001600160a01b0319169091179055005b60405163a9fbf51f60e01b8152336004820152602490fd5b5060018060a01b038116600052600560205260406000203360005260205260ff6040600020541615611413565b506001600160a01b03811633141561140d565b346101e05760203660031901126101e0576004356114e381611c8d565b506000526004602052602060018060a01b0360406000205416604051908152f35b346101e05760003660031901126101e05760405160008054908261152783611877565b9182825260209360019085600182169182600014610c1e5750506001146115555750610bad92500383611802565b6000808052859250907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b858310611597575050610bad935082010185610ba0565b80548389018501528794508693909201918101611580565b346101e05760403660031901126101e0576115c8611729565b602435906001600160601b0382168083036101e0576115e5611bd1565b6127108082116116385750506001600160a01b031690811561161f5761160c6040516117ca565b60a01b6001600160a01b03191617600c55005b604051635b6cc80560e11b815260006004820152602490fd5b6044925060405191636f483d0960e01b835260048301526024820152fd5b346101e05760203660031901126101e0576004359063ffffffff60e01b82168092036101e057602091637965db0b60e01b8114908115611698575b5015158152f35b63152a902d60e11b8114915081156116b2575b5083611691565b632483248360e11b8114915081156116cc575b50836116ab565b63780e9d6360e01b8114915081156116e6575b50836116c5565b6380ac58cd60e01b811491508115611718575b8115611707575b50836116df565b6301ffc9a760e01b14905083611700565b635b5e139f60e01b811491506116f9565b600435906001600160a01b03821682036101e057565b602435906001600160a01b03821682036101e057565b919082519283825260005b848110611781575050826000602080949584010152601f8019910116010190565b602081830181015184830182015201611760565b60609060031901126101e0576001600160a01b039060043582811681036101e0579160243590811681036101e0579060443590565b6040810190811067ffffffffffffffff82111761064357604052565b6020810190811067ffffffffffffffff82111761064357604052565b90601f8019910116810190811067ffffffffffffffff82111761064357604052565b67ffffffffffffffff811161064357601f01601f191660200190565b92919261184c82611824565b9161185a6040519384611802565b8294818452818301116101e0578281602093846000960137010152565b90600182811c921680156118a7575b602083101461189157565b634e487b7160e01b600052602260045260246000fd5b91607f1691611886565b6001600160a01b03828116939184156108bf576118cc611f0d565b600094838652602095600287526040968488832054169633151580611abd575b5087158015611a8a575b84845260038352898420805460010190558784526002835289842080546001600160a01b0319168617905587858a7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8780a415611a1e5760085487845260098352808a852055600160401b811015611a0a57876104ae82600161197c9401600855611b4b565b8388036119b8575b5050505016928383036119975750505050565b6064945051926364283d7b60e01b8452600484015260248301526044820152fd5b6119c190611b98565b6000198101939084116119f65782916007918a9452600681528383208584528152878484205587835252205538808080611984565b634e487b7160e01b83526011600452602483fd5b634e487b7160e01b84526041600452602484fd5b87841461197c57611a2e88611b98565b878452600783528984205490898552600684528a852091818103611a68575b5088855260078452848b81205584528252828981205561197c565b8186528285528b862054818752808d8820558652600785528b86205538611a4d565b600088815260046020526040902080546001600160a01b03191690558884526003835289842080546000190190556118f6565b80611b0a575b15611ace57386118ec565b888789611aeb576024915190637e27328960e01b82526004820152fd5b905163177e802f60e01b81523360048201526024810191909152604490fd5b503388148015611b2f575b80611ac357508683526004825233868a8520541614611ac3565b5087835260058252888320338452825260ff8984205416611b15565b600854811015611b825760086000527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30190600090565b634e487b7160e01b600052603260045260246000fd5b6001600160a01b03168015611bb857600052600360205260406000205490565b6040516322718ad960e21b815260006004820152602490fd5b3360009081527fe710864318d4a32f37d6ce54cb3fadbef648dd12d8dbdf53973564d56b7f881c602052604081205460ff161561091d5750565b3360009081527f0746d22269a00cc56ea7d4eae993d6e8ba105d071f8caeb6f80d9cc718adb88960205260409020547f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff161561091d5750565b80600052600e60205260406000203360005260205260ff604060002054161561091d5750565b6000818152600260205260409020546001600160a01b0316908115611cb0575090565b60249060405190637e27328960e01b82526004820152fd5b90600091808352600e602052604083209160018060a01b03169182845260205260ff60408420541615600014611d4357808352600e6020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b505090565b90600091808352600e602052604083209160018060a01b03169182845260205260ff604084205416600014611d4357808352600e602052604083208284526020526040832060ff1981541690557ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b339380a4600190565b90939192833b611dd1575b5050505050565b604051630a85bd0160e11b8082526001600160a01b039384166004830152958316602482015260448101919091526080606482015294921692602092918590611e1e906084830190611755565b039483816000978189895af1869181611ec9575b50611e93575050503d600014611e8a573d611e4c81611824565b90611e5a6040519283611802565b81528093823d92013e5b82519283611e8557604051633250574960e11b815260048101849052602490fd5b019050fd5b60609250611e64565b919450915063ffffffff60e01b1603611eb157503880808080611dca565b60249060405190633250574960e11b82526004820152fd5b9091508481813d8311611f06575b611ee18183611802565b81010312611f0257516001600160e01b031981168103611f02579038611e32565b8680fd5b503d611ed7565b60ff600b5416611f1957565b60405163d93c066560e01b8152600490fdfea2646970667358221220c125e93fffb491e4d63a4bb728a348a79864763c4e345f5a124761f9e65f4df364736f6c634300081800332f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d' as const
export const erc1155BaseBytecode =
  '0x608060405234620004f45762002e7e803803806200001d81620004f9565b9283398101608082820312620004f45781516001600160401b039290838111620004f457826200004f9183016200051f565b60209283830151858111620004f457816200006c9185016200051f565b906040840151868111620004f4576060916200008a9186016200051f565b930151936001600160a01b03851692838603620004f457845193878511620002de57600254946001968787811c97168015620004e9575b85881014620002bd578190601f9788811162000492575b50859088831160011462000428576000926200041c575b5050600019600383901b1c191690871b176002555b15620003cc57805190878211620002de57600a54908682811c92168015620003c1575b84831014620002bd5781868493116200036a575b5083908683116001146200030057600092620002f4575b5050600019600383901b1c191690851b17600a555b8151958611620002de57600b548481811c91168015620002d3575b82821014620002bd5783811162000271575b5080928611600114620002025750620001e59492600092849283620001f6575b50501b916000199060031b1c191617600b555b620001d28162000591565b50620001de8162000612565b50620006b5565b5060405161270a9081620007548239f35b015192503880620001b4565b909491601f19831695600b60005282600020926000905b8882106200025957505083620001e597106200023f575b505050811b01600b55620001c7565b015160001960f88460031b161c1916905538808062000230565b80878596829496860151815501950193019062000219565b600b600052816000208480890160051c820192848a10620002b3575b0160051c019085905b828110620002a657505062000194565b6000815501859062000296565b925081926200028d565b634e487b7160e01b600052602260045260246000fd5b90607f169062000182565b634e487b7160e01b600052604160045260246000fd5b01519050388062000152565b90879350601f19831691600a600052856000209260005b8782821062000353575050841162000339575b505050811b01600a5562000167565b015160001960f88460031b161c191690553880806200032a565b8385015186558b9790950194938401930162000317565b909150600a600052836000208680850160051c820192868610620003b7575b918991869594930160051c01915b828110620003a75750506200013b565b6000815585945089910162000397565b9250819262000389565b91607f169162000127565b60405162461bcd60e51b815260048101839052602260248201527f45524331313535426173653a2061646d696e206973207a65726f206164647265604482015261737360f01b6064820152608490fd5b015190503880620000ef565b90899350601f198316916002600052876000209260005b898282106200047b575050841162000461575b505050811b0160025562000104565b015160001960f88460031b161c1916905538808062000452565b8385015186558d979095019493840193016200043f565b9091506002600052856000208880850160051c820192888610620004df575b918b91869594930160051c01915b828110620004cf575050620000d8565b600081558594508b9101620004bf565b92508192620004b1565b96607f1696620000c1565b600080fd5b6040519190601f01601f191682016001600160401b03811183821017620002de57604052565b919080601f84011215620004f45782516001600160401b038111620002de5760209062000555601f8201601f19168301620004f9565b92818452828287010111620004f45760005b8181106200057d57508260009394955001015290565b858101830151848201840152820162000567565b6001600160a01b031660008181527f5eff886ea0ce6ca488a3d6e336d6c0f75f46d19b42c06ce5ee98e42c96d256c7602052604081205490919060ff166200060e5781805260086020526040822081835260205260408220600160ff19825416179055339160008051602062002e5e8339815191528180a4600190565b5090565b6001600160a01b031660008181527f51a495916474fe1a0c0fcfb65a8a97682b84a054118858cdd1f5dfd7fc0919eb60205260408120549091907f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a69060ff16620006b05780835260086020526040832082845260205260408320600160ff1982541617905560008051602062002e5e833981519152339380a4600190565b505090565b6001600160a01b031660008181527f62e8532f45d82220ddea5da89acccbf142e829ab973b22f3386ec35cb0f9290160205260408120549091907f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff16620006b05780835260086020526040832082845260205260408320600160ff1982541617905560008051602062002e5e833981519152339380a460019056fe6080604052600436101561001257600080fd5b60003560e01c8062fdd58e1461023657806301ffc9a71461023157806302fe53051461022c57806304634d8d1461022757806306fdde03146102225780630e89341c1461021d57806318160ddd146102185780631f7fdffa14610213578063248a9ca31461020e5780632a55205a146102095780632eb2c2d6146102045780632f2ff15d146101ff57806336568abe146101fa57806337da577c146101f55780633f4ba83a146101f05780634e1273f4146101eb5780634f558e79146101e65780635944c753146101e15780635c975abb146101dc5780636b20c454146101d7578063731133e9146101d25780638456cb59146101cd578063869f7594146101c857806391d14854146101c357806395d89b41146101be578063a217fddf146101b9578063a22cb465146101b4578063bd85b039146101af578063d5391393146101aa578063d547741f146101a5578063e63ab1e9146101a0578063e985e9c51461019b578063f242432a146101965763f5298aca1461019157600080fd5b6117d1565b6116e5565b611694565b611659565b61161a565b6115df565b6115b3565b6114f7565b6114db565b611433565b6113e1565b6113b5565b61135b565b611283565b611198565b611175565b611072565b611044565b610f8a565b610edb565b610e2c565b610de5565b610da6565b610c80565b610ade565b610aaf565b6108ca565b61087c565b6107b3565b6106ca565b61050a565b6103ae565b6102df565b610280565b600435906001600160a01b038216820361025157565b600080fd5b602435906001600160a01b038216820361025157565b35906001600160a01b038216820361025157565b346102515760403660031901126102515760206102c461029e61023b565b6024356000526000835260406000209060018060a01b0316600052602052604060002090565b54604051908152f35b6001600160e01b031981160361025157565b346102515760203660031901126102515760206004356102fe816102cd565b63ffffffff60e01b16637965db0b60e01b8114908115610324575b506040519015158152f35b63152a902d60e11b81149150811561033e575b5038610319565b636cdb3d1360e11b811491508115610370575b811561035f575b5038610337565b6301ffc9a760e01b14905038610358565b6303a24d0760e21b81149150610351565b9181601f84011215610251578235916001600160401b038311610251576020838186019501011161025157565b3461025157602080600319360112610251576001600160401b03600435818111610251576103e36103f2913690600401610381565b6103eb6119a7565b3691610c2e565b9182519182116104d9576104108261040b6002546105ea565b611af4565b602090601f83116001146104525750819061044293600092610447575b50508160011b916000199060031b1c19161790565b600255005b01519050388061042d565b90601f1983169361048560026000527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90565b926000905b8682106104c157505083600195106104a8575b505050811b01600255005b015160001960f88460031b161c1916905538808061049d565b8060018596829496860151815501950193019061048a565b610624565b602435906001600160601b038216820361025157565b604435906001600160601b038216820361025157565b346102515760403660031901126102515761052361023b565b61052b6104de565b906105346119a7565b6001600160601b0382166127108082116105cc5750506001600160a01b038116156105b35761058a6105b19261057a61056b610b74565b6001600160a01b039094168452565b6001600160601b03166020830152565b805160209091015160a01b6001600160a01b0319166001600160a01b039190911617600655565b005b604051635b6cc80560e11b815260006004820152602490fd5b6044925060405191636f483d0960e01b835260048301526024820152fd5b90600182811c9216801561061a575b602083101461060457565b634e487b7160e01b600052602260045260246000fd5b91607f16916105f9565b634e487b7160e01b600052604160045260246000fd5b602081019081106001600160401b038211176104d957604052565b90601f801991011681019081106001600160401b038211176104d957604052565b919082519283825260005b8481106106a2575050826000602080949584010152601f8019910116010190565b602081830181015184830182015201610681565b9060206106c7928181520190610676565b90565b34610251576000806003193601126107b0576040519080600a54906106ee826105ea565b80855291602091600191828116908115610783575060011461072b575b6107278661071b81880382610655565b604051918291826106b6565b0390f35b9350600a84527fc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a85b8385106107705750505050810160200161071b826107273861070b565b8054868601840152938201938101610753565b90508695506107279693506020925061071b94915060ff191682840152151560051b82010192933861070b565b80fd5b3461025157602080600319360112610251576040516000916002546107d7816105ea565b8084529060019081811690811561085c5750600114610801575b6107278461071b81880382610655565b600260009081529294507f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace5b82841061084957505050816107279361071b92820101936107f1565b805485850187015292850192810161082d565b60ff1916858501525050151560051b820101915061071b816107276107f1565b34610251576000366003190112610251576020600554604051908152f35b9181601f84011215610251578235916001600160401b038311610251576020808501948460051b01011161025157565b34610251576080366003190112610251576108e361023b565b6001600160401b03906024358281116102515761090490369060040161089a565b6044929192358481116102515761091f90369060040161089a565b9460643590811161025157610938903690600401610381565b949092610943611a7b565b60648111610a6a5760005b818110610a4057509161096a6109729261097a95943691610baa565b963691610baa565b933691610c2e565b916001600160a01b03821615610a275761099581858461225c565b600091825b85518410156109e8576109e06001918560051b906109ce6020808489010151938b0101516000526004602052604060002090565b6109d9838254611b66565b9055611b66565b93019261099a565b82866109ff6109fa8894600554611b66565b600555565b8051600103610a1d57906020806105b19593015191015191336121f0565b6105b19333611ff6565b604051632bfa23e760e11b815260006004820152602490fd5b80610a64610a5160019385876118a9565b35610a5d838c896118a9565b3590611b73565b0161094e565b60405162461bcd60e51b815260206004820152601c60248201527f45524331313535426173653a20626174636820746f6f206c61726765000000006044820152606490fd5b346102515760203660031901126102515760043560005260086020526020600160406000200154604051908152f35b346102515760403660031901126102515760243560043560005260076020526040600020549060018060a01b038083169260a01c908315610b5a575b506001600160601b031690818102918183041490151715610b5557604080516001600160a01b03939093168352612710909104602083015290f35b6118be565b600654908116935060a01c90506001600160601b03610b1a565b60405190604082018281106001600160401b038211176104d957604052565b6001600160401b0381116104d95760051b60200190565b9291610bb582610b93565b91610bc36040519384610655565b829481845260208094019160051b810192831161025157905b828210610be95750505050565b81358152908301908301610bdc565b9080601f83011215610251578160206106c793359101610baa565b6001600160401b0381116104d957601f01601f191660200190565b929192610c3a82610c13565b91610c486040519384610655565b829481845281830111610251578281602093846000960137010152565b9080601f83011215610251578160206106c793359101610c2e565b346102515760a036600319011261025157610c9961023b565b610ca1610256565b90604435916001600160401b039081841161025157610cc560049436908601610bf8565b9060643583811161025157610cdd9036908701610bf8565b9260843590811161025157610cf59036908701610c65565b936001600160a01b03808216903382141580610d82575b610d5557831615610d3d5715610d26576105b19550611de3565b604051626a0d4560e21b8152600081880152602490fd5b604051632bfa23e760e11b8152600081890152602490fd5b6040805163711bec9160e11b815233818b019081526001600160a01b038616602082015290918291010390fd5b50600082815260016020908152604080832033845290915290205460ff1615610d0c565b34610251576040366003190112610251576105b1600435610dc5610256565b90806000526008602052610de0600160406000200154611ad3565b611bec565b3461025157604036600319011261025157610dfe610256565b336001600160a01b03821603610e1a576105b190600435611c86565b60405163334bd91960e11b8152600490fd5b3461025157604036600319011261025157602435600435610e4b6119a7565b81158015610ec3575b15610e7057610e6d906000526009602052604060002090565b55005b60405162461bcd60e51b815260206004820152602560248201527f45524331313535426173653a206361702062656c6f772063757272656e7420736044820152647570706c7960d81b6064820152608490fd5b50806000526004602052604060002054821015610e54565b3461025157600036600319011261025157610ef46119ff565b60035460ff811615610f335760ff19166003557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6020604051338152a1005b604051638dfc202b60e01b8152600490fd5b90815180825260208080930193019160005b828110610f65575050505090565b835185529381019392810192600101610f57565b9060206106c7928181520190610f45565b34610251576040366003190112610251576004356001600160401b038082116102515736602383011215610251578160040135610fc681610b93565b92610fd46040519485610655565b8184526020916024602086019160051b8301019136831161025157602401905b82821061102d5785602435868111610251576107279161101b611021923690600401610bf8565b906118e8565b60405191829182610f79565b8380916110398461026c565b815201910190610ff4565b3461025157602036600319011261025157600435600052600460205260206040600020541515604051908152f35b346102515760603660031901126102515760043561108e610256565b6110966104f4565b61109e6119a7565b6127106001600160601b0382168181116111515750506001600160a01b03821615611131576105b1926110f8611108926110e86110d9610b74565b6001600160a01b039096168652565b6001600160601b03166020850152565b6000526007602052604060002090565b815160209092015160a01b6001600160a01b0319166001600160a01b0392909216919091179055565b604051634b4f842960e11b81526004810184905260006024820152604490fd5b60649185916040519263dfd1fc1b60e01b8452600484015260248301526044820152fd5b3461025157600036600319011261025157602060ff600354166040519015158152f35b34610251576060366003190112610251576111b161023b565b6001600160401b03602435818111610251576111d1903690600401610bf8565b90604435908111610251576111ea903690600401610bf8565b906001600160a01b038316338114158061125f575b6112385715611220576105b192600060405161121a8161063a565b52611d18565b604051626a0d4560e21b815260006004820152602490fd5b60405163711bec9160e11b81523360048201526001600160a01b0385166024820152604490fd5b50600081815260016020908152604080832033845290915290205460ff16156111ff565b346102515760803660031901126102515761129c61023b565b6044356024356064356001600160401b038111610251576112c46112d6913690600401610381565b6112cc611a7b565b6103eb8585611b73565b916001600160a01b03841615610a275761130d60405192600184526020840152604083019160018352606084015260808301604052565b61131a818386949661225c565b600091825b85518410156109e8576113536001918560051b906109ce6020808489010151938b0101516000526004602052604060002090565b93019261131f565b34610251576000366003190112610251576113746119ff565b61137c611f16565b600160ff1960035416176003557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a1005b346102515760203660031901126102515760043560005260096020526020604060002054604051908152f35b3461025157604036600319011261025157602060ff611427611401610256565b6004356000526008845260406000209060018060a01b0316600052602052604060002090565b54166040519015158152f35b34610251576000806003193601126107b0576040519080600b5490611457826105ea565b808552916020916001918281169081156107835750600114611483576107278661071b81880382610655565b9350600b84527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db95b8385106114c85750505050810160200161071b826107273861070b565b80548686018401529382019381016114ab565b3461025157600036600319011261025157602060405160008152f35b346102515760403660031901126102515761151061023b565b6024359081151590818303610251576001600160a01b03811692831561159b5761155c61156d9233600052600160205260406000209060018060a01b0316600052602052604060002090565b9060ff801983541691151516179055565b6040519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b60405162ced3e160e81b815260006004820152602490fd5b346102515760203660031901126102515760043560005260046020526020604060002054604051908152f35b346102515760003660031901126102515760206040517f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a68152f35b34610251576040366003190112610251576105b1600435611639610256565b90806000526008602052611654600160406000200154611ad3565b611c86565b346102515760003660031901126102515760206040517f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a8152f35b3461025157604036600319011261025157602060ff6114276116b461023b565b6116bc610256565b6001600160a01b0391821660009081526001865260408082209290931681526020919091522090565b346102515760a0366003190112610251576116fe61023b565b611706610256565b6084356001600160401b03811161025157611725903690600401610c65565b906001600160a01b038381169033821415806117ad575b61178657821615610a275715611220576105b19261177e6064356044359160405192600184526020840152604083019160018352606084015260808301604052565b929091611de3565b60405163711bec9160e11b81523360048201526001600160a01b0386166024820152604490fd5b50600082815260016020908152604080832033845290915290205460ff161561173c565b34610251576060366003190112610251576117ea61023b565b6001600160a01b038116338114158061186f575b6118485715611220576105b1906118396044356024359160405192600184526020840152604083019160018352606084015260808301604052565b91600060405161121a8161063a565b60405163711bec9160e11b81523360048201526001600160a01b0383166024820152604490fd5b50600081815260016020908152604080832033845290915290205460ff16156117fe565b634e487b7160e01b600052603260045260246000fd5b91908110156118b95760051b0190565b611893565b634e487b7160e01b600052601160045260246000fd5b80518210156118b95760209160051b010190565b9190918051835180820361198557505080519061191d61190783610b93565b926119156040519485610655565b808452610b93565b60209190601f1901368484013760005b815181101561197d57600581901b8281018401519087018401516000908152602081815260408083206001600160a01b03909416835292905220546001919061197682876118d4565b520161192d565b509193505050565b604051635b05999160e01b815260048101919091526024810191909152604490fd5b3360009081527f5eff886ea0ce6ca488a3d6e336d6c0f75f46d19b42c06ce5ee98e42c96d256c7602052604090205460ff16156119e057565b60405163e2517d3f60e01b815233600482015260006024820152604490fd5b3360009081527f62e8532f45d82220ddea5da89acccbf142e829ab973b22f3386ec35cb0f92901602052604090207f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a9060ff905b541615611a5d5750565b6044906040519063e2517d3f60e01b82523360048301526024820152fd5b3360009081527f51a495916474fe1a0c0fcfb65a8a97682b84a054118858cdd1f5dfd7fc0919eb602052604090207f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a69060ff90611a53565b6000818152600860209081526040808320338452909152902060ff90611a53565b601f8111611b00575050565b60009060026000527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace906020601f850160051c83019410611b5c575b601f0160051c01915b828110611b5157505050565b818155600101611b45565b9092508290611b3c565b91908201809211610b5557565b60005260096020526040600020549081611b8b575050565b6004602052604060002054908101809111610b555711611ba757565b60405162461bcd60e51b815260206004820152601f60248201527f45524331313535426173653a206d617820737570706c792072656163686564006044820152606490fd5b600090808252600860205260ff611c1884604085209060018060a01b0316600052602052604060002090565b5416611c80578082526008602090815260408084206001600160a01b038616600090815292529020805460ff1916600117905533926001600160a01b0316917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d9080a4600190565b50905090565b600090808252600860205260ff611cb284604085209060018060a01b0316600052602052604060002090565b541615611c80578082526008602090815260408084206001600160a01b038616600090815292529020805460ff1916905533926001600160a01b0316917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9080a4600190565b929192611d26848383612396565b6001600160a01b031615611d8d575b6000805b8251821015611d79576001908260051b90611d6a602080848a01015193870101516000526004602052604060002090565b82815403905501910190611d39565b915050611d8b91925060055403600555565b565b6000805b8251821015611dcd57611dc56001918360051b906109ce602080848b01015193880101516000526004602052604060002090565b910190611d91565b611dde91506109fa90600554611b66565b611d35565b91939290611df382868386612504565b6001600160a01b0383811615611eb2575b81161580611e51575b15611e1a575b5050505050565b8451600103611e4057602080611e369601519201519233612225565b3880808080611e13565b611e4c949192336120f1565b611e36565b94936000939091845b8651861015611e9a576001908660051b90611e8b602080848a010151938b0101516000526004602052604060002090565b82815403905501950194611e5a565b611ead9193969792955060055403600555565b611e0d565b959192600094916000955b8751871015611ef957611ef16001918860051b906109ce602080848c010151938d0101516000526004602052604060002090565b960195611ebd565b611f11919396506109fa909892959498600554611b66565b611e04565b60ff60035416611f2257565b60405163d93c066560e01b8152600490fd5b9081602091031261025157516106c7816102cd565b92611f786106c79593611f869360018060a01b031686526000602087015260a0604087015260a0860190610f45565b908482036060860152610f45565b916080818403910152610676565b93906106c79593611f7891611f869460018060a01b03809216885216602087015260a0604087015260a0860190610f45565b3d15611ff1573d90611fd782610c13565b91611fe56040519384610655565b82523d6000602084013e565b606090565b9293919093843b612008575050505050565b60209161202b604051948593849363bc197c8160e01b9889865260048601611f49565b038160006001600160a01b0388165af1600091816120c0575b506120835782612052611fc6565b805191908261207c57604051632bfa23e760e11b81526001600160a01b0383166004820152602490fd5b6020915001fd5b6001600160e01b0319160361209d57503880808080611e13565b604051632bfa23e760e11b81526001600160a01b03919091166004820152602490fd5b6120e391925060203d6020116120ea575b6120db8183610655565b810190611f34565b9038612044565b503d6120d1565b939290949194853b612106575b505050505050565b612129602093604051958694859463bc197c8160e01b998a875260048701611f94565b038160006001600160a01b0388165af16000918161216b575b506121505782612052611fc6565b6001600160e01b0319160361209d57503880808080806120fe565b61218591925060203d6020116120ea576120db8183610655565b9038612142565b909260a0926106c79594600180861b0316835260006020840152604083015260608201528160808201520190610676565b91926106c795949160a094600180871b038092168552166020840152604083015260608201528160808201520190610676565b9293919093843b612202575050505050565b60209161202b604051948593849363f23a6e6160e01b988986526004860161218c565b939290949194853b61223957505050505050565b612129602093604051958694859463f23a6e6160e01b998a8752600487016121bd565b919091612267611f16565b825182519081810361198557505060005b83518110156122f657600581901b84810160209081015191850101516001929184906001600160a01b0382166122b2575b50505001612278565b6122ec916122cd6122e4926000526000602052604060002090565b9060018060a01b0316600052602052604060002090565b918254611b66565b90553883816122a9565b50916001815114600014612357576020908101519181015160408051938452918301526001600160a01b039092169160009133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f629190819081015b0390a4565b7f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb6123526000939460405191829160018060a01b0316963395836126af565b9291906123a1611f16565b805182519081810361198557505060005b815181101561246557600581901b82810160209081015191850101516001600160a01b0387166123e7575b50506001016123b2565b6123ff876122cd846000526000602052604060002090565b5481811061242e57876122cd60019594936124269303936000526000602052604060002090565b5590386123dd565b6040516303dee4c560e01b81526001600160a01b038916600482015260248101919091526044810182905260648101839052608490fd5b50906000929391600181511484146124c5576020908101519181015160408051938452918301526001600160a01b039092169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f629181908101612352565b6040516001600160a01b039093169233927f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb92829161235291836126af565b93929161250f611f16565b805183519081810361198557505060005b815181101561260e57600581901b82810160209081015191860101516001600160a01b0392918590898516612588575b6001948216612563575b50505001612520565b61257e916122cd6122e4926000526000602052604060002090565b905538848161255a565b91929390506125a5896122cd846000526000602052604060002090565b548381106125d757918691846001969594036125cf8c6122cd856000526000602052604060002090565b559450612550565b6040516303dee4c560e01b81526001600160a01b038b16600482015260248101919091526044810184905260648101839052608490fd5b508051939493919291600103612670576020908101519181015160408051938452918301526001600160a01b03928316939092169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f629181908101612352565b6040516001600160a01b03938416949093169233927f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb92829161235291835b90916126c66106c793604084526040840190610f45565b916020818403910152610f4556fea26469706673582212201c4eaa7ed891d606a62b7509f8932f31b72ba5233f03d71d19d2c4420a6555f064736f6c634300081800332f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d' as const
export const wrappedCfxBytecode =
  '0x6080806040523461001657610743908161001c8239f35b600080fdfe60406080815260049081361015610028575b5050361561001e57600080fd5b6100266106c4565b005b600091823560e01c90816306fdde03146103c1578163095ea7b31461035057816318160ddd1461033557816323b872dd146103035781632e1a7d4d146101d6578163313ce567146101ba57816370a082311461018357816395d89b411461014157508063a9059cbb1461010f578063d0e30db0146100f55763dd62ed3e0361001157346100f157806003193601126100f157806020926100c6610481565b6100ce61049c565b6001600160a01b0391821683526001865283832091168252845220549051908152f35b5080fd5b828060031936011261010c576101096106c4565b80f35b80fd5b50346100f157806003193601126100f15760209061013861012e610481565b602435903361052e565b90519015158152f35b9190503461017f578260031936011261017f5761017b9250610161610402565b918252630ae868cb60e31b60208301525191829182610438565b0390f35b8280fd5b5050346100f15760203660031901126100f15760209181906001600160a01b036101ab610481565b16815280845220549051908152f35b5050346100f157816003193601126100f1576020905160128152f35b9190503461017f57602090816003193601126102ff57838080808635338252818752610207818784205410156104b2565b33825281875285822061021b8282546104fe565b905585518181527f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65883392a2335af13d156102fa5767ffffffffffffffff3d8181116102e757835191601f8201601f19908116603f01168301908111838210176102d4578452815285843d92013e5b15610293578380f35b5162461bcd60e51b815291820152601960248201527f574346583a20434658207472616e73666572206661696c656400000000000000604482015260649150fd5b634e487b7160e01b885260418752602488fd5b634e487b7160e01b875260418652602487fd5b61028a565b8380fd5b5050346100f15760603660031901126100f157602090610138610324610481565b61032c61049c565b6044359161052e565b5050346100f157816003193601126100f15751478152602090f35b5050346100f157806003193601126100f1576020918161036e610481565b91602435918291338152600187528181209460018060a01b0316948582528752205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b5050346100f157816003193601126100f15761017b906103df610402565b90600b82526a0aee4c2e0e0cac840868cb60ab1b60208301525191829182610438565b604051906040820182811067ffffffffffffffff82111761042257604052565b634e487b7160e01b600052604160045260246000fd5b6020808252825181830181905290939260005b82811061046d57505060409293506000838284010152601f8019910116010190565b81810186015184820160400152850161044b565b600435906001600160a01b038216820361049757565b600080fd5b602435906001600160a01b038216820361049757565b156104b957565b60405162461bcd60e51b815260206004820152601a60248201527f574346583a20696e73756666696369656e742062616c616e63650000000000006044820152606490fd5b9190820391821161050b57565b634e487b7160e01b600052601160045260246000fd5b9190820180921161050b57565b6001600160a01b03918216929190831561067f571690600090828252602091808352604090610562838383205410156104b2565b3385036105c4575b908082867fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef969594528085528181206105a48582546104fe565b9055878152808552206105b8838254610521565b905551908152a3600190565b8481526001845281812033825284528181205460001981036105e7575b5061056a565b83811061063b5791809161061e857fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9796956104fe565b8782526001865282822033835286528282205591929394506105e1565b825162461bcd60e51b815260048101869052601c60248201527f574346583a20696e73756666696369656e7420616c6c6f77616e6365000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601e60248201527f574346583a207472616e7366657220746f207a65726f206164647265737300006044820152606490fd5b33600052600060205260406000206106dd348254610521565b90556040513481527fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c60203392a256fea264697066735822122044d24c990e626fe470b4d6464fb06707811290eb415cfb770f78c25f46c5d2a864736f6c63430008180033' as const
export const stakingRewardsBytecode =
  '0x60c034620001fc57601f6200149438819003918201601f191683019291906001600160401b0384118385101762000201578160609284926040968752833981010312620001fc57620000518162000217565b906200006d83620000656020840162000217565b920162000217565b60016000556001600160a01b03908116929091908315620001e457600180546001600160a01b03198116861790915585519484929183167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a31692831562000197575016908115620001485760805260a0525161126790816200022d8239608051818181610274015281816104b7015281816106a4015281816107e60152818161099401528181610bf50152610d83015260a05181818161032f015281816105630152818161081001528181610ab70152610d470152f35b825162461bcd60e51b815260206004820152602260248201527f5374616b696e67526577617264733a207a65726f207265776172647320746f6b60448201526132b760f11b6064820152608490fd5b62461bcd60e51b815260206004820152602260248201527f5374616b696e67526577617264733a207a65726f207374616b696e6720746f6b60448201526132b760f11b6064820152608490fd5b8451631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203620001fc5756fe6040608081526004908136101561001557600080fd5b600091823560e01c80628cc26214610f935780630700037d14610f5b57806318160ddd14610f3c5780631c1f78eb14610f18578063246132f914610cce5780632e1a7d4d14610b51578063386a952514610b345780633d18b91214610a5b57806370a0823114610a23578063715018a6146109c357806372f702f31461097f5780637b0a47ee1461096057806380faa57d146109435780638980f11f146107b15780638b876347146107795780638da5cb5b14610750578063a694fc3a146105d5578063c8f33c91146105b6578063cd3daf9d14610592578063d1af0c7d1461054e578063db2e21bc1461045c578063df136d651461043d578063e9fad8ee146101e8578063ebe2b12b146101c55763f2fde38b1461013357600080fd5b346101c15760203660031901126101c15761014c610fb9565b90610155611137565b6001600160a01b039182169283156101ab575050600154826bffffffffffffffffffffffff60a01b821617600155167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08380a380f35b51631e4fbdf760e01b8152908101849052602490fd5b8280fd5b5050346101e457816003193601126101e4576020906002549051908152f35b5080fd5b50346101c157826003193601126101c157338352602090600a82528284205461020f611163565b6102176110e0565b6006556102226110ce565b6005553315159182610419575b81156103d657338652600a8452818587205410610388575061025381600954610fd4565b600955338552600a835283852061026b828254610fd4565b905561029881337f0000000000000000000000000000000000000000000000000000000000000000611186565b83519081527f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5833392a2600184556102ce611163565b6102d66110e0565b6006556102e16110ce565b600555610364575b33835260088152818320908154928484610305575b6001815580f35b7fe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486935561035384337f0000000000000000000000000000000000000000000000000000000000000000611186565b519283523392a238808080846102fe565b61036d33611037565b338452600882528284205560065460078252828420556102e9565b845162461bcd60e51b8152908101849052602260248201527f5374616b696e67526577617264733a20696e73756666696369656e74207374616044820152616b6560f01b6064820152608490fd5b845162461bcd60e51b8152908101849052601a60248201527f5374616b696e67526577617264733a20776974686472617720300000000000006044820152606490fd5b61042233611037565b3387526008855285872055600654600785528587205561022f565b5050346101e457816003193601126101e4576020906006549051908152f35b5090346101c157826003193601126101c157610476611163565b338352600a6020528083205491821561050c575061049682600954610fd4565b600955338352600a6020528281812055600860205282818120556104db82337f0000000000000000000000000000000000000000000000000000000000000000611186565b519081527f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d560203392a26001815580f35b6020606492519162461bcd60e51b8352820152601e60248201527f5374616b696e67526577617264733a206e6f7468696e67207374616b656400006044820152fd5b5050346101e457816003193601126101e457517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5050346101e457816003193601126101e4576020906105af6110e0565b9051908152f35b5050346101e457816003193601126101e4576020906005549051908152f35b509190346101e4576020806003193601126101c1578335916105f5611163565b6105fd6110e0565b6006556106086110ce565b6005553361072c575b82156106e9576106238360095461102a565b600955338452600a825280842061063b84825461102a565b905580516323b872dd60e01b838201523360248201523060448201526064808201859052815260a0810167ffffffffffffffff8111828210176106d65782916106c8917f9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d9594527f00000000000000000000000000000000000000000000000000000000000000006111c9565b519283523392a26001815580f35b634e487b7160e01b865260418752602486fd5b5162461bcd60e51b815280850191909152601760248201527f5374616b696e67526577617264733a207374616b6520300000000000000000006044820152606490fd5b61073533611037565b33855260088352818520556006546007835281852055610611565b5050346101e457816003193601126101e45760015490516001600160a01b039091168152602090f35b5050346101e45760203660031901126101e45760209181906001600160a01b036107a1610fb9565b1681526007845220549051908152f35b508290346101e457826003193601126101e4576107cc610fb9565b602435916107d8611137565b6001600160a01b03828116917f0000000000000000000000000000000000000000000000000000000000000000821683146108eb57817f000000000000000000000000000000000000000000000000000000000000000016831461089357509461086d8461088d937f8c1256b8896378cd5044f80c202f9772b9d77dc85c8a6eb51967210b09bfaa2897986001541690611186565b516001600160a01b03909216825260208201929092529081906040820190565b0390a180f35b608490602088519162461bcd60e51b8352820152602c60248201527f5374616b696e67526577617264733a2063616e6e6f74207265636f766572207260448201526b32bbb0b93239903a37b5b2b760a11b6064820152fd5b608490602088519162461bcd60e51b8352820152602c60248201527f5374616b696e67526577617264733a2063616e6e6f74207265636f766572207360448201526b3a30b5b4b733903a37b5b2b760a11b6064820152fd5b5050346101e457816003193601126101e4576020906105af6110ce565b5050346101e457816003193601126101e4576020906003549051908152f35b5050346101e457816003193601126101e457517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b8334610a205780600319360112610a20576109dc611137565b600180546001600160a01b0319811690915581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b80fd5b5050346101e45760203660031901126101e45760209181906001600160a01b03610a4b610fb9565b168152600a845220549051908152f35b5050346101e457816003193601126101e457610a75611163565b610a7d6110e0565b600655610a886110ce565b60055533610b0e575b3382526008602052808220908282549283610aaf575b506001815580f35b55610adb82337f0000000000000000000000000000000000000000000000000000000000000000611186565b519081527fe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e048660203392a238808281610aa7565b610b1733611037565b338352600860205281832055600654600760205281832055610a91565b50346101c157826003193601126101c15760209250549051908152f35b5090346101c15760209081600319360112610cca57823592610b71611163565b610b796110e0565b600655610b846110ce565b60055533610ca6575b8315610c6557338552600a8352838286205410610c195750907f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d591610bd484600954610fd4565b600955338552600a8252808520610bec858254610fd4565b90556106c884337f0000000000000000000000000000000000000000000000000000000000000000611186565b82608492519162461bcd60e51b8352820152602260248201527f5374616b696e67526577617264733a20696e73756666696369656e74207374616044820152616b6560f01b6064820152fd5b82606492519162461bcd60e51b8352820152601a60248201527f5374616b696e67526577617264733a20776974686472617720300000000000006044820152fd5b610caf33611037565b33865260088452828620556006546007845282862055610b8d565b8380fd5b509190346101e457806003193601126101e4578235602435610cee611137565b610cf66110e0565b600655610d016110ce565b6005558015610ed55780855560025481428211610ea557610d2391508361100a565b6003555b82516370a0823160e01b81523081870152602095906001600160a01b03907f000000000000000000000000000000000000000000000000000000000000000082168882602481845afa918215610e9b578892610e68575b5081927f00000000000000000000000000000000000000000000000000000000000000001614610e54575b50610db7836003549261100a565b10610dfd57507f6c07ee05dcf262f13abf9d87b846ee789d2f90fe991d495acd7d7fc109ee1f55939442600555610dee824261102a565b6002558351928352820152a180f35b835162461bcd60e51b8152908101869052602b60248201527f5374616b696e67526577617264733a207265776172642072617465206578636560448201526a6564732062616c616e636560a81b6064820152608490fd5b610e62915060095490610fd4565b38610da9565b9091508881813d8311610e94575b610e808183611096565b81010312610e9057519038610d7e565b8780fd5b503d610e76565b87513d8a823e3d90fd5b610ec8610ec2610eb9610ecd944290610fd4565b60035490610ff7565b8561102a565b61100a565b600355610d27565b825162461bcd60e51b8152602081870152601d60248201527f5374616b696e67526577617264733a207a65726f206475726174696f6e0000006044820152606490fd5b509134610a205780600319360112610a2057506105af602092600354905490610ff7565b5050346101e457816003193601126101e4576020906009549051908152f35b5050346101e45760203660031901126101e45760209181906001600160a01b03610f83610fb9565b1681526008845220549051908152f35b5050346101e45760203660031901126101e4576020906105af610fb4610fb9565b611037565b600435906001600160a01b0382168203610fcf57565b600080fd5b91908203918211610fe157565b634e487b7160e01b600052601160045260246000fd5b81810292918115918404141715610fe157565b8115611014570490565b634e487b7160e01b600052601260045260246000fd5b91908201809211610fe157565b6110939060018060a01b031660406000828152600a602052670de0b6b3a76400006110828383205461107c61106a6110e0565b87865260076020528686205490610fd4565b90610ff7565b04928152600860205220549061102a565b90565b90601f8019910116810190811067ffffffffffffffff8211176110b857604052565b634e487b7160e01b600052604160045260246000fd5b60025480421060001461109357504290565b600954801561113057600654611103610eb96110fa6110ce565b60055490610fd4565b670de0b6b3a764000090818102918183041490151715610fe1576110939261112a9161100a565b9061102a565b5060065490565b6001546001600160a01b0316330361114b57565b60405163118cdaa760e01b8152336004820152602490fd5b600260005414611174576002600055565b604051633ee5aeb560e01b8152600490fd5b60405163a9059cbb60e01b60208201526001600160a01b039290921660248301526044808301939093529181526111c7916111c2606483611096565b6111c9565b565b906000602091828151910182855af115611225576000513d61121c57506001600160a01b0381163b155b6111fa5750565b604051635274afe760e01b81526001600160a01b039091166004820152602490fd5b600114156111f3565b6040513d6000823e3d90fdfea2646970667358221220140121244057026eee375fe04e6cc870cb414af376f4b6ea1262c36d37a74f7064736f6c63430008180033' as const
export const vestingScheduleBytecode =
  '0x60a0346101a957601f6111a038819003918201601f191683019291906001600160401b038411838510176101ae5781606092849260409687528339810103126101a95761004b816101c4565b906100638361005c602084016101c4565b92016101c4565b60016000556001600160a01b0390811691821561019157600180546001600160a01b03198082168617909255865195919484929183167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a31693841561014f57501691821561010b57608052600254161760025551610fc790816101d9823960805181818160d7015281816103cc01528181610436015281816106e701526108700152f35b835162461bcd60e51b815260206004820152601660248201527f56657374696e673a207a65726f207472656173757279000000000000000000006044820152606490fd5b62461bcd60e51b815260206004820152601360248201527f56657374696e673a207a65726f20746f6b656e000000000000000000000000006044820152606490fd5b8451631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101a95756fe6080604052600436101561001257600080fd5b60003560e01c8063209535e514610d2d57806333bf5cf214610d0757806346ca424114610caf5780635689141214610c9157806361d027b314610c685780636213b7fd146107f657806367d42a8b14610629578063715018a6146105cc57806377889776146105185780638da5cb5b146104ef578063b75c7dc6146102d2578063d1e16bfa1461024a578063f0f4426014610194578063f2fde38b1461010b5763fc0c546a146100c157600080fd5b34610106576000366003190112610106576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b600080fd5b3461010657602036600319011261010657610124610d58565b61012c610eac565b6001600160a01b0390811690811561017b57600154826001600160601b0360a01b821617600155167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a3005b604051631e4fbdf760e01b815260006004820152602490fd5b34610106576020366003190112610106576101ad610d58565b6101b5610eac565b6001600160a01b0390811690811561020c577f4ab5be82436d353e61ca18726e984e561f5c1cc7c6d38b29d2553c790434705a60406002549281519084168152846020820152a16001600160a01b03191617600255005b60405162461bcd60e51b815260206004820152601660248201527556657374696e673a207a65726f20747265617375727960501b6044820152606490fd5b34610106576020366003190112610106576004356000526003602052610100604060002060ff60018060a01b0382541691600181015490600281015460038201546004830154916006600585015494015494604051978852602088015260408701526060860152608085015260a0840152818116151560c084015260081c16151560e0820152f35b3461010657602080600319360112610106576004356102ef610eac565b6102f7610ed8565b8060005260038252604060002091600683019283549360ff8516156104b15760ff8560081c1661046c57907f99a2f33f71b04c0132aba0141ab231535e9df720b7e89d74fb38c584a6099a60929161034e82610e2b565b906005830190610100610370610365845486610d9c565b946004870154610d9c565b9861ff00191617905561038e6103868389610e1e565b600554610d9c565b600555816103f5575b5050846103b8575b546040519485526001600160a01b031693a36001600055005b6002546103f09086906001600160a01b03167f0000000000000000000000000000000000000000000000000000000000000000610efb565b61039f565b610400828254610e1e565b9055847f62eb4bd96d9a7a66875a9f46f9f9d8bf6cfed3fe0578671b752301427d2a4f668460018060a01b0361045a85828854167f0000000000000000000000000000000000000000000000000000000000000000610efb565b85541693604051908152a38580610397565b60405162461bcd60e51b815260048101849052601860248201527f56657374696e673a20616c7265616479207265766f6b656400000000000000006044820152606490fd5b60405162461bcd60e51b815260048101849052601660248201527556657374696e673a206e6f74207265766f6361626c6560501b6044820152606490fd5b34610106576000366003190112610106576001546040516001600160a01b039091168152602090f35b3461010657602080600319360112610106576001600160a01b0361053a610d58565b1660005260048152604060002060405190818382549182815201908192600052846000209060005b868282106105b857868661057882880383610dfc565b604051928392818401908285525180915260408401929160005b8281106105a157505050500390f35b835185528695509381019392810192600101610592565b835485529093019260019283019201610562565b34610106576000366003190112610106576105e5610eac565b600180546001600160a01b031981169091556000906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346101065760208060031936011261010657600435610646610ed8565b806000526003825260406000209060018060a01b039283835416331480156107e9575b156107a55760ff600684015460081c166107615761068683610e2b565b93600584019361069885548097610d9c565b94851561071c576106cc867f62eb4bd96d9a7a66875a9f46f9f9d8bf6cfed3fe0578671b752301427d2a4f66969798610e1e565b90556106da86600554610d9c565b60055561070b86838354167f0000000000000000000000000000000000000000000000000000000000000000610efb565b541693604051908152a36001600055005b60405162461bcd60e51b815260048101859052601b60248201527f56657374696e673a206e6f7468696e6720746f2072656c6561736500000000006044820152606490fd5b6064906040519062461bcd60e51b82526004820152601960248201527f56657374696e673a207363686564756c65207265766f6b6564000000000000006044820152fd5b6064906040519062461bcd60e51b82526004820152601760248201527f56657374696e673a206e6f7420617574686f72697365640000000000000000006044820152fd5b5083600154163314610669565b346101065760c03660031901126101065761080f610d58565b60a435801515810361010657610823610eac565b61082b610ed8565b6001600160a01b03821615610c235760843515610be75760643515610ba95760643560443511610b64576040516370a0823160e01b81523060048201526020816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610b5857600091610b26575b506108ba6084359160055490610d9c565b10610ad55760018060a01b03821660005260046020526040600020549060405160208101926001600160601b03198560601b1684526024356034830152608435605483015260748201526074815260a0810167ffffffffffffffff9382821085831117610abf578160405282519020936101a083019082821090821117610abf5760405260018060a01b0385168152600660c0830191602435835260e084016044358152610100850160643581526101208601906084358252610140870192600084526101806101608901988a15158a520196600088528a600052600360205260406000209560018060a01b039051166001600160601b0360a01b87541617865551600186015551600285015551600384015551600483015551600582015501915115159060ff61ff0084549251151560081b1692169061ffff19161717905560018060a01b038316600052600460205260406000209283549368010000000000000000851015610abf5760a08492610a5c877f3899129ee75e5ac6a4202def54482b0af3361fa1118e35fb2c00008a6104fb7194600160209a018155610d6e565b81549060031b9086821b91600019901b1916179055610a7f608435600554610e1e565b600555604051946084358652602435888701526044356040870152606435606087015215156080860152600180831b031693a36001600055604051908152f35b634e487b7160e01b600052604160045260246000fd5b60405162461bcd60e51b815260206004820152602360248201527f56657374696e673a20696e73756666696369656e7420746f6b656e2062616c616044820152626e636560e81b6064820152608490fd5b90506020813d602011610b50575b81610b4160209383610dfc565b810103126101065751836108a9565b3d9150610b34565b6040513d6000823e3d90fd5b60405162461bcd60e51b815260206004820152601960248201527f56657374696e673a20636c696666203e206475726174696f6e000000000000006044820152606490fd5b60405162461bcd60e51b81526020600482015260166024820152752b32b9ba34b7339d103d32b93790323ab930ba34b7b760511b6044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527315995cdd1a5b99ce881e995c9bc8185b5bdd5b9d60621b6044820152606490fd5b60405162461bcd60e51b815260206004820152601960248201527f56657374696e673a207a65726f2062656e6566696369617279000000000000006044820152606490fd5b34610106576000366003190112610106576002546040516001600160a01b039091168152602090f35b34610106576000366003190112610106576020600554604051908152f35b3461010657604036600319011261010657610cc8610d58565b6001600160a01b031660009081526004602052604090208054602435919082101561010657602091610cf991610d6e565b90546040519160031b1c8152f35b34610106576020366003190112610106576020610d25600435610dbf565b604051908152f35b346101065760203660031901126101065760043560005260036020526020610d256040600020610e2b565b600435906001600160a01b038216820361010657565b8054821015610d865760005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b91908203918211610da957565b634e487b7160e01b600052601160045260246000fd5b6000526003602052604060002060ff600682015460081c16610df657806005610dea610df393610e2b565b91015490610d9c565b90565b50600090565b90601f8019910116810190811067ffffffffffffffff821117610abf57604052565b91908201809211610da957565b6001810154610e3e600283015482610e1e565b4210610ea557600382015491610e548383610e1e565b421015610e9b576004610e6a9101549142610d9c565b90818102918183041490151715610da9578115610e85570490565b634e487b7160e01b600052601260045260246000fd5b6004015492915050565b5050600090565b6001546001600160a01b03163303610ec057565b60405163118cdaa760e01b8152336004820152602490fd5b600260005414610ee9576002600055565b604051633ee5aeb560e01b8152600490fd5b60405163a9059cbb60e01b602082019081526001600160a01b0393841660248301526044808301959095529381529092608082019067ffffffffffffffff821183831017610abf57602092600092604052519082865af115610b58576000513d610f8857508082163b155b610f6e575050565b604051635274afe760e01b81529116600482015260249150fd5b60011415610f6656fea264697066735822122045e91ca893a8fe21d691e3c5dd506c57a82b713a34f688654dfe6cf789651e4e64736f6c63430008180033' as const
export const merkleAirdropBytecode =
  '0x60a0346101d057601f610b3638819003918201601f191683019291906001600160401b038411838510176101d55781608092849260409687528339810103126101d05761004b816101eb565b602082015183830151929091906001600160a01b0390819061006f906060016101eb565b169182156101b857600080546001600160a01b031981168517825587519491908416907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3169081156101765750811561013d57428311156100f957608052600155600255516109369081610200823960805181818160a4015281816103cf01526106620152f35b835162461bcd60e51b815260206004820152601860248201527f41697264726f703a20616c7265616479206578706972656400000000000000006044820152606490fd5b835162461bcd60e51b8152602060048201526012602482015271105a5c991c9bdc0e881e995c9bc81c9bdbdd60721b6044820152606490fd5b62461bcd60e51b815260206004820152601360248201527f41697264726f703a207a65726f20746f6b656e000000000000000000000000006044820152606490fd5b8551631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101d05756fe6040608081526004908136101561001557600080fd5b600091823560e01c90816301681a62146106165781632eb4a7ab146105f7578163715018a61461059d5781638622a6891461057e5781638da5cb5b146105565781639e34070f14610510578163ae0b51df146102ad578163c2e3e62b1461016a578163f2fde38b146100d7575063fc0c546a1461009157600080fd5b346100d357816003193601126100d357517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5080fd5b91905034610166576020366003190112610166576001600160a01b038235818116939192908490036101625761010b61081c565b831561014c57505082546001600160a01b0319811683178455167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08380a380f35b51631e4fbdf760e01b8152908101849052602490fd5b8480fd5b8280fd5b919050346101665780600319360112610166578135906024359261018c61081c565b60025442111561025f57821561022857428411156101e6575060607fcdad51d1d27b433fdb6cbd1aefd9c7e059b11604ee1c1343b50bea6f6662cf849184600154918051928352856020840152820152a160015560025580f35b6020606492519162461bcd60e51b8352820152601760248201527f41697264726f703a20696e76616c6964206578706972790000000000000000006044820152fd5b6020606492519162461bcd60e51b83528201526012602482015271105a5c991c9bdc0e881e995c9bc81c9bdbdd60721b6044820152fd5b6020608492519162461bcd60e51b8352820152602360248201527f41697264726f703a2063757272656e7420726f756e64207374696c6c2061637460448201526269766560e81b6064820152fd5b91905034610166576060366003190112610166578135906024908135936044359267ffffffffffffffff9384811161050c573660238201121561050c5780830135908582116105085760059036848460051b830101116105045760025442116104c257610333888060081c6000526003602052600160ff60406000205492161b16151590565b61048057855196602097888101913360601b83528b60348301526034825260608201908282109082111761046e57908c939291895251902093600191600154959489855b8487106104365750505050505050036103fd575050907f4ec90e965519d92681267467f775ada5bd214aa92c0dc93d90a5e880ce9ed026918360081c865260038252808620600160ff86161b81541790556103f385337f0000000000000000000000000000000000000000000000000000000000000000610848565b519384523393a380f35b60649360169293519362461bcd60e51b85528401528201527520b4b9323937b81d1034b73b30b634b210383937b7b360511b6044820152fd5b86978a879885969798951b87010135908181106000146104635782528d52205b950193929190898e610377565b9082528d5220610456565b634e487b7160e01b8d5260418852868dfd5b855162461bcd60e51b81526020818701526018818601527f41697264726f703a20616c726561647920636c61696d656400000000000000006044820152606490fd5b855162461bcd60e51b8152602081870152601b818601527f41697264726f703a20636c61696d20706572696f6420656e64656400000000006044820152606490fd5b8980fd5b8880fd5b8780fd5b828434610553576020366003190112610553575061054a602092358060081c6000526003602052600160ff60406000205492161b16151590565b90519015158152f35b80fd5b5050346100d357816003193601126100d357905490516001600160a01b039091168152602090f35b5050346100d357816003193601126100d3576020906002549051908152f35b83346105535780600319360112610553576105b661081c565b80546001600160a01b03198116825581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b5050346100d357816003193601126100d3576020906001549051908152f35b9190503461016657602090816003193601126108185782356001600160a01b03818116948583036108145761064961081c565b6002544211156107d157851561078e57906024939291857f0000000000000000000000000000000000000000000000000000000000000000928551968780926370a0823160e01b8252308683015286165afa94851561078457889561072b575b5084156106e85750837fc36b5179cb9c303b200074996eab2b3473eac370fdd7eba3bec636fe35109696959493926106e092610848565b51908152a280f35b835162461bcd60e51b8152908101869052601960248201527f41697264726f703a206e6f7468696e6720746f207377656570000000000000006044820152606490fd5b909450853d871161077d575b601f8101601f1916820167ffffffffffffffff81118382101761076a578791839187528101031261050c575193386106a9565b634e487b7160e01b8a526041875260248afd5b503d610737565b84513d8a823e3d90fd5b835162461bcd60e51b8152908101859052601e60248201527f41697264726f703a20737765657020746f207a65726f206164647265737300006044820152606490fd5b835162461bcd60e51b8152908101859052601b60248201527f41697264726f703a20726f756e64207374696c6c2061637469766500000000006044820152606490fd5b8680fd5b8380fd5b6000546001600160a01b0316330361083057565b60405163118cdaa760e01b8152336004820152602490fd5b60405163a9059cbb60e01b602082019081526001600160a01b0393841660248301526044808301959095529381529092608082019067ffffffffffffffff8211838310176108ea57602092600092604052519082865af1156108de576000513d6108d557508082163b155b6108bb575050565b604051635274afe760e01b81529116600482015260249150fd5b600114156108b3565b6040513d6000823e3d90fd5b634e487b7160e01b600052604160045260246000fdfea264697066735822122088f28a59781b031bfddee5d83357047cccad2a26921174a33eae1c47ca6eec7c64736f6c63430008180033' as const
export const multiSigWalletBytecode =
  '0x604060808152346200031f5762001a91803803806200001e816200033a565b92833981019082818303126200031f5780516001600160401b0392908381116200031f5782019181601f840112156200031f57825191602094831162000324576005938360051b908680620000758185016200033a565b8097815201928201019283116200031f5790868094939201905b828210620002f357505050015192600192600092848455805115620002af578486106200026b578051861162000227579285928592889583975b620000e2575b8686600255516117309081620003618239f35b8051881015620002215787821b81018301516001600160a01b0316978815620001dd57888552600380855260ff898720541662000199578986528452878520805460ff191687179055855468010000000000000000811015620001855786810180885581101562000171578686528486200180546001600160a01b0319169099179098559684019684620000c9565b634e487b7160e01b86526032600452602486fd5b634e487b7160e01b86526041600452602486fd5b885162461bcd60e51b815260048101869052601960248201527f4d756c74695369673a206475706c6963617465206f776e6572000000000000006044820152606490fd5b875162461bcd60e51b815260048101859052601460248201527f4d756c74695369673a207a65726f206f776e65720000000000000000000000006044820152606490fd5b620000cf565b865162461bcd60e51b815260048101849052601b60248201527f4d756c74695369673a207265717569726564203e206f776e65727300000000006044820152606490fd5b865162461bcd60e51b815260048101849052601660248201527f4d756c74695369673a207265717569726564203c2031000000000000000000006044820152606490fd5b865162461bcd60e51b815260048101849052601360248201527f4d756c74695369673a206e6f206f776e657273000000000000000000000000006044820152606490fd5b815193945091929091906001600160a01b03811681036200031f5781528693929184019084016200008f565b600080fd5b634e487b7160e01b600052604160045260246000fd5b6040519190601f01601f191682016001600160401b03811183821017620003245760405256fe60806040526004361015610023575b361561001957600080fd5b6100216116ac565b005b60003560e01c8063025e7c2714610113578063173825d91461010e57806320c5429b146101095780632f54bf6e1461010457806340e58ee5146100ff5780637065cb48146100fa5780638790c1de146100f55780639ace38c2146100f0578063a0e67e2b146100eb578063b77bf600146100e6578063ba0179b5146100e1578063ba51a6df146100dc578063dc8452cd146100d7578063e77239a3146100d25763fe0d94c10361000e57610c76565b610c0d565b610bef565b610af9565b610990565b610972565b6108c0565b6107b5565b610653565b610558565b61049e565b61045f565b610322565b6101bc565b610158565b634e487b7160e01b600052603260045260246000fd5b6001548110156101535760016000526000805160206116db8339815191520190600090565b610118565b346101a15760203660031901126101a1576004356001548110156101a15760016000526000805160206116db83398151915201546040516001600160a01b039091168152602090f35b600080fd5b600435906001600160a01b03821682036101a157565b346101a15760203660031901126101a1576101d56101a6565b6101e0303314610e1d565b6001600160a01b038116600090815260036020526040902061020d90610208905b5460ff1690565b610e73565b60019061022861021e600154610ece565b6002541115610ee2565b6001600160a01b038116600090815260036020526040902061024f905b805460ff19169055565b6001600160a01b0390811691600091815b61028d575b837f58619076adf5bb0943d100ef88d52d7c3fd691b19d3a9071b555b651fbf418da600080a2005b8154928381101561031c5784826102bb6102a68461012e565b905460039190911b1c6001600160a01b031690565b16146102cb578201925081610260565b9150506102ee6102e86102a66102e361030c95610ece565b61012e565b9161012e565b90919060018060a01b038084549260031b9316831b921b1916179055565b610314610f39565b388080610265565b50610265565b346101a15760203660031901126101a157600435600090338252600360205261035160ff604084205416610e73565b61035e6006548210610fa8565b808252600460205261037a60ff60036040852001541615610ff4565b808252600560209081526040808420336000908152925290205460ff161561041a576103ce610245336103b7846000526005602052604060002090565b9060018060a01b0316600052602052604060002090565b60046103e4826000526004602052604060002090565b016103ef8154611040565b905533907fdd7f1999a4389ea99f79c84df2162a8e32e72dd35838b19e4094bf0357c1b62e8380a380f35b60405162461bcd60e51b815260206004820152601760248201527f4d756c74695369673a206e6f7420636f6e6669726d65640000000000000000006044820152606490fd5b346101a15760203660031901126101a1576001600160a01b036104806101a6565b166000526003602052602060ff604060002054166040519015158152f35b346101a15760203660031901126101a15760043560009033825260036020526104cd60ff604084205416610e73565b6104da6006548210610fa8565b80825260046020526104f660ff60036040852001541615610ff4565b808252600460205261051560ff600360408520015460081c161561104d565b808252600460205260408220600301805461ff0019166101001790557f956fb32199d8b882b2039a14e1be35ab14f7a80b9089fc223f14b43937173e608280a280f35b346101a15760203660031901126101a1576105716101a6565b61057c303314610e1d565b6001600160a01b03811690811561061557806105bf6105ba6105b66102016105ee9560018060a01b03166000526003602052604060002090565b1590565b61108f565b6001600160a01b03811660009081526003602052604090206105e9905b805460ff19166001179055565b6110db565b7f994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c3600080a2005b60405162461bcd60e51b81526020600482015260166024820152754d756c74695369673a207a65726f206164647265737360501b6044820152606490fd5b346101a15760403660031901126101a1576024356001600160a01b03811681036101a15760ff6106a56020926004356000526005845260406000209060018060a01b0316600052602052604060002090565b54166040519015158152f35b90600182811c921680156106e1575b60208310146106cb57565b634e487b7160e01b600052602260045260246000fd5b91607f16916106c0565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff82111761072357604052565b6106eb565b94929190979695939760018060a01b03168552602090602086015260e060408601528151918260e087015260005b8381106107a05750505060c093929161078e61079792610100906000828289010152601f801991011686010198606086019015159052565b15156080840152565b60a08201520152565b81810183015187820161010001528201610756565b346101a1576020806003193601126101a15760006004358152600482526040812060018060a01b038154169060018082015493600283019560405196879383825492610800846106b1565b808852936001811690811561089c5750600114610856575b868a6108528b8b61082b858c0386610701565b6003810154600560048301549201549260405196879660ff808560081c1694169288610728565b0390f35b8152838120979695945091905b818310610884575094955092935090918201018161082b6108523880610818565b87548a84018501529687019689945091830191610863565b60ff19168689015250505050151560051b83010190508161082b6108523880610818565b346101a15760008060031936011261096f5760405180916001906001549384845260208094018095600184526000805160206116db83398151915290845b8181106109535750505081610914910382610701565b6040519380850191818652518092526040850195925b8281106109375785870386f35b83516001600160a01b031687529581019592810192840161092a565b82546001600160a01b03168452928701929186019186016108fe565b80fd5b346101a15760003660031901126101a1576020600654604051908152f35b346101a1576020806003193601126101a15760048035906000923384526003815260406109c260ff8287205416610e73565b6109cf6006548510610fa8565b8385528282526109e860ff600383882001541615610ff4565b838552828252610a0460ff6003838820015460081c161561104d565b838552828252610a24600582872001548015908115610aee575b50611132565b83855260058252808520336000908152602091909152604090205460ff16610aad575050610a636105dc336103b7856000526005602052604060002090565b610a77826000526004602052604060002090565b01610a82815461117e565b905533907f15c2f311c9e0f53b50388279894aeff029a3457884a6601e924fca879e12adcc8380a380f35b5162461bcd60e51b815291820152601b60248201527f4d756c74695369673a20616c726561647920636f6e6669726d65640000000000604482015260649150fd5b905042111538610a1e565b346101a15760203660031901126101a157600435610b18303314610e1d565b60018110610bb1576001548111610b6c57610b6781610b577facbdb084c721332ac59f9b8e392196c9eb0e4932862da8eb9beaf0dad4f550da93600255565b6040519081529081906020820190565b0390a1005b60405162461bcd60e51b815260206004820152601b60248201527f4d756c74695369673a207265717569726564203e206f776e65727300000000006044820152606490fd5b60405162461bcd60e51b81526020600482015260166024820152754d756c74695369673a207265717569726564203c203160501b6044820152606490fd5b346101a15760003660031901126101a1576020600254604051908152f35b346101a15760803660031901126101a157610c266101a6565b67ffffffffffffffff906044358281116101a157366023820112156101a15780600401359283116101a15736602484830101116101a15761085292610b579260246064359301906024359061118d565b346101a1576020806003193601126101a157600490813590600092338452600382526040610ca960ff8287205416610e73565b6002855414610e105760028555610cc36006548510610fa8565b838552818352610cdc60ff600383882001541615610ff4565b838552818352610cf860ff6003838820015460081c161561104d565b838552818352610d17600582872001548015908115610aee5750611132565b8480610d2d866000526004602052604060002090565b610d3e8582015460025411156115a0565b60038101805460ff1916600117905580546002906001600160a01b031691600181015490610d71875180948193016115f8565b03925af192610d7e61167c565b9315610db75785857f15ed165a284872ea7017f03df402a0cadfbfab588320ffaf83f160c2f82781c78280a2610db46001600055565b80f35b83519384610e0a57825162461bcd60e51b81526020818601818152601c918101919091527f4d756c74695369673a207472616e73616374696f6e206661696c656400000000604082015281906060010390fd5b84925001fd5b51633ee5aeb560e01b8152fd5b15610e2457565b60405162461bcd60e51b815260206004820152602160248201527f4d756c74695369673a2063616c6c6572206d757374206265206d756c746973696044820152606760f81b6064820152608490fd5b15610e7a57565b60405162461bcd60e51b815260206004820152601660248201527526bab63a34a9b4b39d103737ba1030b71037bbb732b960511b6044820152606490fd5b634e487b7160e01b600052601160045260246000fd5b600019810191908211610edd57565b610eb8565b15610ee957565b60405162461bcd60e51b815260206004820152602260248201527f4d756c74695369673a20746f6f20666577206f776e6572732072656d61696e696044820152616e6760f01b6064820152608490fd5b6001548015610f925760001981019080821015610153577fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf5906001600052016bffffffffffffffffffffffff60a01b8154169055600155565b634e487b7160e01b600052603160045260246000fd5b15610faf57565b60405162461bcd60e51b815260206004820152601b60248201527f4d756c74695369673a20747820646f6573206e6f7420657869737400000000006044820152606490fd5b15610ffb57565b60405162461bcd60e51b815260206004820152601a60248201527f4d756c74695369673a20616c72656164792065786563757465640000000000006044820152606490fd5b8015610edd576000190190565b1561105457565b60405162461bcd60e51b8152602060048201526013602482015272135d5b1d1a54da59ce8818d85b98d95b1b1959606a1b6044820152606490fd5b1561109657565b60405162461bcd60e51b815260206004820152601a60248201527f4d756c74695369673a20616c726561647920616e206f776e65720000000000006044820152606490fd5b600154680100000000000000008110156107235760018101806001558110156101535760016000526000805160206116db8339815191520180546001600160a01b0319166001600160a01b03909216919091179055565b1561113957565b60405162461bcd60e51b815260206004820152601d60248201527f4d756c74695369673a207472616e73616374696f6e20657870697265640000006044820152606490fd5b6000198114610edd5760010190565b909161127794937fcf5c862f5b68570b6101e11c9faa0a4df16350cb65d352440bbc07d38fb557d9913360005260036020526111d060ff60406000205416610e73565b6001600160a01b03841695611285906111ea881515611294565b8015801561128b575b6111fc906112e0565b60065498899661121361120e8961117e565b600655565b61122d61121e61132c565b6001600160a01b039092168252565b88602082015261123e368787611368565b60408201526000606082015260006080820152600060a08201528260c0820152611272886000526004602052604060002090565b6113f5565b60405193849333988561156c565b0390a490565b504281116111f3565b1561129b57565b60405162461bcd60e51b815260206004820152601c60248201527f4d756c74695369673a20746f206973207a65726f2061646472657373000000006044820152606490fd5b156112e757565b60405162461bcd60e51b815260206004820152601c60248201527f4d756c74695369673a2065787069727920696e207468652070617374000000006044820152606490fd5b6040519060e0820182811067ffffffffffffffff82111761072357604052565b67ffffffffffffffff811161072357601f01601f191660200190565b9291926113748261134c565b916113826040519384610701565b8294818452818301116101a1578281602093846000960137010152565b90601f81116113ad57505050565b6000916000526020600020906020601f850160051c830194106113eb575b601f0160051c01915b8281106113e057505050565b8181556001016113d4565b90925082906113cb565b9060018060a01b038151166bffffffffffffffffffffffff60a01b8354161782556001602090602083015160018501556002840191604084015180519267ffffffffffffffff8411610723576114558461144f87546106b1565b8761139f565b602092601f85116001146114f4575050826005959360c0959361148f936000926114e9575b50508160011b916000199060031b1c19161790565b90555b6114d8600385016114bb6114a96060850151151590565b829060ff801983541691151516179055565b60808301511515815461ff00191690151560081b61ff0016179055565b60a081015160048501550151910155565b01519050388061147a565b929190601f1985169061150c87600052602060002090565b946000915b838310611555575050509260019285926005989660c098961061153c575b505050811b019055611492565b015160001960f88460031b161c1916905538808061152f565b848601518755958601959481019491810191611511565b94939280604093608093885260606020890152816060890152838801376000828288010152601f8019910116850101930152565b156115a757565b60405162461bcd60e51b8152602060048201526024808201527f4d756c74695369673a20696e73756666696369656e7420636f6e6669726d6174604482015263696f6e7360e01b6064820152608490fd5b600092918154611607816106b1565b926001918083169081156116615750600114611624575b50505050565b9091929394506000526020906020600020906000915b858310611650575050505001903880808061161e565b80548584015291830191810161163a565b60ff191684525050508115159091020191503880808061161e565b3d156116a7573d9061168d8261134c565b9161169b6040519384610701565b82523d6000602084013e565b606090565b6040513481527fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c60203392a256feb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6a264697066735822122059579e4ed462961cf689b2578e37306037d61e1d54d1343d2ee3f13b5e56a10164736f6c63430008180033' as const
export const paymentSplitterBytecode =
  '0x60406080815234620003a35762000cc7803803806200001e81620003c9565b92833981018282820312620003a35781516001600160401b039190828111620003a35783019181601f84011215620003a3578251936020936200006b620000658762000405565b620003c9565b95858088838152019160051b83010191858311620003a3578601905b828210620003a85750505083810151918211620003a357019080601f83011215620003a3578151620000bd620000658262000405565b92848085848152019260051b820101928311620003a35784809101915b8383106200039257505050506001916000938385558051156200034e5780518351036200030a5785928592859284965b6200011f575b855161087e9081620004498239f35b805187101562000304576001600160a01b036200013d88836200041d565b5116966200014c81856200041d565b51978015620002c05788156200027c578087526004988985528888205462000239576003805490680100000000000000008210156200022657888201808255821015620002135789528589200180546001600160a01b03191683179055818852898552888820819055865480820190811062000200578798999a5085889493927f40c340f65e17194d14ddddb073d3c9f888e3cb52b5aae0c6c7706b4fbc905fac9286558c51908152a2019695946200010a565b634e487b7160e01b895260118b52602489fd5b634e487b7160e01b8a5260328c5260248afd5b634e487b7160e01b8a5260418c5260248afd5b885162461bcd60e51b8152808b01869052601960248201527f53706c69747465723a206475706c6963617465207061796565000000000000006044820152606490fd5b875162461bcd60e51b815260048101859052601460248201527f53706c69747465723a207a65726f2073686172650000000000000000000000006044820152606490fd5b875162461bcd60e51b815260048101859052601c60248201527f53706c69747465723a207a65726f2061646472657373207061796565000000006044820152606490fd5b62000110565b855162461bcd60e51b815260048101839052601960248201527f53706c69747465723a206c656e677468206d69736d61746368000000000000006044820152606490fd5b855162461bcd60e51b815260048101839052601360248201527f53706c69747465723a206e6f20706179656573000000000000000000000000006044820152606490fd5b8251815291810191859101620000da565b600080fd5b81516001600160a01b0381168103620003a357815290860190860162000087565b6040519190601f01601f191682016001600160401b03811183821017620003ef57604052565b634e487b7160e01b600052604160045260246000fd5b6001600160401b038111620003ef5760051b60200190565b8051821015620004325760209160051b010190565b634e487b7160e01b600052603260045260246000fdfe608060409080825260048036101561004b575b5050361561001f57600080fd5b513481527f8ac633e5b094e1150d2a6495df4d0c77f51d293abe99e7733c78870dfbee766060203392a2005b600091823560e01c908162dbe1091461058a5750806309a7fc081461055c57806319165587146104075780633375bbdc146103cf5780633a98ef39146103b05780635ca8bc82146103675780638b0fbd8a1461032f5780638b83209b146102c1578063bbb2854c146102a2578063bec9289814610271578063ce7c2ac21461023a5763f9a76be2036100125782346102365780600319360112610236576100f06105a6565b906100f96105c1565b90610102610825565b60018060a01b03908183169485875261012e602094828652610128848a20541515610748565b86610672565b9261013a84151561078c565b85169485885260078552828820878952855282882061015a85825461060f565b90558588526006855282882061017185825461060f565b905582518581019063a9059cbb60e01b8252886024820152856044820152604481526080810181811067ffffffffffffffff8211176102235785525186928a929083905af1156102195786513d6102105750843b155b6101fb5750519081527f1998e30db89daf293a52c4fc4c4470cd506aafc3f9683e8e5daddad80cd6f4a49190a36001815580f35b846024925191635274afe760e01b8352820152fd5b600114156101c7565b81513d88823e3d90fd5b634e487b7160e01b8b526041855260248bfd5b8280fd5b508290346102365760203660031901126102365760209282916001600160a01b036102636105a6565b168252845220549051908152f35b82843461029e57602036600319011261029e576020906102976102926105a6565b6107d8565b9051908152f35b5080fd5b82843461029e578160031936011261029e576020906002549051908152f35b508290346102365760203660031901126102365780359060035482101561031c575060036020935260018060a01b03907fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b0154169051908152f35b634e487b7160e01b845260329052602483fd5b82843461029e57602036600319011261029e5760209181906001600160a01b036103576105a6565b1681526005845220549051908152f35b82843461029e578060031936011261029e57806020926103856105a6565b61038d6105c1565b6001600160a01b0391821683526007865283832091168252845220549051908152f35b82843461029e578160031936011261029e576020906001549051908152f35b82843461029e57602036600319011261029e5760209181906001600160a01b036103f76105a6565b1681526006845220549051908152f35b5082903461023657602090816003193601126105585780356001600160a01b03811693908490036105545761043a610825565b83855281835261044e818620541515610748565b610457846107d8565b9161046383151561078c565b8486526005845281862061047884825461060f565b90556104868360025461060f565b6002558580808086895af13d1561054f573d67ffffffffffffffff811161053c578351906104bd601f8201601f19168801836105d7565b815287863d92013e5b156104fb5750519081527f83e746f734bb21d4015d4a7c1b5c280bc3e9cf3c7d6f5ab7772bf00804f3529a9190a26001815580f35b83606492519162461bcd60e51b8352820152601d60248201527f53706c69747465723a20434658207472616e73666572206661696c65640000006044820152fd5b634e487b7160e01b885260418352602488fd5b6104c6565b8480fd5b8380fd5b82843461029e578060031936011261029e5760209061029761057c6105a6565b6105846105c1565b90610672565b83903461029e578160031936011261029e576020906003548152f35b600435906001600160a01b03821682036105bc57565b600080fd5b602435906001600160a01b03821682036105bc57565b90601f8019910116810190811067ffffffffffffffff8211176105f957604052565b634e487b7160e01b600052604160045260246000fd5b9190820180921161061c57565b634e487b7160e01b600052601160045260246000fd5b8181029291811591840414171561061c57565b811561064f570490565b634e487b7160e01b600052601260045260246000fd5b9190820391821161061c57565b604080516370a0823160e01b8152306004820152926001600160a01b03928316926020908186602481885afa95861561073d5760009661070c575b506106e56106ee916106cf61070998886000526006865287600020549061060f565b9416938460005260048452856000205490610632565b60015490610645565b93600052600781528260002091600052526000205490610665565b90565b95508186813d8311610736575b61072381836105d7565b810103126105bc579451946106e56106ad565b503d610719565b84513d6000823e3d90fd5b1561074f57565b60405162461bcd60e51b815260206004820152601560248201527453706c69747465723a206e6f74206120706179656560581b6044820152606490fd5b1561079357565b60405162461bcd60e51b815260206004820152601c60248201527f53706c69747465723a206e6f7468696e6720746f2072656c65617365000000006044820152606490fd5b610709906108106106e56107ef476002549061060f565b6001600160a01b039093166000818152600460205260409020549093610632565b90600052600560205260406000205490610665565b600260005414610836576002600055565b604051633ee5aeb560e01b8152600490fdfea2646970667358221220e175c09c3139cdb9c5ede465fb4f671642da97c7bf1f674dda84d753341eb42564736f6c63430008180033' as const
export const mockPriceOracleBytecode =
  '0x60406080815234620003655762000c5190813803806200001f8162000395565b938439820191606081840312620003655780516001600160401b0393908481116200036557820190601f81818401121562000365578251938685116200037f57602094601f1994620000778483018716880162000395565b948286528783830101116200036557869060005b8381106200036a57505060009185010152848101519060ff8216809203620003655786015192600492836002558151918983116200035057600054966001978881811c9116801562000345575b8a82101462000330579081848695949311620002d6575b508992841160011462000270575060009262000264575b5050600019600383901b1c191690851b176000555b835460ff19161783556003546001600160501b039081168401968188116200024f5786519060a08201908111828210176200023a57879883918899521695869586948584528a83850195888752828183880193428552600860608a0198428a528c60808c019d8e52600052526000209751169260018060501b031998848a8a541617895551809689015551958660028901555196876003820155019751169687878254161790558560035416176003555560055560065560075416176007557f0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f848651428152a37f0109fc6f55cf40689f02fbaad7af7fe7bbac8a3d2186600afc7d3e10cac602718351924284523393a3516108959081620003bc8239f35b604184634e487b7160e01b6000525260246000fd5b601183634e487b7160e01b6000525260246000fd5b01519050388062000106565b8894929192169160008052896000209260005b8b828210620002bf5750508411620002a5575b505050811b016000556200011b565b015160001960f88460031b161c1916905538808062000296565b8385015186558b9790950194938401930162000283565b909192935060008052896000208480870160051c8201928c881062000326575b9187968c92969594930160051c01915b82811062000316575050620000ef565b600081558796508b910162000306565b92508192620002f6565b602287634e487b7160e01b6000525260246000fd5b90607f1690620000d8565b604185634e487b7160e01b6000525260246000fd5b600080fd5b8181018301518782018401528892016200008b565b634e487b7160e01b600052604160045260246000fd5b6040519190601f01601f191682016001600160401b038111838210176200037f5760405256fe60806040908082526004908136101561001757600080fd5b600090813560e01c9081631c12940a146106ae57508063313ce5671461068c57806350d25bcd1461066d57806354fd4d501461064e578063668a0f02146106265780637284e416146104f15780637a1395aa146104c45780638205bf6a146104a557806390c3f38f1461031957806399213cd8146101c15780639a6fc8f5146100fb5763feaf968c146100a957600080fd5b346100f857806003193601126100f85750600354905460055460065460075494516001600160501b0394851681526020810193909352604083019190915260608201529116608082015260a090f35b80fd5b5091346101bd5760203660031901126101bd57806001600160501b0393846101216107d8565b1681526008602052208381541692831561017a57600182015460028301546003840154929093015493516001600160501b039586168152602081019190915260408101929092526060820152921616608082015260a090f35b606490602084519162461bcd60e51b8352820152601b60248201527f4d6f636b4f7261636c653a20726f756e64206e6f7420666f756e6400000000006044820152fd5b8280fd5b5091346101bd5760203660031901126101bd5781356001600160501b0390600182600354160193828511610306576102af90838551966102008861082d565b1695869485825260208201928584528783019042825261028c60608501934285528c818c60808901928d84528d815260086020522097511691846001600160501b031999848b8b5416178a5551968760018b015551978860028b015551988960038201550191511680988254161790556001600160501b03166001600160501b03196003541617600355565b556005556006556001600160501b03166001600160501b03196007541617600755565b7f0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f60208451428152a351904282527f0109fc6f55cf40689f02fbaad7af7fe7bbac8a3d2186600afc7d3e10cac6027160203393a380f35b634e487b7160e01b865260119052602485fd5b50346100f85760209160206003193601126104a157803567ffffffffffffffff9182821161049d573660238301121561049d578101359182116101bd57602490366024848301011161049d5761036f84546107f3565b601f811161043e575b508391601f84116001146103b757508383949550926103a9575b50508160011b916000199060031b1c191617815580f35b602492500101358380610392565b91947f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56392601f1985169186915b8383106104225750505094836001959610610405575b505050811b01815580f35b0160240135600019600384901b60f8161c191690558380806103fa565b908060018a978483969c890101358155019601980191906103e4565b7f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563601f850160051c81019160208610610493575b601f0160051c01905b8181106104885750610378565b85815560010161047b565b9091508190610472565b8380fd5b5080fd5b5082346104a157816003193601126104a1576020906006549051908152f35b5090346104a15760203660031901126104a1573560ff81168091036104a15760ff19600154161760015580f35b508290346100f857806003193601126100f8578151818192815490610515826107f3565b8085526020926001908460018216918260001461060a5750506001146105b7575b5050601f801995869203011683019583871067ffffffffffffffff8811176105a4575085929391838652818452845191828186015281955b83871061058c5750508394508582601f949501015201168101030190f35b8681018201518988018901529581019588955061056e565b634e487b7160e01b835260419052602482fd5b8480528492507f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8284106105f457505050830181018780610536565b80548885018601528796509284019281016105df565b925093505060ff191682860152151560051b8401018780610536565b5082346104a157816003193601126104a1576020906001600160501b03600354169051908152f35b5082346104a157816003193601126104a1576020906002549051908152f35b509190346101bd57826003193601126101bd5760209250549051908152f35b5082346104a157816003193601126104a15760209060ff600154169051908152f35b848484923461049d5760a036600319011261049d576106cb6107d8565b9260243592606435926084356001600160501b03968782168092036107d45787906106f58461082d565b169687835260208301938785528584019160443583526060850193888552608086019081528a8c52600860205281888d2096511691836001600160501b031998848a8a541617895551958660018a015551968760028a01555197886003820155019151168097825416179055610781906001600160501b03166001600160501b03196003541617600355565b556005556006556107a8906001600160501b03166001600160501b03196007541617600755565b5190815260207f0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f91a380f35b8880fd5b600435906001600160501b03821682036107ee57565b600080fd5b90600182811c92168015610823575b602083101461080d57565b634e487b7160e01b600052602260045260246000fd5b91607f1691610802565b60a0810190811067ffffffffffffffff82111761084957604052565b634e487b7160e01b600052604160045260246000fdfea26469706673582212201f145092d38bd9f8a3aede481aa46a8a99f86ab13112961e787016426ecbe55a64736f6c63430008180033' as const
