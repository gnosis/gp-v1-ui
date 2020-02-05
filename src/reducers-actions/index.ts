import combineReducers from 'combine-reducers'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from './tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
} from './pendingOrders'

export * from './tokenRow'

export interface GlobalState {
  tokens: TokenLocalState
  pendingOrders: PendingOrdersState
}

/**********************************
 * Initial Global State
 *
 * Sets app's initial global state
 * make sure the name of the state key(s) is/are the same as the reducer key(s) below
 */

export const INITIAL_STATE: () => GlobalState = () => {
  const initiatedPendingOrders = pendingOrders()
  return {
    tokens,
    pendingOrders: initiatedPendingOrders,
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
})
