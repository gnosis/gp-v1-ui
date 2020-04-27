import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { Actions } from 'reducers-actions'
import { setStorageItem, toBN } from 'utils'
// import { setStorageItem } from 'utils'

export const enum ActionTypes {
  SAVE_PENDING_ORDERS = 'SAVE_PENDING_ORDERS',
  REMOVE_PENDING_ORDERS = 'REMOVE_PENDING_ORDERS',
}

type SavePendingOrdersActionType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj | PendingTxObj[]
    networkId: number
  }
>

type RemovePendingOrdersActionType = Actions<
  ActionTypes,
  {
    // pendingTxHash: string
    networkId: number
    blockTransactions: Set<string>
  }
>

type ReducerType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj | PendingTxObj[]
    networkId: number
    blockTransactions: Set<string>
    userAddress: string
  }
>

export const savePendingOrdersAction = (payload: {
  orders: PendingTxObj | PendingTxObj[]
  networkId: number
  userAddress: string
}): SavePendingOrdersActionType => ({
  type: ActionTypes.SAVE_PENDING_ORDERS,
  payload,
})

export const removePendingOrdersAction = (payload: {
  networkId: number
  // pendingTxHash: string
  userAddress: string
  blockTransactions: Set<string>
}): RemovePendingOrdersActionType => ({
  type: ActionTypes.REMOVE_PENDING_ORDERS,
  payload,
})

export interface PendingOrdersState {
  [networkId: number]: {
    [userAddress: string]: PendingTxObj[]
  }
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
  }
*/
export const EMPTY_PENDING_ORDERS_STATE = {
  1: {},
  4: {},
}

const GP_PENDING_ORDER_KEY = 'GP_ORDER_TX_HASHES'

export const reducer = (state: PendingOrdersState, action: ReducerType): PendingOrdersState => {
  switch (action.type) {
    case ActionTypes.SAVE_PENDING_ORDERS: {
      const { networkId, orders, userAddress } = action.payload

      const userPendingOrdersArr = state[networkId][userAddress] ? state[networkId][userAddress] : []
      const newPendingTxArray = userPendingOrdersArr.concat(orders as PendingTxObj)
      const newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }

      setStorageItem(GP_PENDING_ORDER_KEY, newState)
      return newState
    }
    case ActionTypes.REMOVE_PENDING_ORDERS: {
      const { networkId, blockTransactions, userAddress } = action.payload

      const userPendingOrdersArr = state[networkId][userAddress] ? state[networkId][userAddress] : []
      const newPendingTxArray = userPendingOrdersArr.filter(
        ({ txHash }: { txHash: string }) => !blockTransactions.has(txHash),
      )
      const newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }

      setStorageItem(GP_PENDING_ORDER_KEY, newState)

      return newState
    }
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

export const PendingOrdersInitialState: PendingOrdersState = localStorage.getItem(GP_PENDING_ORDER_KEY)
  ? grabAndParseLocalStorageOrders(JSON.parse(localStorage.getItem(GP_PENDING_ORDER_KEY) as string))
  : EMPTY_PENDING_ORDERS_STATE
