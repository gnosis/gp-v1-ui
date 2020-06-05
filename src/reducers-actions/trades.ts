import { Actions } from 'reducers-actions'
import { Trade, TradeReversion, EventWithBlockInfo } from 'api/exchange/ExchangeApi'
import { logDebug } from 'utils'

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

function groupByRevertKey<T extends EventWithBlockInfo>(list: T[], map: Map<string, T[]>): void {
  list.forEach(item => {
    if (map.has(item.revertKey)) {
      // Do I have to pop it out?
      const subList = map.get(item.revertKey) as T[]

      // Do not insert duplicates
      if (!subList.find(({ id }) => item.id === id)) {
        subList.push(item)
        // Should I sort on insert?
        subList.sort((a, b) => a.timestamp - b.timestamp)
        // Do I have to put it back in?
        map.set(item.revertKey, subList)
      }
    } else {
      map.set(item.revertKey, [item])
    }
  })
}

function flattenGroup<T extends EventWithBlockInfo>(map: Map<string, T[]>): T[] {
  return Array.from(map.keys()).reduce<T[]>((acc, key) => {
    const list = map.get(key) as T[]
    return acc.concat(list)
  }, [])
}

function applyRevertsToTrades(trades: Trade[], reverts: TradeReversion[]): [Trade[], TradeReversion[]] {
  const tradesByRevertKey = new Map<string, Trade[]>()
  const revertsByRevertKey = new Map<string, TradeReversion[]>()

  // Group trades by revertKey
  groupByRevertKey(trades, tradesByRevertKey)
  groupByRevertKey(reverts, revertsByRevertKey)

  // Assumptions:
  // 1. There can be more than one trade per batch for a given order (even if there are no reverts)
  //    This case is not likely given our current solvers, but it's not forbidden by the contract
  // 2. There will never be more reverts than trades for a given batch/order pair
  // 3. Every revert matches 1 trade
  // 4. Reverts match Trades by order or appearance (first Revert matches first Trade and so on)

  Array.from(revertsByRevertKey.keys()).forEach(revertKey => {
    const reverts = revertsByRevertKey.get(revertKey) as TradeReversion[]
    const trades = tradesByRevertKey.get(revertKey)

    // Given the assumptions above, the possibilities are:
    // 1. # trades > # reverts
    // 2. # trades == # reverts
    // Not possible:
    // 3. # trades < # reverts
    // 4. There are reverts but there are no trades for given revertKey <- should NOT ever happen
    // 5. There are trades but no reverts <- wouldn't be in this loop in that case
    if (trades) {
      const remainingTrades = trades.length - reverts.length
      if (remainingTrades < 1) {
        // Case 2 and 3, all trades reverted
        tradesByRevertKey.delete(revertKey)
        logDebug(`All ${trades.length} trade(s) reverted by ${reverts.length} revert(s). Key:${revertKey}`)
      } else {
        // Case 1. One or more trades left, pick from the end
        const filteredTrades = trades.slice(trades.length - remainingTrades)
        tradesByRevertKey.set(revertKey, filteredTrades)
        logDebug(`Reverted ${reverts.length} trade(s), ${filteredTrades.length} left. Key:${revertKey}`)
      }
    }
    // Reverts have been "used", remove them
    revertsByRevertKey.delete(revertKey)
  })

  return [flattenGroup(tradesByRevertKey), flattenGroup(revertsByRevertKey)]
}

export const reducer = (state: TradesState, action: ReducerActionType): TradesState => {
  switch (action.type) {
    case 'APPEND_TRADES': {
      const { trades: currTrades, reverts: currReverts } = state
      const { trades: newTrades, reverts: newReverts, lastCheckedBlock } = action.payload

      const [trades, reverts] = applyRevertsToTrades(currTrades.concat(newTrades), currReverts.concat(newReverts))

      return { trades, reverts, lastCheckedBlock }
    }
    case 'OVERWRITE_TRADES': {
      const { trades: newTrades, reverts: newReverts, lastCheckedBlock } = action.payload
      const [trades, reverts] = applyRevertsToTrades(newTrades, newReverts)

      return { trades, reverts, lastCheckedBlock }
    }
    case 'UPDATE_BLOCK': {
      return { ...state, ...action.payload }
    }
    default: {
      return state
    }
  }
}
