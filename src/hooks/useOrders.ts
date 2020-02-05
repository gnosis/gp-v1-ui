import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'
import { AuctionElement, PendingTxArray } from 'api/exchange/ExchangeApi'
import useGlobalState from './useGlobalState'
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

export function useOrders(): { orders: AuctionElement[]; pendingOrders: PendingTxArray } {
  const { userAddress, networkId, blockNumber } = useWalletConnection()

  const [{ pendingOrders: pendingOrdersGlobal }] = useGlobalState()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])
  const [pendingOrders, setPendingOrders] = useSafeState(networkId ? pendingOrdersGlobal[networkId] : [])

  useEffect(() => {
    if (userAddress && networkId) {
      exchangeApi
        .getOrders({ userAddress, networkId })
        .then(filterDeletedOrders)
        .then(setOrders)
        .then(() => setPendingOrders(pendingOrdersGlobal[networkId]))
    }
    // updating list of orders on every block by listening on `blockNumber`
  }, [networkId, setOrders, userAddress, blockNumber, setPendingOrders, pendingOrders, pendingOrdersGlobal])

  return { orders, pendingOrders }
}
