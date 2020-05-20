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

    let newState: PendingOrdersState
    const userPendingOrders = state[networkId][userAddress] ? state[networkId][userAddress] : []
    // add/remove pending orders to localStorage
    if (action.type === 'SAVE_PENDING_ORDERS') {
      // save 'em
      const newPendingTxArray = userPendingOrders.concat(orders)
      newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }
    } else {
      // delete 'em
      newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: orders } }
    }
    setStorageItem(STORAGE_PENDING_ORDER_KEY, newState)
  }
  // Run next dispatch
  return next(action)
}

export default pendingOrdersAndLocalStorage
