import pendingOrdersAndLocalStorage from './pendingOrdersToLocalStorage'
import { GlobalState } from 'reducers-actions'

import { compose } from 'utils'

import { AnyAction } from 'combine-reducers'
import { Middleware } from './types'

const dispatchThatReturnsAction = (dispatch: React.Dispatch<AnyAction>) => (action: AnyAction): AnyAction => {
  dispatch(action)
  return action
}

const applyMiddlewares = (...middlewares: Middleware[]) => (
  getState: () => GlobalState,
  dispatch: React.Dispatch<AnyAction>,
): React.Dispatch<AnyAction> => {
  // fire off each middleware
  const middlewareChain = middlewares
    // ==============> e.g logger(getState, dispatch)
    // returns ======> e.g loggerDispatch(next)(action)
    .map(middleware => middleware(getState, dispatch))

  const enhancedDispatch = compose(...middlewareChain)(dispatchThatReturnsAction(dispatch))

  return enhancedDispatch
}

/**
 * ApplyMiddleware Chain
 * Pass middlewares as function arguments
 */
const enhancedDispatchWithMiddleware = applyMiddlewares(pendingOrdersAndLocalStorage)

export { enhancedDispatchWithMiddleware as default, Middleware }
