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
  const { userAddress, networkId, blockNumber } = useWalletConnection()

  useEffect(() => {
    if (userAddress && networkId && blockNumber) {
      // TODO: right now checking for new trades on every block.
      // TODO: for optimization, use a polling interval OR bloomfilter
      // TODO: no duplicate check, do that, preferably on global state directly
      getTrades({ userAddress, networkId }).then(newTrades => setTrades(currTrades => currTrades.concat(newTrades)))
    }
  }, [userAddress, networkId, blockNumber, setTrades])

  // latest first
  return trades.slice(0).reverse()
}
