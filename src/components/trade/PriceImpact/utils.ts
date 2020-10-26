import BigNumber from 'bignumber.js'

import { parseBigNumber } from 'utils'
import { ONE_HUNDRED_BIG_NUMBER, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'
import { PriceImpactArgs, PriceImpactArgsBase } from './types'

// Limit as to where price colour changes
const HIGH_PRICE_IMPACT_THRESHOLD = new BigNumber(5) // 5%
const MID_PRICE_IMPACT_THRESHOLD = new BigNumber(3) // 3%
const LOW_PRICE_IMPACT_THRESHOLD = ONE_BIG_NUMBER // 1%
// TODO: remove for slippage toggle
// 0.5% placeholder slippage
const HIGH_PLACEHOLDER_SLIPPAGE = new BigNumber(1.05) // 5%
const MID_PLACEHOLDER_SLIPPAGE = new BigNumber(1.03) // 3%

enum ImpactLevel {
  HIGH = 3,
  MID = 2,
  LOW = 1,
  NONE = 0,
}

const DEEP_MARKET_WARNING = '⚠️ Deep in the market: Your order might be fully executed at this price.'
const BELOW_ASK_WARNING = '⚠️ Your order might only be filled when the market price reaches your limit price'

const determineImpactLevel = (impact: BigNumber | null): ImpactLevel => {
  const impactLevel = ImpactLevel.NONE

  switch (true) {
    case impact?.gte(HIGH_PRICE_IMPACT_THRESHOLD):
      return ImpactLevel.HIGH
    case impact?.gte(MID_PRICE_IMPACT_THRESHOLD):
      return ImpactLevel.MID
    case impact?.lt(LOW_PRICE_IMPACT_THRESHOLD):
      return ImpactLevel.LOW
    default:
      return impactLevel
  }
}

// sets colour of strong tag presenting price impact
const getImpactColourClass = (impact: BigNumber | null): string => {
  const impactLevel = determineImpactLevel(impact)

  switch (impactLevel) {
    case ImpactLevel.HIGH:
      return 'highImpact'
    case ImpactLevel.MID:
      return 'midImpact'
    case ImpactLevel.LOW:
      return 'lowImpact'
    default:
      return ''
  }
}

function determinePriceWarning(params: PriceImpactArgs, impact: BigNumber | null): string | null {
  const { limitPrice, fillPrice, bestAskPrice } = params

  const limitPriceBigNumber = limitPrice && parseBigNumber(limitPrice)
  const fillPriceRounded = fillPrice?.toFixed(5)
  // const noLimitPrice = !limitPriceBigNumber || limitPriceBigNumber.isZero()

  // No comparable prices, or user opting for suggested fill price
  // round values before comparing
  if (
    !limitPriceBigNumber ||
    limitPriceBigNumber.isZero() ||
    !fillPrice ||
    !bestAskPrice ||
    fillPriceRounded === limitPrice
  )
    return null

  // Is user's limit price less than the suggested fill price?
  const orderWontBeFullyExecuted = limitPriceBigNumber.lt(fillPrice)
  // Is user's limit price less than suggested fill price AND best ask?
  // One could assume that if the limit price is lower than best ask then it's lower than fill
  // but just to be safe
  const orderWontBeExecuted = limitPriceBigNumber.lt(bestAskPrice)
  const impactLevel = determineImpactLevel(impact)
  // Calculate Deep Market warning threshold using slippage
  // limitPrice * 1.05
  const isPriceAboveDeepMarketThreshold =
    impactLevel === ImpactLevel.HIGH && limitPriceBigNumber.gte(fillPrice.times(HIGH_PLACEHOLDER_SLIPPAGE))

  const isPriceMidImpactAndExecutable =
    impactLevel >= ImpactLevel.LOW &&
    !orderWontBeFullyExecuted &&
    limitPriceBigNumber.gte(fillPrice.times(MID_PLACEHOLDER_SLIPPAGE))

  switch (true) {
    // CASE 6: Limit price is GREATER THAN Fill price AND upper threshold 5%
    case isPriceAboveDeepMarketThreshold:
      return DEEP_MARKET_WARNING
    // CASE 5
    case orderWontBeExecuted:
      return BELOW_ASK_WARNING
    case orderWontBeFullyExecuted:
      return 'Your order might only be partially filled'
    // CASE 2
    case isPriceMidImpactAndExecutable:
      return 'Your order might be fully executed at this price.'
    // CASE 4 & 3
    default:
      return ''
  }
}

function calculatePriceImpact({ limitPrice, bestAskPrice }: PriceImpactArgsBase): BigNumber | null {
  const limitPriceBigNumber = limitPrice && parseBigNumber(limitPrice)
  if (!bestAskPrice || !limitPriceBigNumber) return null

  // PRICE_IMPACT = 100 - (BEST_ASK / LIMIT_PRICE * 100)
  const impact = ONE_HUNDRED_BIG_NUMBER.minus(bestAskPrice.div(limitPriceBigNumber).times(ONE_HUNDRED_BIG_NUMBER))
  return impact.lt(ZERO_BIG_NUMBER) ? ZERO_BIG_NUMBER : impact
}

export { calculatePriceImpact, determinePriceWarning, getImpactColourClass }
