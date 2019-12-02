import React, { useContext, useReducer } from 'react'
import { GlobalState } from 'reducers-actions'
import { AnyAction } from 'combine-reducers'

const GlobalStateContext = React.createContext({})

export function withGlobalContext<P>(
  WrappedComponent: React.FC<P>,
  initialStateFunc: () => GlobalState,
  reducer: React.Reducer<GlobalState, AnyAction>,
): (props: P) => JSX.Element {
  return function WrappedComponentWithGlobalState(props: P): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialStateFunc())

    return (
      <GlobalStateContext.Provider value={[state, dispatch]}>
        <WrappedComponent {...props} />
      </GlobalStateContext.Provider>
    )
  }
}

const useGlobalState = (): [GlobalState, Function] => useContext(GlobalStateContext) as [GlobalState, Function]

export default useGlobalState
