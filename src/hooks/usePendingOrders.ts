import { useEffect } from 'react'

import useGlobalState from './useGlobalState'
import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'
import { DetailedAuctionElement } from 'api/exchange/ExchangeApi'
import { getTokenFromExchangeById } from 'services'

export interface DetailedPendingOrder extends DetailedAuctionElement {
  txHash?: string
}

function usePendingOrders(): DetailedPendingOrder[] {
  const { userAddress, networkId } = useWalletConnection()

  const [{ pendingOrders: pendingOrdersGlobal }] = useGlobalState()
  const [pendingOrders, setPendingOrders] = useSafeState<DetailedPendingOrder[]>([])

  useEffect(() => {
    async function getDetailedPendingOrders(): Promise<void> {
      if (userAddress && networkId) {
        const pendingOrdersByNetwork = pendingOrdersGlobal[networkId][userAddress] || []

        const ordersPromises = pendingOrdersByNetwork.map(async order => {
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

        const orders: DetailedPendingOrder[] = await Promise.all(ordersPromises)
        setPendingOrders(orders)
      }
    }
    getDetailedPendingOrders()
  }, [networkId, pendingOrdersGlobal, setPendingOrders, userAddress])
  return pendingOrders
}

export default usePendingOrders
