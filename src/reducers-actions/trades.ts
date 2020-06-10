import { Actions } from 'reducers-actions'
import { Trade, TradeReversion, EventWithBlockInfo } from 'api/exchange/ExchangeApi'
import { logDebug, flattenMapOfLists, dateToBatchId } from 'utils'

export type ActionTypes = 'OVERWRITE_TRADES' | 'APPEND_TRADES' | 'UPDATE_BLOCK'

export interface TradesState {
  trades: Trade[]
  pendingTrades: Map<string, Trade[]>
  lastCheckedBlock?: number
}

interface WithReverts {
  reverts: TradeReversion[]
}

type OverwriteTradesActionType = Actions<'OVERWRITE_TRADES', Omit<TradesState, 'pendingTrades'> & WithReverts>
type AppendTradesActionType = Actions<'APPEND_TRADES', Required<Omit<TradesState, 'pendingTrades'>> & WithReverts>
type UpdateBlockActionType = Actions<'UPDATE_BLOCK', Required<Pick<TradesState, 'lastCheckedBlock'>>>
type ReducerActionType = Actions<ActionTypes, TradesState & WithReverts>

interface Params {
  trades: Trade[]
  reverts: TradeReversion[]
  lastCheckedBlock?: number
}

export const overwriteTrades = ({ trades, reverts, lastCheckedBlock }: Params): OverwriteTradesActionType => ({
  type: 'OVERWRITE_TRADES',
  payload: { trades, reverts, lastCheckedBlock },
})

export const appendTrades = ({ trades, reverts, lastCheckedBlock }: Required<Params>): AppendTradesActionType => ({
  type: 'APPEND_TRADES',
  payload: { trades, reverts, lastCheckedBlock },
})

export const updateLastCheckedBlock = (lastCheckedBlock: number): UpdateBlockActionType => ({
  type: 'UPDATE_BLOCK',
  payload: { lastCheckedBlock },
})

// TODO: store to/load from localStorage
export const INITIAL_TRADES_STATE = { trades: [], pendingTrades: new Map<string, Trade[]>() }

function buildTradeRevertKey(batchId: number, orderId: string): string {
  return batchId + '|' + orderId
}

function groupByRevertKey<T extends EventWithBlockInfo>(list: T[], initial?: Map<string, T[]>): Map<string, T[]> {
  const map = initial || new Map<string, T[]>()
  const seenIds = new Set<string>()

  list.forEach(item => {
    // Avoid duplicate entries
    if (seenIds.has(item.id)) {
      return
    }
    seenIds.add(item.id)

    const revertKey = buildTradeRevertKey(item.batchId, item.orderId)

    if (map.has(revertKey)) {
      const subList = map.get(revertKey) as T[]

      subList.push(item)
    } else {
      map.set(revertKey, [item])
    }
  })

  return map
}

function sortByTimeAndPosition(a: EventWithBlockInfo, b: EventWithBlockInfo): number {
  if (a.timestamp < b.timestamp) return -1
  if (a.timestamp > b.timestamp) return 1
  // if timestamps are equal, means both happened on the same block
  // in that case, check the event index
  return a.eventIndex - b.eventIndex
}

function getPendingTrades(tradesByRevertKey: Map<string, Trade[]>): Map<string, Trade[]> {
  // Now that we matched the reverts with trades we currently have, we filter the trades
  // that might have reverts still coming in.

  // To be on the very safe side, let's assume pending anything in the last two batches
  const currentBatchId = dateToBatchId()

  // Filter out trades in that range (curr ... curr -2).
  // The `revertKey` is composed by batchId|orderId, so this regex looks for the batchIds in the keys
  const batchesRegex = new RegExp(`^(${currentBatchId}|${currentBatchId - 1}|${currentBatchId - 2})\|`)

  const pending = new Map<string, Trade[]>()

  tradesByRevertKey.forEach((trades, key) => {
    if (batchesRegex.test(key)) {
      pending.set(key, trades)
    }
  })

  return pending
}

function applyRevertsToTrades(
  trades: Trade[],
  reverts: TradeReversion[],
  pendingTrades?: Map<string, Trade[]>,
): [Trade[], Map<string, Trade[]>] {
  // Group trades by revertKey
  const tradesByRevertKey = groupByRevertKey(trades, pendingTrades)
  const revertsByRevertKey = groupByRevertKey(reverts)

  // Assumptions:
  // 1. There can be more than one trade per batch for a given order (even if there are no reverts)
  //    This case is not likely given our current solvers, but it's not forbidden by the contract
  // 2. There will never be more reverts than trades for a given batch/order pair
  // 3. Every revert matches 1 trade
  // 4. Reverts match Trades by order or appearance (first Revert matches first Trade and so on)

  revertsByRevertKey.forEach((reverts, revertKey) => {
    reverts.sort(sortByTimeAndPosition)
    const trades = tradesByRevertKey.get(revertKey)?.sort(sortByTimeAndPosition)

    if (trades) {
      let tradesIndex = 0
      let revertsIndex = 0
      // Iterate over both trades and reverts while there are any
      while (tradesIndex < trades.length && revertsIndex < reverts.length) {
        if (!trades[tradesIndex].revertId) {
          // Trade was not reverted. Now it is.
          // Update trade, move both indices forward
          trades[tradesIndex].revertId = reverts[revertsIndex].id
          trades[tradesIndex].revertTimestamp = reverts[revertsIndex].timestamp
          logDebug(
            `[reducers:trade][${revertKey}] Trade ${trades[tradesIndex].id} matched to Revert ${reverts[revertsIndex].id}`,
          )
          tradesIndex++
          revertsIndex++
        } else if (trades[tradesIndex].revertId === reverts[revertsIndex].id) {
          // Trade was already reverted by this Revert
          // Move both indices forward
          logDebug(
            `[reducers:trade][${revertKey}] Trade ${trades[tradesIndex].id} was already matched to Revert ${reverts[revertsIndex].id}`,
          )
          tradesIndex++
          revertsIndex++
        } else {
          // Trade was already reverted, not by this Revert
          // Move on to next Trade, keep same Revert
          tradesIndex++
        }
      }
      // Shouldn't happen, but...
      if (tradesIndex === trades.length && revertsIndex < reverts.length) {
        throw new Error(`There are ${reverts.length - revertsIndex} reverts not matched to trades`)
      }
    }
  })

  return [flattenMapOfLists(tradesByRevertKey), getPendingTrades(tradesByRevertKey)]
}

export const reducer = (state: TradesState, action: ReducerActionType): TradesState => {
  switch (action.type) {
    case 'APPEND_TRADES': {
      const { trades: currTrades, pendingTrades: currPendingTrades } = state
      const { trades: newTrades, reverts, lastCheckedBlock } = action.payload

      const [trades, pendingTrades] = applyRevertsToTrades(newTrades, reverts, currPendingTrades)

      return { trades: currTrades.concat(trades), lastCheckedBlock, pendingTrades }
    }
    case 'OVERWRITE_TRADES': {
      const { trades: newTrades, reverts, lastCheckedBlock } = action.payload

      const [trades, pendingTrades] = applyRevertsToTrades(newTrades, reverts)

      return { trades, lastCheckedBlock, pendingTrades }
    }
    case 'UPDATE_BLOCK': {
      return { ...state, ...action.payload }
    }
    default: {
      return state
    }
  }
}
