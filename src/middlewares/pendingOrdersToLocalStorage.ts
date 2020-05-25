import { logDebug, setStorageItem } from 'utils'
import { STORAGE_PENDING_ORDER_KEY } from 'const'
import { Middleware } from './types'
import { PendingOrdersState } from 'reducers-actions/pendingOrders'

const pendingOrdersAndLocalStorage: Middleware = getState => next => (action): void => {
  if (action.type === 'SAVE_PENDING_ORDERS' || action.type === 'REMOVE_PENDING_ORDERS') {
    const { pendingOrders: state } = getState()

    logDebug(`
          =====> 
          PENDING ORDERS UPDATED
      
          P-ORDERS:
          ${JSON.stringify(action.payload.orders, undefined, 2)}
          =====>
      `)

    const { networkId, orders, userAddress } = action.payload

    const currentPendingOrders = state[networkId][userAddress] ? state[networkId][userAddress] : []

    // if saving new pending orders, concat new orders to current state pending orders
    // else we are deleting and we can use the filtered result passed as payload (orders)
    const newCalculatedState = action.type === 'SAVE_PENDING_ORDERS' ? currentPendingOrders.concat(orders) : orders

    const newState: PendingOrdersState = {
      ...state,
      [networkId]: {
        ...state[networkId],
        [userAddress]: newCalculatedState,
      },
    }

    setStorageItem(STORAGE_PENDING_ORDER_KEY, newState)
  }
  // Run next dispatch
  return next(action)
}

export default pendingOrdersAndLocalStorage
