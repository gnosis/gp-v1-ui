import { GlobalState } from 'reducers-actions'
import { logDebug, setStorageItem } from 'utils'
import { GP_PENDING_ORDER_KEY } from 'const'
import { Middleware } from './types'

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

    let newState: GlobalState['pendingOrders']
    const userPendingOrdersArr = state[networkId][userAddress] ? state[networkId][userAddress] : []
    // add/remove pending orders to localStorage
    if (action.type === 'SAVE_PENDING_ORDERS') {
      // save 'em
      const newPendingTxArray = userPendingOrdersArr.concat(orders)
      newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: newPendingTxArray } }
    } else {
      // delete 'em
      newState = { ...state, [networkId]: { ...state[networkId], [userAddress]: orders } }
    }
    setStorageItem(GP_PENDING_ORDER_KEY, newState)
  }
  // Run next dispatch
  return next(action)
}

export default pendingOrdersAndLocalStorage
