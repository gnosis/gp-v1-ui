import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'
import { AuctionElement } from 'api/exchange/ExchangeApi'

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
        !order.buyTokenId &&
        !order.sellTokenId &&
        !order.priceDenominator &&
        !order.priceNumerator &&
        !order.validFrom &&
        !order.validUntil
      ),
  )
}

export function useOrders(): AuctionElement[] {
  const { userAddress } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    userAddress &&
      exchangeApi
        .getOrders(userAddress)
        .then(filterDeletedOrders)
        .then(setOrders)
  }, [setOrders, userAddress])

  return orders
}
