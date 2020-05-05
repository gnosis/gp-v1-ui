import { useEffect, useCallback, useRef } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

import useGlobalState from './useGlobalState'
import { overwriteOrders, updateOffset, updateOrders } from 'reducers-actions/orders'

import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi, web3 } from 'api'
import { AuctionElement, PendingTxObj } from 'api/exchange/ExchangeApi'
import { useCheckWhenTimeRemainingInBatch } from './useTimeRemainingInBatch'
import { removePendingOrdersAction } from 'reducers-actions/pendingOrders'
import { REFRESH_WHEN_SECONDS_LEFT, EMPTY_ARRAY } from 'const'

interface Result {
  orders: AuctionElement[]
  pendingOrders: PendingTxObj[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [
    {
      orders: { orders, offset },
      pendingOrders,
    },
    dispatch,
  ] = useGlobalState()

  // Handle Pending Orders
  // pending orders are saved in global app state as well as local storage
  // users can refresh page after creating orders and see them after reload thanks for local storage
  // uses this effect hook to:
  //   1. listen to block updates and filter recently mined transactions based on their hash
  //   2. remove any orders that may have been re-sent at a higher gas price
  const currentPendingOrders = (userAddress && networkId && pendingOrders[networkId]?.[userAddress]) || EMPTY_ARRAY
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

        // don't dispatch unneccessarily
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

  // can only start loading when connection is ready. Keep it `false` until then
  const [isLoading, setIsLoading] = useSafeState<boolean>(false)

  useEffect(() => {
    // continue loading new orders
    // from current offset
    setIsLoading(true)
    // whenever new block is mined
  }, [blockNumber, setIsLoading])

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async (offset: number): Promise<void> => {
      // isLoading is the important one
      // controls ongoing fetching chain
      if (!userAddress || !networkId || !isLoading) {
        // next isLoading = true will be when userAddress and networkId are valid
        setIsLoading(false)
        return
      }

      // contract call
      try {
        const { orders, nextIndex } = await exchangeApi.getOrdersPaginated({ userAddress, networkId, offset })

        // check cancelled bool from parent scope
        if (cancelled) return

        // ensures we don't have multiple reruns for each update
        // i.e. offset change -> render
        //      isLoading change -> another render
        batchedUpdates(() => {
          if (orders.length > 0) {
            // update
            dispatch(updateOrders(orders))
          }

          if (!nextIndex) {
            // no more orders left
            // done fetching for now
            setIsLoading(false)
          }
          // move offset forward, fetch new batch
          dispatch(updateOffset(offset + orders.length))
        })
      } catch (error) {
        console.error('[useOrders] Failed to fetch orders', error)
        // TODO: inform user
        setIsLoading(false)
      }
    }

    fetchOrders(offset)

    // if offset changed mid-fetch
    // which happens when forceOrdersRefresh si called
    // ignore current fetch results
    return (): void => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, isLoading])

  // allow to fresh start/refresh on demand
  const forceOrdersRefresh = useCallback((): void => {
    dispatch(updateOffset(0))
    setIsLoading(true)
  }, [dispatch, setIsLoading])

  const runEffect = useRef(false)

  const forceRefreshUnlessOnMount = useCallback(() => {
    // don't refresh when first mounted
    // fetchOrders already runs onMount
    if (runEffect.current) forceOrdersRefresh()
  }, [forceOrdersRefresh])

  useCheckWhenTimeRemainingInBatch(REFRESH_WHEN_SECONDS_LEFT, forceRefreshUnlessOnMount)

  useEffect(() => {
    if (!runEffect.current) {
      runEffect.current = true
      return
    }
    forceOrdersRefresh()
    dispatch(overwriteOrders([]))
  }, [userAddress, networkId, forceOrdersRefresh, dispatch])

  return {
    orders,
    pendingOrders: currentPendingOrders,
    isLoading,
    forceOrdersRefresh,
  }
}
