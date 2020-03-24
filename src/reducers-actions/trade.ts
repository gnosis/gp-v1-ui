import { TokenDetails } from '@gnosis.pm/dex-js'

export interface TradeState {
  price: string | null
  sellAmount: string | null
  sellToken: Required<TokenDetails> | null
  buyToken: Required<TokenDetails> | null
  validFrom: string
  validUntil: string
}

export const updatePrice = (price: string): Pick<TradeState, 'price'> => ({
  price,
})

export const updateSellAmount = (sellAmount: string): Pick<TradeState, 'sellAmount'> => ({
  sellAmount,
})

export const updateSellToken = (sellToken: TokenDetails): Pick<TradeState, 'sellToken'> => ({
  sellToken: sellToken as Required<TokenDetails>,
})

export const updateBuyToken = (buyToken: TokenDetails): Pick<TradeState, 'buyToken'> => ({
  buyToken: buyToken as Required<TokenDetails>,
})

export const updateValidFrom = (validFrom: string): Pick<TradeState, 'validFrom'> => ({
  validFrom,
})

export const updateValidUntil = (validUntil: string): Pick<TradeState, 'validUntil'> => ({
  validUntil,
})

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
