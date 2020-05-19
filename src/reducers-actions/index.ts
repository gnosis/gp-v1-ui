import combineReducers, { Reducer, AnyAction, Action } from 'combine-reducers'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from './tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
} from './pendingOrders'
import { reducer as OrdersReducer, OrdersState, INITIAL_ORDERS_STATE as orders } from './orders'
import { reducer as TradeReducer, TradeState, INITIAL_TRADE_STATE as trade } from './trade'
import {
  reducer as LocalTokensReducer,
  LocalTokensState,
  INITIAL_LOCAL_TOKENS_STATE as localTokens,
  sideEffect as LocalTokensSideEffect,
} from './localTokens'

export * from './tokenRow'

export interface Actions<T, P> {
  type: T
  payload: P
}

export interface GlobalState {
  tokens: TokenLocalState
  pendingOrders: PendingOrdersState
  orders: OrdersState
  trade: TradeState
  localTokens: LocalTokensState
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
    trade,
    localTokens,
  }
}

/**********************************
 * Side Effect after a reducer has run its course
 *
 * Allows to post-process state/slice of state
 * to log, save to Storage, etc.
 */

const addSideEffect = <S, A extends Action = AnyAction>(
  reducer: Reducer<S, A>,
  sideEffect: (newState: S, action: A) => void,
): Reducer<S, A> => {
  return (state: S, action: A): S => {
    const newState = reducer(state, action)

    sideEffect(newState, action)

    return newState
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
  trade: TradeReducer,
  localTokens: addSideEffect(LocalTokensReducer, LocalTokensSideEffect),
})
