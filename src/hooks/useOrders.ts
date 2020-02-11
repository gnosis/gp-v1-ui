import { useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

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
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])
  //  consider first state to be loading
  const [isLoading, setIsLoading] = useSafeState<boolean>(true)
  // start fetching from 0
  const [offset, setOffset] = useSafeState<number>(0)

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async (offset: number): Promise<void> => {
      // isLoading is the important one
      // controls ongoing fetching chain
      if (!userAddress || !networkId || !isLoading) return

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
            setOrders(filteredOrders)
          } else {
            // incremental update: append
            setOrders(oldOrders => oldOrders.concat(filteredOrders))
          }

          if (!nextIndex) {
            // no more orders left
            // done fetching for now
            setIsLoading(false)
          }
          // move offset forward, fetch new batch
          setOffset(offset + orders.length)
        })
      } catch (error) {
        console.error('Failed to fetch orders', error)
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

  useEffect(() => {
    // continue loading new orders
    // from current offset
    setIsLoading(true)
    // whenever new block is mined
  }, [blockNumber, setIsLoading])

  // allow to fresh start/refresh on demand
  const forceOrdersRefresh = useCallback((): void => {
    setOffset(0)
    setIsLoading(true)
  }, [setIsLoading, setOffset])

  useEffect(() => {
    forceOrdersRefresh()
    setOrders([])
  }, [userAddress, networkId, forceOrdersRefresh, setOrders])

  return { orders, isLoading, forceOrdersRefresh }
}
