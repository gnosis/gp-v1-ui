import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { GP_ORDER_TX_HASHES } from 'const'

export const enum ActionTypes {
  SAVE_PENDING_ORDERS = 'SAVE_PENDING_ORDERS',
  REMOVE_PENDING_ORDERS = 'REMOVE_PENDING_ORDERS',
}

interface Actions<T> {
  type: ActionTypes
  payload: T
}

export const savePendingOrdersAction = (payload: {
  orders: PendingTxObj
  networkId: number
}): Actions<{
  orders: PendingTxObj
  networkId: number
}> => ({
  type: ActionTypes.SAVE_PENDING_ORDERS,
  payload,
})

export const removePendingOrdersAction = (payload: {
  networkId: number
  pendingTxHash: string
}): Actions<{
  networkId: number
  pendingTxHash: string
}> => ({
  type: ActionTypes.REMOVE_PENDING_ORDERS,
  payload,
})

export type PendingOrdersState = typeof GP_ORDER_TX_HASHES

export const EMPTY_PENDING_ORDERS_STATE = {
  1: [],
  4: [],
}

export const PendingOrdersInitialState: () => PendingOrdersState = () => {
  const pendingOrders: typeof GP_ORDER_TX_HASHES = localStorage.getItem('GP_ORDER_TX_HASHES')
    ? JSON.parse(localStorage.getItem('GP_ORDER_TX_HASHES') as string)
    : EMPTY_PENDING_ORDERS_STATE

  return pendingOrders
}

export const reducer = (
  state: PendingOrdersState,
  action: Actions<{
    orders: PendingTxObj
    networkId: number
    pendingTxHash: string
  }>,
): PendingOrdersState => {
  switch (action.type) {
    case ActionTypes.SAVE_PENDING_ORDERS: {
      const { networkId, orders } = action.payload

      const stateSliceCopy = state[networkId].slice().concat(orders)
      const stateCopy = { ...state, [networkId]: stateSliceCopy }

      return stateCopy
    }
    case ActionTypes.REMOVE_PENDING_ORDERS: {
      const { networkId, pendingTxHash } = action.payload

      const stateSliceCopy = state[networkId].filter(({ txHash }: { txHash: string }) => txHash !== pendingTxHash)
      const stateCopy = { ...state, [networkId]: stateSliceCopy }

      return stateCopy
    }
    default:
      return state
  }
}
