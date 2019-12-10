import { AuctionElement } from 'types'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi, tokenListApi } from 'api'
import { useEffect } from 'react'

export function useOrders(): AuctionElement[] {
  const { userAddress, networkId } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])

  useEffect(() => {
    userAddress && exchangeApi.getOrders(userAddress).then(setOrders)
  }, [setOrders, userAddress])

  useEffect(() => {
    // whenever orders or network change, update token list
    networkId && tokenListApi.updateTokenIdsForNetwork(networkId)
  }, [networkId, orders])

  return orders
}
