import { useEffect } from 'react'

import { Trade } from 'api/exchange/ExchangeApi'

import { getTrades } from 'services'

import { appendTrades } from 'reducers-actions/trades'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useGlobalState from 'hooks/useGlobalState'

// TODO: (on global state) store trades to local storage
// TODO: account for reverts
export function useTrades(): Trade[] {
  const [
    {
      trades: { trades, lastCheckedBlock },
    },
    dispatch,
  ] = useGlobalState()
  const { userAddress, networkId, blockNumber } = useWalletConnection()

  useEffect(() => {
    if (userAddress && networkId && blockNumber && (!lastCheckedBlock || lastCheckedBlock < blockNumber)) {
      // TODO: right now checking for new trades on every block.
      // TODO: for optimization, use a polling interval OR bloomfilter
      getTrades({ userAddress, networkId, fromBlock: lastCheckedBlock }).then(newTrades =>
        dispatch(appendTrades(newTrades, blockNumber)),
      )
    }
  }, [userAddress, networkId, blockNumber, lastCheckedBlock, dispatch])

  // latest first
  return trades.slice(0).reverse()
}
