import { useEffect } from 'react'

import useGlobalState from './useGlobalState'
import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'
import { PendingTxArray } from 'api/exchange/ExchangeApi'

function usePendingOrders(): PendingTxArray {
  const { userAddress, networkId } = useWalletConnection()

  const [{ pendingOrders: pendingOrdersGlobal }] = useGlobalState()
  const [pendingOrders, setPendingOrders] = useSafeState<PendingTxArray>([])

  useEffect(() => {
    if (userAddress && networkId) {
      setPendingOrders(pendingOrdersGlobal[networkId][userAddress] || [])
    }
  }, [networkId, pendingOrdersGlobal, setPendingOrders, userAddress])
  return pendingOrders
}

export default usePendingOrders
