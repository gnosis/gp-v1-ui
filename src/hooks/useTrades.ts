import { useState, useEffect } from 'react'
import { Trade } from 'api/exchange/ExchangeApi'
import { useWalletConnection } from './useWalletConnection'
import { getTrades } from 'services'

// TODO: move trades to global state
// TODO: (on global state) store trades to local storage
// TODO: account for reverts
// TODO: move trades/revert logic to a service
export function useTrades(): Trade[] {
  const [trades, setTrades] = useState<Trade[]>([])
  const { userAddress, networkId } = useWalletConnection()

  // const handleSubscription = useCallback(
  //   (trade: BaseTradeEvent): void => {
  //     console.warn(`new trade event!!! ${trade.orderId}`, trade)
  //     setTrades(currTrades => {
  //       currTrades.push(trade)
  //       return currTrades
  //     })
  //   },
  //   [setTrades],
  // )

  useEffect(() => {
    if (userAddress && networkId) {
      // TODO: polling/bloomfilter check for new trades
      getTrades({ userAddress, networkId }).then(setTrades)
    }
  }, [userAddress, networkId, setTrades])

  // latest first
  return trades.slice(0).reverse()
}
