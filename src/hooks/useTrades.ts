import { useEffect } from 'react'

import { Trade } from 'api/exchange/ExchangeApi'

import { getTrades } from 'services'

import { appendTrades, updateLastCheckedBlock } from 'reducers-actions/trades'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useGlobalState from 'hooks/useGlobalState'
import { CONFIRMATION_BLOCKS } from 'const'

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
    // Check only up to `latest - CONFIRMATION_BLOCKS` to reduce chance of re-orgs
    const toBlock = blockNumber && blockNumber - CONFIRMATION_BLOCKS

    if (userAddress && networkId && toBlock && (!lastCheckedBlock || lastCheckedBlock < toBlock)) {
      getTrades({
        userAddress,
        networkId,
        // fromBlock is inclusive. If set, add 1 to avoid duplicates, otherwise return undefined
        fromBlock: !lastCheckedBlock ? lastCheckedBlock : lastCheckedBlock + 1,
        toBlock,
      }).then(newTrades =>
        dispatch(newTrades.length > 0 ? appendTrades(newTrades, toBlock) : updateLastCheckedBlock(toBlock)),
      )
    }
  }, [userAddress, networkId, blockNumber, lastCheckedBlock, dispatch])

  // latest first
  return trades.slice(0).reverse()
}
