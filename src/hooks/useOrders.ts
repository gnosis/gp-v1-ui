import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'
import { AuctionElement } from 'api/exchange/ExchangeApi'

export function useOrders(): AuctionElement[] {
  const { userAddress } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    userAddress && exchangeApi.getOrders(userAddress).then(setOrders)
  }, [setOrders, userAddress])

  return orders
}
