import { Middleware } from './types'
import { ActionTypes as PendingOrdersActionTypes } from 'reducers-actions/pendingOrders'

import { setStorageItem } from 'utils'
import { GP_PENDING_ORDER_KEY } from 'const'
import { GlobalState } from 'reducers-actions'

const logger: Middleware = getState => next => (action): void => {
  process.env.NODE_ENV === 'development' &&
    console.debug(`
        =====> 
        ACTION FIRED: ${action.type}
        --
        ACTION PAYLOAD: ${action.payload}
        --
        PREVIOUS STATE: ${getState()}
        =====>
    `)

  // run next middleware and/or dispatch final
  return next(action)
}

const pendingOrdersAndLocalStorage: Middleware = getState => next => (action): void => {
  if (
    action.type === PendingOrdersActionTypes.SAVE_PENDING_ORDERS ||
    action.type === PendingOrdersActionTypes.REMOVE_PENDING_ORDERS
  ) {
    const { pendingOrders: state } = getState()

    process.env.NODE_ENV === 'development' &&
      console.debug(`
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
    if (action.type === PendingOrdersActionTypes.SAVE_PENDING_ORDERS) {
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

export { logger, pendingOrdersAndLocalStorage, Middleware }
