import { useEffect } from 'react'
import { pendingApi } from 'api'

import useGlobalState from './useGlobalState'
import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'
import { PendingTxArray } from 'api/pending/PendingApi'

function usePendingOrders(): PendingTxArray {
  const { userAddress, networkId } = useWalletConnection()

  const [{ pendingOrders: pendingOrdersGlobal }] = useGlobalState()
  const [pendingOrders, setPendingOrders] = useSafeState<PendingTxArray>([])

  useEffect(() => {
    if (userAddress && networkId) {
      pendingApi
        .getOrders({ userAddress, networkId })
        .then(pendingOrders => {
          setPendingOrders(pendingOrders)
        })
        .catch(error => {
          // TODO: Handle error when
          console.error('[usePendingOrders] Error getting pending orders', error)
        })
    }
  }, [networkId, pendingOrdersGlobal, setPendingOrders, userAddress])

  return pendingOrders
}

export default usePendingOrders
