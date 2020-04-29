import { useEffect, useCallback, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

import useGlobalState from './useGlobalState'
import { overwriteOrders, updateOffset, updateOrders } from 'reducers-actions/orders'

import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi, web3 } from 'api'
import { AuctionElement, PendingTxObj } from 'api/exchange/ExchangeApi'
import { useCheckWhenTimeRemainingInBatch } from './useTimeRemainingInBatch'
import { removePendingOrdersAction } from 'reducers-actions/pendingOrders'
import { setStorageItem } from 'utils'

interface Result {
  orders: AuctionElement[]
  pendingOrders: PendingTxObj[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

export const GP_PENDING_ORDER_KEY = 'GP_ORDER_TX_HASHES'
const REFRESH_WHEN_SECONDS_LEFT = 60 // 1min before batch done
const emptyArray: PendingTxObj[] = []

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [
    {
      orders: { orders, offset },
      pendingOrders,
    },
    dispatch,
  ] = useGlobalState()

  const currentPendingOrders: PendingTxObj[] =
    (networkId && userAddress && pendingOrders[networkId] && pendingOrders[networkId][userAddress]) || emptyArray

  useEffect(() => {
    // Don't fire if there are no pending orders...
    if (networkId && userAddress && currentPendingOrders.length > 0) {
      const managePendingOrders = async (): Promise<void> => {
        const [latestBlock, pendingOrderStatuses] = await Promise.all([
          web3.eth.getBlock(blockNumber || 'latest'),
          Promise.all(currentPendingOrders.map(({ txHash }) => web3.eth.getTransaction(txHash))),
        ])

        const transactionsToRemoveArray = pendingOrderStatuses
          // order.status === null? transaction has been dropped
          // add latter txHash to arr of removable transactions
          .reduce<string[]>(
            (acc, status, index) => (!status ? acc.concat(currentPendingOrders[index].txHash) : acc),
            latestBlock.transactions,
          )

        const transactionsSet = new Set(transactionsToRemoveArray)

        const filteredPendingOrders = currentPendingOrders.filter(
          ({ txHash }: { txHash: string }) => !transactionsSet.has(txHash),
        )

        // don't dispatch unneccessarily
        if (filteredPendingOrders.length !== currentPendingOrders.length) {
          // Remove from global
          dispatch(
            removePendingOrdersAction({
              networkId,
              userAddress,
              filteredOrders: filteredPendingOrders,
            }),
          )
        }
      }

      managePendingOrders()
    }
  }, [currentPendingOrders, blockNumber, networkId, userAddress, dispatch])

  useEffect(() => {
    setStorageItem(GP_PENDING_ORDER_KEY, pendingOrders)
  }, [pendingOrders])

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
        unstable_batchedUpdates(() => {
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
