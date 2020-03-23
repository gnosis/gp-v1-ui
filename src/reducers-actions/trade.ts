import { TokenDetails } from '@gnosis.pm/dex-js'

export interface TradeState {
  price: string | null
  sellAmount: string | null
  sellToken: Required<TokenDetails> | null
  buyToken: Required<TokenDetails> | null
  validFrom: string
  validUntil: string
}

export function updateTradeState<K extends keyof TradeState>(
  key: K,
  payload: TradeState[K],
): { [key: string]: TradeState[K] } {
  return { [key]: payload }
}

export const INITIAL_TRADE_STATE: TradeState = {
  price: null,
  sellAmount: null,
  sellToken: null,
  buyToken: null,
  validFrom: '0',
  validUntil: '2880',
}

export function reducer(state: TradeState, subset: TradeState): TradeState {
  return { ...state, ...subset }
}
