import { useEffect, useMemo } from 'react'

import { BATCH_TIME } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'
import { web3 } from 'api'

import { getTradesAndTradeReversions } from 'services'

import { appendTrades, updateLastCheckedBlock } from 'reducers-actions/trades'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useGlobalState from 'hooks/useGlobalState'

import { BATCH_TIME_IN_MS } from 'const'

import { getTimeRemainingInBatch } from 'utils'

export function useTrades(): Trade[] {
  const [
    {
      trades: globalStateTrades,
      orders: { orders },
    },
    dispatch,
  ] = useGlobalState()
  const { userAddress, networkId } = useWalletConnection()

  const { lastCheckedBlock, trades } = useMemo(
    () => (networkId ? globalStateTrades[networkId] : { lastCheckedBlock: undefined, trades: [] }),
    [globalStateTrades, networkId],
  )

  useEffect(() => {
    // Flow control. Cancel query/state update on unmount
    let cancelled = false

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

        // Check before expensive operation
        if (cancelled) {
          return
        }

        const { trades: newTrades, reverts } = await getTradesAndTradeReversions(params)

        // Check before updating state
        if (cancelled) {
          return
        }

        dispatch(
          newTrades.length > 0 || reverts.length > 0
            ? appendTrades({ trades: newTrades, reverts, lastCheckedBlock: toBlock, networkId })
            : updateLastCheckedBlock(toBlock, networkId),
        )
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

      // Update now if this is the first time for this address/network OR within the range to start now
      if (!lastCheckedBlock || (delay >= 0 && delay < 10)) {
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
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [userAddress, networkId, lastCheckedBlock, dispatch, orders])

  // latest first
  return trades.slice(0).reverse()
}
