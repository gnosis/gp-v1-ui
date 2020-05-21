import { useState, useEffect, useCallback } from 'react'
import { BaseTradeEvent } from 'api/exchange/ExchangeApi'
import { useWalletConnection } from './useWalletConnection'
import { exchangeApi } from 'api'

// TODO: move trades to global state
// TODO: (on global state) store trades to local storage
// TODO: account for reverts
// TODO: move trades/revert logic to a service
// TODO: enrich trade event data with data from block and order
export function useTrades(): BaseTradeEvent[] {
  const [trades, setTrades] = useState<BaseTradeEvent[]>([])
  const { userAddress, networkId } = useWalletConnection()

  const handleSubscription = useCallback(
    (trade: BaseTradeEvent): void => {
      console.warn(`new trade event!!! ${trade.orderId}`, trade)
      setTrades(currTrades => {
        currTrades.push(trade)
        return currTrades
      })
    },
    [setTrades],
  )

  useEffect(() => {
    if (userAddress && networkId) {
      exchangeApi
        // get past trades all at once
        .getPastTrades({ userAddress, networkId })
        .then(setTrades)
        // subscribe for new trade events
        .then(() => exchangeApi.subscribeToTradeEvent({ userAddress, networkId, callback: handleSubscription }))
    }

    return (): void => exchangeApi.unsubscribeToTradeEvent()
  }, [userAddress, networkId, setTrades, handleSubscription])

  // latest first
  return trades.slice(0).reverse()
}
