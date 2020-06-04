import { useEffect } from 'react'

import { BATCH_TIME } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'
import { web3 } from 'api'

import { getTrades } from 'services'

import { appendTrades, updateLastCheckedBlock, overwriteTrades } from 'reducers-actions/trades'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useGlobalState from 'hooks/useGlobalState'

import { BATCH_TIME_IN_MS } from 'const'

import { getTimeRemainingInBatch } from 'utils'

// TODO: (on global state) store trades to local storage
// TODO: account for reverts
export function useTrades(): Trade[] {
  const [
    {
      trades: { trades, lastCheckedBlock },
      orders: { orders },
    },
    dispatch,
  ] = useGlobalState()
  const { userAddress, networkId } = useWalletConnection()

  useEffect(() => {
    // Resetting trades on network change
    dispatch(overwriteTrades([], undefined))
  }, [dispatch, networkId, userAddress])

  useEffect(() => {
    async function updateTrades(): Promise<void> {
      if (userAddress && networkId) {
        // Don't want to update on every block
        // So instead, we get the latest block when the time comes
        const toBlock = await web3.eth.getBlockNumber()
        const params = {
          userAddress,
          networkId,
          // fromBlock is inclusive. If set, add 1 to avoid duplicates, otherwise return undefined
          fromBlock: !lastCheckedBlock ? lastCheckedBlock : lastCheckedBlock + 1,
          toBlock,
          orders,
        }
        const newTrades = await getTrades(params)
        dispatch(newTrades.length > 0 ? appendTrades(newTrades, toBlock) : updateLastCheckedBlock(toBlock))
      }
    }

    let intervalId: null | NodeJS.Timeout = null

    // Don't bother starting the timeouts unless we are properly connected
    if (userAddress && networkId) {
      // Let's try to be a bit smarter, shall we?
      // - Gnosis Protocol exchange work in batches, that resolve at every 5min.
      // - Solutions are accepted until min 4 of a batch
      // Thus, there's really no point in checking for new trades on every block.
      // Once per batch is enough!
      // Also:
      // - Due to how the network is, some blocks might disappear after awhile due to re-orgs
      // - If we wait for awhile, miners will sort this out and we'll get only what's final.
      // Thus, we check for new trades a few seconds after the 4min mark
      const delay = getTimeRemainingInBatch() - 30

      // Update now to not leave the interface empty
      if (trades.length === 0 || (delay >= 0 && delay < 10)) {
        updateTrades()
      }

      if (delay >= 0 && delay < 10) {
        // If time left in batch within this window, start the interval
        intervalId = setInterval(updateTrades, BATCH_TIME_IN_MS)
      } else {
        // Otherwise, set a timeout to update, then set interval
        intervalId = setTimeout(() => {
          updateTrades()
          intervalId = setInterval(updateTrades, BATCH_TIME_IN_MS)
        }, (delay < 0 ? delay + BATCH_TIME : delay) * 1000)
      }
    }

    return (): void => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [userAddress, networkId, lastCheckedBlock, dispatch, trades, orders])

  // latest first
  return trades.slice(0).reverse()
}
