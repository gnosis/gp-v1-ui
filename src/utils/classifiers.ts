import { isOrderUnlimited } from '@gnosis.pm/dex-js'

import { isTradeFilled } from './miscellaneous'

import { Trade, TradeType } from 'api/exchange/ExchangeApi'

export function classifyTrade(trade: Trade): TradeType {
  const { remainingAmount, orderBuyAmount, orderSellAmount } = trade

  if (!remainingAmount) {
    return 'unknown'
  }
  if (orderBuyAmount && orderSellAmount && isOrderUnlimited(orderBuyAmount, orderSellAmount)) {
    return 'liquidity'
  }
  return isTradeFilled(trade) ? 'full' : 'partial'
}
