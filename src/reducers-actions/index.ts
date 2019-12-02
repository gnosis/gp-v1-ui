import combineReducers from 'combine-reducers'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as TOKENS } from './tokenRow'

export * from './tokenRow'

export interface GlobalState {
  TOKENS: TokenLocalState
}

/**********************************
 * Initial Global State
 *
 * Sets app's initial global state
 * make sure the name of the state key(s) is/are the same as the reducer key(s) below
 */

export const INITIAL_STATE: GlobalState = {
  TOKENS,
}

/**********************************
 * combineReducers
 *
 * reduces all reducers into 1 reducer function
 * make sure the name of the Reducer key is the same as the state key you'd like from src/App
 */
export const rootReducer = combineReducers({
  TOKENS: TokenRowReducer,
})
