import React, { useContext, useReducer, useCallback, useRef, useMemo } from 'react'
import { GlobalState } from 'reducers-actions'
import { AnyAction } from 'combine-reducers'
import { isEqual } from 'lodash'

import { pendingOrdersAndLocalStorage, Middleware } from 'middlewares'
import { compose } from 'utils'

const GlobalStateContext = React.createContext({})

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

function useDeepCompareRef<R>(value?: R): R | undefined {
  const ref = useRef<R | undefined>()

  if (!isEqual(value, ref.current)) {
    ref.current = value
  }

  return ref.current
}

// Not working... looping infinitely
// function useDeepCheckCallback(callback: (...args: any[]) => any, deps: unknown[]): (...args: any[]) => any {
//   return useCallback(callback, useDeepCompareRef<any>(deps))
// }

export function withGlobalContext<P>(
  WrappedComponent: React.FC<P>,
  initialStateFunc: () => GlobalState,
  reducer: React.Reducer<GlobalState, AnyAction>,
): (props: P) => JSX.Element {
  return function WrappedComponentWithGlobalState(props: P): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialStateFunc())
    // hold a reference to state here
    const stateRef = useRef(state)
    // deep check there are no majour changes
    // between updates
    const deepState = useDeepCompareRef(state)
    // set new ref current value if no deep changes
    useMemo(() => {
      stateRef.current = deepState as GlobalState
    }, [deepState])
    const enhanceDispatchWithMiddleware = applyMiddlewares(pendingOrdersAndLocalStorage)
    // apply middlewares and pass a state getting fn via ref and NO DEPS
    const enhancedDispatch = useCallback(
      enhanceDispatchWithMiddleware(() => stateRef.current, dispatch),
      [],
    )

    process.env.NODE_ENV === 'development' && (window['eDispatch'] = enhancedDispatch)

    return (
      <GlobalStateContext.Provider value={[deepState, enhancedDispatch]}>
        <WrappedComponent {...props} />
      </GlobalStateContext.Provider>
    )
  }
}

const useGlobalState = (): [GlobalState, React.Dispatch<AnyAction>] =>
  useContext(GlobalStateContext) as [GlobalState, React.Dispatch<AnyAction>]

export default useGlobalState
