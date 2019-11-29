import React, { useContext, useReducer } from 'react'
import { GlobalState, TokenLocalState } from 'reducers-actions'

const GlobalStateContext = React.createContext({})

export function withGlobalContext<P>(
  WrappedComponent: React.FC<P>,
  initialStateFunc: { (): { TokenRow: TokenLocalState }; (): Partial<GlobalState> },
  reducer: React.Reducer<Partial<GlobalState>, { type: string; payload: unknown }>,
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
