import { Actions } from 'reducers-actions'
import { Trade, TradeReversion, EventWithBlockInfo } from 'api/exchange/ExchangeApi'
import { logDebug, flattenMapOfLists } from 'utils'

export type ActionTypes = 'OVERWRITE_TRADES' | 'APPEND_TRADES' | 'UPDATE_BLOCK'

export interface TradesState {
  trades: Trade[]
  reverts: TradeReversion[]
  lastCheckedBlock?: number
}

type OverwriteTradesActionType = Actions<'OVERWRITE_TRADES', TradesState>
type AppendTradesActionType = Actions<'APPEND_TRADES', Required<TradesState>>
type UpdateBlockActionType = Actions<'UPDATE_BLOCK', Required<Pick<TradesState, 'lastCheckedBlock'>>>
type ReducerActionType = Actions<ActionTypes, TradesState>

export const overwriteTrades = (
  trades: Trade[],
  reverts: TradeReversion[],
  lastCheckedBlock?: number,
): OverwriteTradesActionType => ({
  type: 'OVERWRITE_TRADES',
  payload: { trades, reverts, lastCheckedBlock },
})

export const appendTrades = (
  trades: Trade[],
  reverts: TradeReversion[],
  lastCheckedBlock: number,
): AppendTradesActionType => ({
  type: 'APPEND_TRADES',
  payload: { trades, reverts, lastCheckedBlock },
})

export const updateLastCheckedBlock = (lastCheckedBlock: number): UpdateBlockActionType => ({
  type: 'UPDATE_BLOCK',
  payload: { lastCheckedBlock },
})

// TODO: store to/load from localStorage
export const INITIAL_TRADES_STATE = { trades: [], reverts: [] }

function groupByRevertKey<T extends EventWithBlockInfo>(list: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()

  list.forEach(item => {
    if (map.has(item.revertKey)) {
      const subList = map.get(item.revertKey) as T[]

      // Do not insert duplicates
      if (!subList.find(({ id }) => item.id === id)) {
        subList.push(item)
      }
    } else {
      map.set(item.revertKey, [item])
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

function applyRevertsToTrades(trades: Trade[], reverts: TradeReversion[]): Trade[] {
  // Group trades by revertKey
  const tradesByRevertKey = groupByRevertKey(trades)
  const revertsByRevertKey = groupByRevertKey(reverts)

  // Assumptions:
  // 1. There can be more than one trade per batch for a given order (even if there are no reverts)
  //    This case is not likely given our current solvers, but it's not forbidden by the contract
  // 2. There will never be more reverts than trades for a given batch/order pair
  // 3. Every revert matches 1 trade
  // 4. Reverts match Trades by order or appearance (first Revert matches first Trade and so on)

  Array.from(revertsByRevertKey.keys()).forEach(revertKey => {
    const reverts = (revertsByRevertKey.get(revertKey) as TradeReversion[]).sort(sortByTimeAndPosition)
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
      // Shouldn't happen, here for debugging
      if (tradesIndex === trades.length && revertsIndex < reverts.length) {
        console.error(`There are reverts not matched to trades`)
      }
    }
  })

  return flattenMapOfLists(tradesByRevertKey)
}

export const reducer = (state: TradesState, action: ReducerActionType): TradesState => {
  switch (action.type) {
    case 'APPEND_TRADES': {
      const { trades: currTrades, reverts: currReverts } = state
      const { trades: newTrades, reverts: newReverts, lastCheckedBlock } = action.payload

      const trades = applyRevertsToTrades(currTrades.concat(newTrades), currReverts.concat(newReverts))

      // TODO: is there a point in storing reverts? Don't think so. Remove it
      return { trades, reverts: [], lastCheckedBlock }
    }
    case 'OVERWRITE_TRADES': {
      const { trades: newTrades, reverts: newReverts, lastCheckedBlock } = action.payload

      const trades = applyRevertsToTrades(newTrades, newReverts)

      return { trades, reverts: [], lastCheckedBlock }
    }
    case 'UPDATE_BLOCK': {
      return { ...state, ...action.payload }
    }
    default: {
      return state
    }
  }
}
