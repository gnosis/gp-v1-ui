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

// const composeReducers = <S, A extends CAction = AnyAction>(...reducers: Reducer<S, A>[]): Reducer<S, A> => {
//   if (reducers.length === 0) return (state: S): S => state

//   if (reducers.length === 1) return reducers[1]

//   return reducers.reduce((prev, curr) => {
//     return (state: S, action: A): S => {
//       const newState = prev(state, action)
//       return curr(newState, action)
//     }
//   })
// }

// const savePending = (state: GlobalState): void => {
//   console.log('Saving', state.pendingOrders)
//   // save to storage
// }

// const postReducer = (state: GlobalState, action: AnyAction): GlobalState => {
//   switch (action.type) {
//     case PendingOrdersActionTypes.SAVE_PENDING_ORDERS:
//       // save to storage
//       savePending(state)
//       return state

//     default:
//       return state
//   }
// }

// const composed = composeReducers(rootReducer, postReducer)

// const addSideEffect = <S, A extends CAction = AnyAction>(
//   reducer: Reducer<S, A>,
//   sideEffect: (newState: S, action: A) => void,
// ): Reducer<S, A> => {
//   return (state: S, action: A): S => {
//     const newState = reducer(state, action)

//     sideEffect(newState, action)

//     return newState
//   }
// }

// const postEffect = (state: GlobalState, action: AnyAction): void => {
//   switch (action.type) {
//     case PendingOrdersActionTypes.SAVE_PENDING_ORDERS:
//       // save to storage
//       savePending(state)
//       break
//   }
// }

// const withLogger = addSideEffect(rootReducer, postEffect)
