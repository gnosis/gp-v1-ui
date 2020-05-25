import { Actions } from 'reducers-actions'
import { Trade } from 'api/exchange/ExchangeApi'

export type ActionTypes = 'APPEND_TRADES'

export interface TradesState {
  trades: Trade[]
  lastCheckedBlock?: number
}

type ReducerActionType = Actions<ActionTypes, TradesState>

export const appendTrades = (trades: Trade[], lastCheckedBlock: number): ReducerActionType => ({
  type: 'APPEND_TRADES',
  payload: { trades, lastCheckedBlock },
})

// TODO: store to/load from localStorage
export const INITIAL_TRADES_STATE = { trades: [] }

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
    default: {
      return state
    }
  }
}
