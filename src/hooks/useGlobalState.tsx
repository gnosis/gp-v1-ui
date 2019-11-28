/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useContext, useReducer } from 'react'
import { GlobalState } from 'reducers-actions'

const GlobalStateContext = React.createContext({})

export const withGlobalContext = (
  WrappedComponent: React.FC<{}> | any,
  initialStateFunc: { (): { enabling: Set<string>; highlighted: Set<string>; claiming: Set<string> }; (): unknown },
  reducer: React.Reducer<Partial<GlobalState>, { type: string; payload: unknown }>,
) => (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialStateFunc())

  return (
    <GlobalStateContext.Provider value={[state, dispatch]}>
      <WrappedComponent {...props} />
    </GlobalStateContext.Provider>
  )
}

const useGlobalState = (): [GlobalState, Function] => useContext(GlobalStateContext) as [GlobalState, Function]

export default useGlobalState
