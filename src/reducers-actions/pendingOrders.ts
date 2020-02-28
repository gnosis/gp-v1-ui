import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { Actions } from 'reducers-actions'

export const enum ActionTypes {
  SAVE_PENDING_ORDERS = 'SAVE_PENDING_ORDERS',
  REMOVE_PENDING_ORDERS = 'REMOVE_PENDING_ORDERS',
}

type SavePendingOrdersActionType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj
    networkId: number
  }
>

type RemovePendingOrdersActionType = Actions<
  ActionTypes,
  {
    networkId: number
    pendingTxHash: string
  }
>

type ReducerType = Actions<
  ActionTypes,
  {
    orders: PendingTxObj
    networkId: number
    pendingTxHash: string
    userAddress: string
  }
>

export const savePendingOrdersAction = (payload: {
  orders: PendingTxObj
  networkId: number
  userAddress: string
}): SavePendingOrdersActionType => ({
  type: ActionTypes.SAVE_PENDING_ORDERS,
  payload,
})

export const removePendingOrdersAction = (payload: {
  networkId: number
  pendingTxHash: string
  userAddress: string
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

export const PendingOrdersInitialState: PendingOrdersState = localStorage.getItem('GP_ORDER_TX_HASHES')
  ? JSON.parse(localStorage.getItem('GP_ORDER_TX_HASHES') as string)
  : EMPTY_PENDING_ORDERS_STATE

export const reducer = (state: PendingOrdersState, action: ReducerType): PendingOrdersState => {
  switch (action.type) {
    case ActionTypes.SAVE_PENDING_ORDERS: {
      const { networkId, orders, userAddress } = action.payload

      const userPendingOrdersArr = state[networkId][userAddress] ? state[networkId][userAddress] : []
      const newPendingTxArray = userPendingOrdersArr.concat(orders)
      const newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }

      return newState
    }
    case ActionTypes.REMOVE_PENDING_ORDERS: {
      const { networkId, pendingTxHash, userAddress } = action.payload

      const userPendingOrdersArr = state[networkId][userAddress] ? state[networkId][userAddress] : []
      const newPendingTxArray = userPendingOrdersArr.filter(
        ({ txHash }: { txHash: string }) => txHash !== pendingTxHash,
      )
      const newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }

      return newState
    }
    default:
      return state
  }
}
