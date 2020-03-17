import React, { useContext, useReducer, useRef, useEffect } from 'react'
import { GlobalState } from 'reducers-actions'
import { AnyAction } from 'combine-reducers'
import { AuctionElement, PendingTxObj } from 'api/exchange/ExchangeApi'

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

export const useLastOrderIdRef = (
  orders: AuctionElement[],
  pendingOrders: PendingTxObj[],
): React.MutableRefObject<number> => {
  const lastOrderId = useRef(0)

  useEffect(() => {
    const ordersMaxId = orders.length && +orders[orders.length - 1].id
    const pendingOrdersMaxId = pendingOrders.length && +pendingOrders[pendingOrders.length - 1].id
    lastOrderId.current = Math.max(ordersMaxId, pendingOrdersMaxId)
  }, [orders, pendingOrders])

  return lastOrderId
}
