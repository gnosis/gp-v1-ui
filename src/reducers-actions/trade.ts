import { TokenDetails } from '@gnosis.pm/dex-js'
import { Actions } from 'reducers-actions'

export interface TradeState {
  price: string | null
  sellAmount: string | null
  sellToken: Required<TokenDetails> | null
  buyToken: Required<TokenDetails> | null
  validFrom: string
  validUntil: string
}

export type ActionTypes = 'UPDATE_PAYLOAD'

type UpdatePriceActionType = Actions<ActionTypes, Pick<TradeState, 'price'>>
type UpdateSellAmountActionType = Actions<ActionTypes, Pick<TradeState, 'sellAmount'>>
type UpdateSellTokenActionType = Actions<ActionTypes, Pick<TradeState, 'sellToken'>>
type UpdateBuyTokenActionType = Actions<ActionTypes, Pick<TradeState, 'buyToken'>>
type UpdateValidFromActionType = Actions<ActionTypes, Pick<TradeState, 'validFrom'>>
type UpdateValidUntilActionType = Actions<ActionTypes, Pick<TradeState, 'validUntil'>>
type ReducerActionType = Actions<ActionTypes, TradeState>

export const updatePrice = (price: string): UpdatePriceActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { price },
})

export const updateSellAmount = (sellAmount: string): UpdateSellAmountActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { sellAmount },
})

export const updateSellToken = (sellToken: TokenDetails): UpdateSellTokenActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { sellToken: sellToken as Required<TokenDetails> },
})

export const updateBuyToken = (buyToken: TokenDetails): UpdateBuyTokenActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { buyToken: buyToken as Required<TokenDetails> },
})

export const updateValidFrom = (validFrom: string): UpdateValidFromActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { validFrom },
})

export const updateValidUntil = (validUntil: string): UpdateValidUntilActionType => ({
  type: 'UPDATE_PAYLOAD',
  payload: { validUntil },
})

export const INITIAL_TRADE_STATE: TradeState = {
  price: null,
  sellAmount: null,
  sellToken: null,
  buyToken: null,
  validFrom: '0',
  validUntil: '2880',
}

export function reducer(state: TradeState, action: ReducerActionType): TradeState {
  const { type, payload } = action
  switch (type) {
    case 'UPDATE_PAYLOAD':
      return { ...state, ...payload }
    default:
      return state
  }
}
