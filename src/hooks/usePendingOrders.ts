import { useEffect, useMemo } from 'react'
// Hooks
import useGlobalState from './useGlobalState'
import { useWalletConnection } from './useWalletConnection'
// API
import { web3 } from 'api'
// Reducers/Actions
import { removePendingOrdersAction } from 'reducers-actions/pendingOrders'
// Constants/Types/Misc.
import { EMPTY_ARRAY } from 'const'
import { PendingTxObj } from 'api/exchange/ExchangeApi'

type Result = PendingTxObj[]

const usePendingOrders = (): Result => {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [{ pendingOrders }, dispatch] = useGlobalState()

  // Handle Pending Orders
  // pending orders are saved in global app state as well as local storage
  // users can refresh page after creating orders and see them after reload thanks for local storage
  // uses this effect hook to:
  //   1. listen to block updates and filter recently mined transactions based on their hash
  //   2. remove any orders that may have been re-sent at a higher gas price
  const currentPendingOrders = useMemo(
    () => (userAddress && networkId && pendingOrders[networkId]?.[userAddress]) || EMPTY_ARRAY,
    [networkId, pendingOrders, userAddress],
  )
  useEffect(() => {
    // Don't fire if there are no pending orders...
    if (userAddress && networkId && currentPendingOrders.length > 0) {
      const managePendingOrders = async (): Promise<void> => {
        const latestBlock = await web3.eth.getBlock(blockNumber || 'latest')

        // Set from block transaction array for easy lookup
        const transactionsSet = new Set(latestBlock.transactions)

        // check CURRENT pending orders txHash against the new block's
        // mined transaction list - return orders still pending
        let blockTransactionsFilteredPendingOrders = currentPendingOrders.filter(
          ({ txHash }: { txHash: string }) => !transactionsSet.has(txHash),
        )

        // if some orders are still pending
        if (blockTransactionsFilteredPendingOrders.length !== 0) {
          // can return Transaction receipt as Pending/Mined OR null
          // Pending TransactionReceipt will not have blockNumber/Hash or transactionIndex
          // Mined TransactionRceipt WILL have the above props filled
          // null indicates dropped tx
          const transactionStatusArray = await Promise.all(
            blockTransactionsFilteredPendingOrders.map(order => web3.eth.getTransaction(order.txHash)),
          )

          // Remove orders that are NULL and/or orders that have a blockNumber (indicating mined status)
          // e.g [null, { blockNumber: 19082137, ... }, ...]
          blockTransactionsFilteredPendingOrders = blockTransactionsFilteredPendingOrders.filter(
            (_, index) => !!transactionStatusArray[index] && !transactionStatusArray[index].blockNumber,
          )
        }

        // Dispatch if a pending transaction was mined
        if (blockTransactionsFilteredPendingOrders.length !== currentPendingOrders.length) {
          // Remove from global
          dispatch(
            removePendingOrdersAction({
              networkId,
              userAddress,
              orders: blockTransactionsFilteredPendingOrders,
            }),
          )
        }
      }

      managePendingOrders()
    }
  }, [currentPendingOrders, blockNumber, networkId, userAddress, dispatch])

  return currentPendingOrders
}

export default usePendingOrders
