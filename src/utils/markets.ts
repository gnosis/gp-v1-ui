import { safeTokenName } from '@gnosis.pm/dex-js'
import { Market, TradeTokenSelection } from 'types'
import { logDebug } from './miscellaneous'

export interface GetMarketResult extends Market {
  wasPriorityAdjusted: boolean
}

export function getMarket({ sellToken, receiveToken }: TradeTokenSelection): GetMarketResult {
  // Choose the market depending on the prios of selected tokens
  // i.e.
  //  Prio: 1                  - STABLE USD
  //  Prio: 2                  - STABLE EUR
  //  Prio: 3                  - WETH
  //  Prio: MAX_SAFE_INTEGER   - VOLATILE
  const receiveTokenPrio = receiveToken.priority || Number.MAX_SAFE_INTEGER
  const sellTokenPrio = sellToken.priority || Number.MAX_SAFE_INTEGER

  // Receive token has priority = make price point
  let baseToken, quoteToken
  if (receiveTokenPrio < sellTokenPrio) {
    // Receive token is the quote
    quoteToken = receiveToken
    baseToken = sellToken
  } else {
    // Base token is the quote
    quoteToken = sellToken
    baseToken = receiveToken
  }

  logDebug(
    `[utils:market] Market for ${safeTokenName(sellToken)} (${sellTokenPrio}) and ${safeTokenName(
      receiveToken,
    )} (${receiveTokenPrio}): ${safeTokenName(baseToken)}-${safeTokenName(quoteToken)}`,
  )

  return {
    baseToken,
    quoteToken,
    // TODO: I kept this prop for respecing this part of the original PR, but I think it shouldn't be here. We'll review later
    //      https://github.com/gnosis/dex-react/issues/1476
    wasPriorityAdjusted: receiveToken === quoteToken,
  }
}
