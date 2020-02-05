import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { GP_ORDER_TX_HASHES } from 'const'

export const enum ActionTypes {
  SAVE_PENDING_ORDERS = 'SAVE_PENDING_ORDERS',
  REMOVE_PENDING_ORDERS = 'REMOVE_PENDING_ORDERS',
}

interface Actions {
  type: ActionTypes
  payload: PendingTxObj & { pendingTxHash?: string; networkId: number }
}

export const savePendingOrdersAction = (payload: PendingTxObj & { networkId: number }): Actions => ({
  type: ActionTypes.SAVE_PENDING_ORDERS,
  payload,
})

export const removePendingOrdersAction = (
  payload: PendingTxObj & { pendingTxHash: string; networkId: number },
): Actions => ({
  type: ActionTypes.REMOVE_PENDING_ORDERS,
  payload,
})

export type PendingOrdersState = typeof GP_ORDER_TX_HASHES

export const PendingOrdersInitialState: () => PendingOrdersState = () => {
  const pendingOrders: typeof GP_ORDER_TX_HASHES = localStorage.getItem('GP_ORDER_TX_HASHES')
    ? JSON.parse(localStorage.getItem('GP_ORDER_TX_HASHES') as string)
    : []

  console.debug('pendingOrders', pendingOrders)

  return pendingOrders
}

// export const PendingOrdersInitialState = []

export const reducer = (state: PendingOrdersState, action: Actions): PendingOrdersState => {
  switch (action.type) {
    case ActionTypes.SAVE_PENDING_ORDERS: {
      const stateCopy = state[action.payload.networkId].slice().concat(action.payload)

      return stateCopy
    }
    case ActionTypes.REMOVE_PENDING_ORDERS: {
      const stateCopy = state[action.payload.networkId].filter(
        ({ txHash }: { txHash: string }) => txHash !== action.payload.pendingTxHash,
      )

      return stateCopy
    }
    default:
      return state
  }
}
