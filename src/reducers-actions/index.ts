/* eslint-disable @typescript-eslint/no-empty-interface */
import { reducer as TokenRowReducer, TokenLocalState } from './tokenRow'
import combineReducers from './combineReducers'

export * from './tokenRow'

export interface GlobalState {
  TokenRow: TokenLocalState
}

/**********************************
 * combineReducers
 *
 * reduces all reducers into 1 reducer function
 * make sure the name of the Reducer key is the same as the state key you'd like from src/App
 */
export const rootReducer = combineReducers({
  TokenRow: TokenRowReducer,
})
