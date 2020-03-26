import { useEffect, useCallback, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

import useGlobalState from './useGlobalState'
import { overwriteOrders, appendOrders, updateOffset } from 'reducers-actions/orders'

import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { ZERO } from 'const'

interface Result {
  orders: AuctionElement[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

/**
 * Filter out deleted orders.
 *
 * When orders are `deleted` from the contract, they are still returned, but with all fields set to zero.
 * We will not display such orders.
 *
 * @param orders all orders returned by the contract
 */
function filterDeletedOrders(orders: AuctionElement[]): AuctionElement[] {
  return orders.filter(
    order =>
      !(
        order.buyTokenId === 0 &&
        order.sellTokenId === 0 &&
        order.priceDenominator.eq(ZERO) &&
        order.priceNumerator.eq(ZERO) &&
        order.validFrom === 0 &&
        order.validUntil === 0
      ),
  )
}

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

        // Apply filters (remove deleted orders)
        const filteredOrders = filterDeletedOrders(orders)

        // ensures we don't have multiple reruns for each update
        // i.e. offset change -> render
        //      isLoading change -> another render
        unstable_batchedUpdates(() => {
          if (offset === 0) {
            // fresh start/refresh: replace whatever is stored
            dispatch(overwriteOrders(filteredOrders))
          } else if (filteredOrders.length > 0) {
            // incremental update: append
            dispatch(appendOrders(filteredOrders))
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
