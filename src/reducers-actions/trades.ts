import { Actions } from 'reducers-actions'
import { Trade, TradeReversion, EventWithBlockInfo } from 'api/exchange/ExchangeApi'

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

export const reducer = (state: TradesState, action: ReducerActionType): TradesState => {
  switch (action.type) {
    case 'APPEND_TRADES': {
      const { trades: currTrades } = state
      const { trades: newTrades, lastCheckedBlock } = action.payload

      const seenTradeIdsSet = new Set<string>()

      // Append new list to existing list of trades
      const trades = currTrades.concat(newTrades).reduce<Trade[]>((acc, trade) => {
        // Removes possible duplicates
        if (!seenTradeIdsSet.has(trade.id)) {
          acc.push(trade)
          seenTradeIdsSet.add(trade.id)
        }
        return acc
      }, [])

      return { trades, lastCheckedBlock }
    }
    case 'OVERWRITE_TRADES': {
      return { ...action.payload }
    }
    case 'UPDATE_BLOCK': {
      return { ...state, ...action.payload }
    }
    default: {
      return state
    }
  }
}
