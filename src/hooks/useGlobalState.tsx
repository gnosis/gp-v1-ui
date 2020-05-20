import React, { useContext, useCallback, useReducer, useRef, useMemo } from 'react'
import { GlobalState } from 'reducers-actions'
import { AnyAction } from 'combine-reducers'

import useDeepCompareRef from './useDeepCompareRef'

import enhanceDispatchWithMiddleware from 'middlewares'

const GlobalStateContext = React.createContext({})

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

    // apply middlewares and pass a state getting fn via ref and NO DEPS
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
