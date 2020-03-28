import { TokenDetails } from '@gnosis.pm/dex-js'
import { Actions } from 'reducers-actions'

export interface TradeState {
  price: string | null
  sellAmount: string | null
  sellToken: Required<TokenDetails> | null
  buyToken: Required<TokenDetails> | null
  validFrom: string | null
  validUntil: string | null
}

type ActionTypes = 'UPDATE_TRADE_STATE'

type UpdateTradeStateActionType = Actions<ActionTypes, Partial<TradeState>>
type ReducerActionType = Actions<ActionTypes, TradeState>

export const updateTradeState = (payload: Partial<TradeState>): UpdateTradeStateActionType => ({
  type: 'UPDATE_TRADE_STATE',
  payload,
})

export const INITIAL_TRADE_STATE: TradeState = {
  price: null,
  sellAmount: null,
  sellToken: null,
  buyToken: null,
  validFrom: null,
  validUntil: '2880',
}

export function reducer(state: TradeState, action: ReducerActionType): TradeState {
  const { type, payload } = action
  switch (type) {
    case 'UPDATE_TRADE_STATE':
      return { ...state, ...payload }
    default:
      return state
  }
}
