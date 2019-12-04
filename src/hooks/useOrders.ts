import { AuctionElement } from 'types'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { useEffect } from 'react'

export function useOrders(): AuctionElement[] {
  const { userAddress } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    exchangeApi.getOrders(userAddress as string).then(_orders => {
      setOrders(_orders)
    })
  }, [setOrders, userAddress])

  return orders
}
