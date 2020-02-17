import combineReducers from 'combine-reducers'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from './tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
} from './pendingOrders'
import { reducer as OrdersReducer, OrdersState, INITIAL_ORDERS_STATE as orders } from './orders'

export * from './tokenRow'

export interface Actions<T, P> {
  type: T
  payload: P
}

export interface GlobalState {
  tokens: TokenLocalState
  pendingOrders: PendingOrdersState
  orders: OrdersState
}

/**********************************
 * Initial Global State
 *
 * Sets app's initial global state
 * make sure the name of the state key(s) is/are the same as the reducer key(s) below
 */

export const INITIAL_STATE = (): GlobalState => {
  return {
    tokens,
    pendingOrders,
    orders,
  }
}

/**********************************
 * combineReducers
 *
 * reduces all reducers into 1 reducer function
 * make sure the name of the Reducer key is the same as the state key you'd like from src/App
 */
export const rootReducer = combineReducers({
  tokens: TokenRowReducer,
  pendingOrders: PendingOrderReducer,
  orders: OrdersReducer,
})
