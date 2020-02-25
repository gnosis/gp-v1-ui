import { toast } from 'toastify'
import { assert } from '@gnosis.pm/dex-js'

import useSafeState from 'hooks/useSafeState'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { exchangeApi } from 'api'

import { logDebug } from 'utils'
import { txOptionalParams } from 'utils/transaction'
import { useCallback } from 'react'

interface Result {
  deleteOrders: (orderIds: string[]) => Promise<boolean>
  deleting: boolean
}

function extractExchangeOrderIds(orderIds: string[]): number[] {
  // For now, we simply convert string to number.
  // In the future the ids might be more complex, such as userAddress+orderId
  return orderIds.map(Number)
}

export function useDeleteOrders(): Result {
  const [deleting, setDeleting] = useSafeState<boolean>(false)
  const { userAddress, networkId } = useWalletConnection()

  const deleteOrders = useCallback(
    async (uiOrderIds: string[]): Promise<boolean> => {
      logDebug(`[OrdersWidget:useDeleteOrders] Trying to cancel the orderIds ${uiOrderIds} for user ${userAddress}`)

      try {
        assert(userAddress, 'User address is missing. Aborting.')
        assert(networkId, 'NetworkId is missing. Aborting.')
        assert(uiOrderIds.length > 0, 'No orders to cancel. Aborting.')

        setDeleting(true)

        const orderIds = extractExchangeOrderIds(uiOrderIds)

        const receipt = await exchangeApi.cancelOrders({ userAddress, orderIds, networkId, txOptionalParams })

        logDebug(`[OrdersWidget:useDeleteOrders] The transaction has been mined: ${receipt.transactionHash}`)

        toast.success('The selected orders have been cancelled')

        return true
      } catch (e) {
        console.error(`[OrdersWidget:useDeleteOrders] Failed to cancel orders ${uiOrderIds} for user ${userAddress}`, e)

        toast.error('Failed to cancel selected orders')

        return false
      } finally {
        setDeleting(false)
      }
    },
    [networkId, setDeleting, userAddress],
  )

  return { deleteOrders, deleting }
}
