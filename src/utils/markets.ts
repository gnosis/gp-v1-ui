import { Market, TradeTokenSelection } from 'types'

export interface GetMarketResult extends Market {
  wasPriorityAdjusted: boolean
}

export function getMarket({ sellToken, receiveToken }: TradeTokenSelection): GetMarketResult {
  let baseToken = receiveToken
  let quoteToken = sellToken
  let wasPriorityAdjusted = false

  // i.e.
  // Prio: 1                  - STABLE USD
  // Prio: 2                  - STABLE EUR
  // Prio: 3                  - WETH
  // Prio: MAX_SAFE_INTEGER   - VOLATILE
  const basePrio = baseToken.priority || Number.MAX_SAFE_INTEGER
  const quotePrio = quoteToken.priority || Number.MAX_SAFE_INTEGER

  // Receive token has priority = make price point
  if (basePrio < quotePrio) {
    baseToken = sellToken
    quoteToken = receiveToken
    wasPriorityAdjusted = true
  }

  return {
    baseToken,
    quoteToken,
    wasPriorityAdjusted,
  }
}
