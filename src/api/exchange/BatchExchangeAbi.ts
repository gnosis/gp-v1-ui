import { AbiItem } from 'web3-utils'

const BatchExchangeAbi: AbiItem[] = [
  {
    constant: true,
    inputs: [],
    name: 'getSecondsRemainingInBatch',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'feeDenominator',
    outputs: [
      {
        name: '',
        type: 'uint128',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getPendingWithdrawAmount',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'requestWithdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getPendingDepositAmount',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getPendingWithdrawBatchNumber',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'TOKEN_ADDITION_FEE_IN_OWL',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'AMOUNT_MINIMUM',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'feeToken',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'uint16',
      },
    ],
    name: 'currentPrices',
    outputs: [
      {
        name: '',
        type: 'uint128',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    name: 'orders',
    outputs: [
      {
        name: 'buyToken',
        type: 'uint16',
      },
      {
        name: 'sellToken',
        type: 'uint16',
      },
      {
        name: 'validFrom',
        type: 'uint32',
      },
      {
        name: 'validUntil',
        type: 'uint32',
      },
      {
        name: 'priceNumerator',
        type: 'uint128',
      },
      {
        name: 'priceDenominator',
        type: 'uint128',
      },
      {
        name: 'usedAmount',
        type: 'uint128',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'numTokens',
    outputs: [
      {
        name: '',
        type: 'uint16',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'address',
      },
    ],
    name: 'lastCreditBatchId',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'latestSolution',
    outputs: [
      {
        name: 'batchId',
        type: 'uint32',
      },
      {
        name: 'solutionSubmitter',
        type: 'address',
      },
      {
        name: 'feeReward',
        type: 'uint256',
      },
      {
        name: 'objectiveValue',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getBalance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'BATCH_TIME',
    outputs: [
      {
        name: '',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getCurrentBatchId',
    outputs: [
      {
        name: '',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
      {
        name: 'batchId',
        type: 'uint32',
      },
    ],
    name: 'requestFutureWithdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'hasValidWithdrawRequest',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'MAX_TOKENS',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getPendingDepositBatchNumber',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'MAX_TOUCHED_ORDERS',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maxTokens',
        type: 'uint256',
      },
      {
        name: '_feeDenominator',
        type: 'uint128',
      },
      {
        name: '_feeToken',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buyToken',
        type: 'uint16',
      },
      {
        indexed: false,
        name: 'sellToken',
        type: 'uint16',
      },
      {
        indexed: false,
        name: 'validFrom',
        type: 'uint32',
      },
      {
        indexed: false,
        name: 'validUntil',
        type: 'uint32',
      },
      {
        indexed: false,
        name: 'priceNumerator',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'priceDenominator',
        type: 'uint128',
      },
    ],
    name: 'OrderPlacement',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'OrderCancelation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'stateIndex',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'stateIndex',
        type: 'uint256',
      },
    ],
    name: 'WithdrawRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'addToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'buyTokens',
        type: 'uint16[]',
      },
      {
        name: 'sellTokens',
        type: 'uint16[]',
      },
      {
        name: 'validFroms',
        type: 'uint32[]',
      },
      {
        name: 'validUntils',
        type: 'uint32[]',
      },
      {
        name: 'buyAmounts',
        type: 'uint128[]',
      },
      {
        name: 'sellAmounts',
        type: 'uint128[]',
      },
    ],
    name: 'placeValidFromOrders',
    outputs: [
      {
        name: 'orderIds',
        type: 'uint256[]',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'buyToken',
        type: 'uint16',
      },
      {
        name: 'sellToken',
        type: 'uint16',
      },
      {
        name: 'validUntil',
        type: 'uint32',
      },
      {
        name: 'buyAmount',
        type: 'uint128',
      },
      {
        name: 'sellAmount',
        type: 'uint128',
      },
    ],
    name: 'placeOrder',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'ids',
        type: 'uint256[]',
      },
    ],
    name: 'cancelOrders',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'ids',
        type: 'uint256[]',
      },
    ],
    name: 'freeStorageOfOrder',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'batchIndex',
        type: 'uint32',
      },
      {
        name: 'claimedObjectiveValue',
        type: 'uint256',
      },
      {
        name: 'owners',
        type: 'address[]',
      },
      {
        name: 'orderIds',
        type: 'uint16[]',
      },
      {
        name: 'buyVolumes',
        type: 'uint128[]',
      },
      {
        name: 'prices',
        type: 'uint128[]',
      },
      {
        name: 'tokenIdsForPrice',
        type: 'uint16[]',
      },
    ],
    name: 'submitSolution',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'tokenAddressToIdMap',
    outputs: [
      {
        name: '',
        type: 'uint16',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'id',
        type: 'uint16',
      },
    ],
    name: 'tokenIdToAddressMap',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'hasToken',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getEncodedUserOrders',
    outputs: [
      {
        name: 'elements',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getEncodedAuctionElements',
    outputs: [
      {
        name: 'elements',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'batchIndex',
        type: 'uint32',
      },
    ],
    name: 'acceptingSolutions',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getCurrentObjectiveValue',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

export default BatchExchangeAbi
