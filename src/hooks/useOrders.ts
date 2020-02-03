import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { ZERO /* , GP_ORDER_TX_HASHES */, GP_ORDER_TX_HASHES } from 'const'
import { StateMap } from 'components/TradeWidget'

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

export function useOrders(): { orders: AuctionElement[]; pendingOrders: any } {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])
  const [pendingOrders, setPendingOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    if (userAddress && networkId) {
      exchangeApi
        .getOrders({ userAddress, networkId })
        .then(filterDeletedOrders)
        .then(setOrders)
    }
    // updating list of orders on every block by listening on `blockNumber`
  }, [networkId, setOrders, userAddress, blockNumber])

  useEffect(() => {
    if (networkId) {
      const stateCopy: StateMap = new Map(
        localStorage.getItem(GP_ORDER_TX_HASHES[networkId])
          ? JSON.parse(localStorage.getItem(GP_ORDER_TX_HASHES[networkId]) as string)
          : [],
      )

      setPendingOrders()
    }
  }, [networkId, setPendingOrders])

  return { orders, pendingOrders }
}
