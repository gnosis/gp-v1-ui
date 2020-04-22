import { useEffect, useCallback, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

import useGlobalState from './useGlobalState'
import { overwriteOrders, updateOffset, updateOrders } from 'reducers-actions/orders'

import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { useCheckWhenTimeRemainingInBatch } from './useTimeRemainingInBatch'

interface Result {
  orders: AuctionElement[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

const REFRESH_WHEN_SECONDS_LEFT = 60 // 1min before batch done
// solutions submitted at this point

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [
    {
      orders: { orders, offset },
    },
    dispatch,
  ] = useGlobalState()

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

  return { orders, isLoading, forceOrdersRefresh }
}
