import combineReducers from 'combine-reducers'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from './tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
} from './pendingOrders'
import {
  reducer as PriceSlippageReducer,
  PriceSlippageState,
  PRICE_SLIPPAGE_INITIAL_STATE as priceSlippage,
} from './priceSlippage'
import { reducer as OrdersReducer, OrdersState, INITIAL_ORDERS_STATE as orders } from './orders'
import { reducer as TradeReducer, TradeState, INITIAL_TRADE_STATE as trade } from './trade'

export * from './tokenRow'

export interface Actions<T, P> {
  type: T
  payload: P
}

export type ActionCreator<T, P> = (payload: P) => Actions<T, P>

export type ReducerCreator<S, A> = (state: S, action: A) => S

export interface GlobalState {
  tokens: TokenLocalState
  pendingOrders: PendingOrdersState
  priceSlippage: PriceSlippageState
  orders: OrdersState
  trade: TradeState
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
    priceSlippage,
    orders,
    trade,
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
  priceSlippage: PriceSlippageReducer,
  orders: OrdersReducer,
  trade: TradeReducer,
})
