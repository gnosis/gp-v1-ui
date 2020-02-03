import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { ZERO } from 'const'

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

interface Result {
  orders: AuctionElement[]
  forceOrdersRefresh: () => void
}

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])
  const [lastSeenOrderId, setLastSeenOrderId] = useSafeState<number>(-1)
  const [offset, setOffset] = useSafeState<number | undefined>(undefined)

  /**
   * Forces the immediate refresh of orders
   */
  function forceOrdersRefresh(): void {
    // Setting `offset` to 0 triggers a new query from the start
    setOffset(0)
  }

  useEffect(() => {
    // whenever there's a state change (new block, network /address change),
    // set `offset` to trigger a new query
    setOffset(lastSeenOrderId + 1)
  }, [blockNumber, networkId, userAddress])

  useEffect(() => {
    userAddress &&
    networkId &&
    offset !== undefined && // stop querying for new orders when there are no more pages
      exchangeApi.getOrdersPaginated({ userAddress, networkId, offset }).then(({ orders, nextIndex }) => {
        if (orders.length) {
          // Save the id of last order before filtering
          const orderId = +orders[orders.length - 1].id

          // Apply filters (remove deleted orders)
          const filteredOrders = filterDeletedOrders(orders)

          // Store new orders, if any
          if (offset === 0) {
            // fresh start/refresh: replace whatever is stored
            setOrders(filteredOrders)
          } else if (filteredOrders.length) {
            // incremental update: append
            setOrders(curr => curr.concat(filteredOrders))
          }

          // Save the last seen order
          setLastSeenOrderId(orderId)
        }

        // `nextIndex` can be `undefined`, which means there are no more pages
        // and causes the querying to stop
        setOffset(nextIndex)
      })
    // Update ONLY when `offset` changes
  }, [offset])

  return { orders, forceOrdersRefresh }
}
