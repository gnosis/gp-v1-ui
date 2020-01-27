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

export function useOrders(): AuctionElement[] {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    userAddress &&
      networkId &&
      exchangeApi
        .getOrders({ userAddress, networkId })
        .then(filterDeletedOrders)
        .then(setOrders)
    // updating list of orders on every block by listening on `blockNumber`
  }, [networkId, setOrders, userAddress, blockNumber])

  return orders
}
