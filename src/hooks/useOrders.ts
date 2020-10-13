import { useEffect, useCallback, useRef } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

// API + Reducer/Actions
import { exchangeApi } from 'api'
import { getTokenFromExchangeById } from 'services'
import { overwriteOrders, updateOffset, updateOrders } from 'reducers-actions/orders'
// Hooks
import useSafeState from './useSafeState'
import useGlobalState from './useGlobalState'
import { useWalletConnection } from './useWalletConnection'
import usePendingOrders from './usePendingOrders'
import { useCheckWhenTimeRemainingInBatch } from './useTimeRemainingInBatch'
import { useTokenList } from './useTokenList'

// Constants/Types
import { REFRESH_WHEN_SECONDS_LEFT } from 'const'
import { DetailedAuctionElement, DetailedPendingOrder } from 'api/exchange/ExchangeApi'

interface Result {
  orders: DetailedAuctionElement[]
  pendingOrders: DetailedPendingOrder[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [
    {
      orders: { orders, offset },
    },
    dispatch,
  ] = useGlobalState()

  // TODO: check this - currently in use for subscription
  // to change in token list to trigger update of orders
  // and the incorrect state shown sometimes when loading app from
  // fresh state and seeing incorrect token list Issue #1486
  const { tokens, isListReady } = useTokenList({ networkId })

  // Pending Orders
  const pendingOrders = usePendingOrders()

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
      if (!userAddress || !networkId || !isLoading || !isListReady) {
        // next isLoading = true will be when userAddress and networkId are valid
        setIsLoading(false)
        return
      }

      // contract call
      try {
        const { orders: ordersPreTokenDetails, nextIndex } = await exchangeApi.getOrdersPaginated({
          userAddress,
          networkId,
          offset,
        })

        const ordersPromises = ordersPreTokenDetails.map(async (order) => {
          const [sellToken, buyToken] = await Promise.all([
            getTokenFromExchangeById({ tokenId: order.sellTokenId, networkId }),
            getTokenFromExchangeById({ tokenId: order.buyTokenId, networkId }),
          ])

          return {
            ...order,
            sellToken,
            buyToken,
          }
        })

        // check cancelled bool from parent scope
        if (cancelled) return

        const orders: DetailedAuctionElement[] = await Promise.all(ordersPromises)
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
  }, [offset, isLoading, isListReady])

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
    // Subscribe to tokens change to force orders refresh
  }, [tokens, userAddress, networkId, forceOrdersRefresh, dispatch])

  return {
    orders,
    pendingOrders,
    isLoading,
    forceOrdersRefresh,
  }
}
