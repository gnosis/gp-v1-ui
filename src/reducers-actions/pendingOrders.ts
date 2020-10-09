import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { Actions } from 'reducers-actions'
import { setStorageItem } from 'utils'
import { toBN } from '@gnosis.pm/dex-js'

const STORAGE_PENDING_ORDER_KEY = 'STORAGE_PENDING_ORDER_TX_HASHES'

export type ActionTypes = 'SAVE_PENDING_ORDERS' | 'REPLACE_PENDING_ORDERS'

type SavePendingOrdersActionType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj[]
    networkId: number
  }
>

type RemovePendingOrdersActionType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj[]
    networkId: number
  }
>

type ReducerType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj[]
    networkId: number
    userAddress: string
  }
>

export const savePendingOrdersAction = (payload: {
  orders: PendingTxObj[]
  networkId: number
  userAddress: string
}): SavePendingOrdersActionType => ({
  type: 'SAVE_PENDING_ORDERS',
  payload,
})

export const removePendingOrdersAction = (payload: {
  networkId: number
  userAddress: string
  orders: PendingTxObj[]
}): RemovePendingOrdersActionType => ({
  type: 'REPLACE_PENDING_ORDERS',
  payload,
})

export interface PendingOrdersUser {
  [userAddress: string]: PendingTxObj[] | undefined
}

export interface PendingOrdersState {
  [networkId: number]: PendingOrdersUser | undefined
}

/* 
  // Example State structure
  pendingOrders = {
    1: {
      '0x123123123123': [PendingTxObj, ...],
      '0xcf123123sdhf': [],
    },
    4: {
      '0x90dcJsdkjb22': [],
      '0xd9sjsdasnci1': [],
    },
    100: {
    },
  }
*/
export const EMPTY_PENDING_ORDERS_STATE = {
  1: {},
  4: {},
  100: {},
}

export const reducer = (state: PendingOrdersState, action: ReducerType): PendingOrdersState => {
  switch (action.type) {
    case 'SAVE_PENDING_ORDERS': {
      const { networkId, orders, userAddress } = action.payload
      const pendingOrders = state[networkId] || {}
      const userPendingOrders = pendingOrders[userAddress] || []
      const newPendingOrders = userPendingOrders.concat(orders)
      return {
        ...state,
        [networkId]: {
          ...pendingOrders,
          [userAddress]: newPendingOrders,
        },
      }
    }
    case 'REPLACE_PENDING_ORDERS': {
      const { networkId, orders, userAddress } = action.payload

      const newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: orders } }

      return newState
    }
    default:
      return state
  }
}

export const sideEffect = (state: PendingOrdersState, action: ReducerType): PendingOrdersState => {
  switch (action.type) {
    case 'SAVE_PENDING_ORDERS':
    case 'REPLACE_PENDING_ORDERS':
      setStorageItem(STORAGE_PENDING_ORDER_KEY, state)
    default:
      return state
  }
}

function parsePendingOrders(ordersToParse: PendingTxObj[]): PendingTxObj[] {
  if (ordersToParse && ordersToParse.length > 0) {
    // JSON BN objects need to be re-cast back to BN via toBN
    return ordersToParse.map(({ priceNumerator, priceDenominator, remainingAmount, sellTokenBalance, ...rest }) => ({
      ...rest,
      priceNumerator: toBN(priceNumerator.toString()),
      priceDenominator: toBN(priceDenominator.toString()),
      remainingAmount: toBN(remainingAmount.toString()),
      sellTokenBalance: toBN(sellTokenBalance.toString()),
    }))
  }

  return []
}

function grabAndParseLocalStorageOrders(localPendingOrders: PendingOrdersState): PendingOrdersState {
  // [1, 4].reduce(...)
  const castLocalState = Object.keys(localPendingOrders).reduce((acc, key) => {
    const ordersByAddr = localPendingOrders[key]

    acc[key] = Object.keys(ordersByAddr).reduce((acc2, address) => {
      const innerPendingOrders = ordersByAddr[address]
      acc2[address] = parsePendingOrders(innerPendingOrders)

      return acc2
    }, {})

    return acc
  }, {})
  return castLocalState
}

export const PendingOrdersInitialState: PendingOrdersState = localStorage.getItem(STORAGE_PENDING_ORDER_KEY)
  ? grabAndParseLocalStorageOrders(JSON.parse(localStorage.getItem(STORAGE_PENDING_ORDER_KEY) as string))
  : EMPTY_PENDING_ORDERS_STATE
