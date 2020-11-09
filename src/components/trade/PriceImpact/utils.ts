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
  NONE,
  LOW,
  MID,
  HIGH,
}

const WARNINGS = {
  DEEP_MARKET: 'Deep in the market: Your order might be fully executed at this price',
  UNEXECUTED: 'Your order might only be filled when the market price reaches your limit price',
  PARTIALLY_EXECUTED: 'Your order might only be partially filled',
  MAYBE_FULLY_EXECUTED: 'Your order might be fully executed at this price',
}

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
    case ImpactLevel.NONE:
      return ''
  }
}

function determinePriceWarning(params: PriceImpactArgs, impact: BigNumber | null): string | null {
  const { limitPrice: limitPriceString, fillPrice, bestAskPrice, baseTokenDecimals, quoteTokenDecimals } = params

  const limitPrice = limitPriceString && parseBigNumber(limitPriceString)
  const lowerPrecision = Math.min(baseTokenDecimals, quoteTokenDecimals)

  // No comparable prices, or user opting for suggested fill price
  // round values before comparing
  if (
    // if any of the limit/fill/bestAsk params are
    // null or zero, return null
    !limitPrice ||
    limitPrice.isZero() ||
    !fillPrice ||
    !bestAskPrice ||
    // round to 5 places and check limit = fill
    fillPrice.toFixed(lowerPrecision) === limitPrice.toFixed(lowerPrecision)
  )
    return null

  // Is user's limit price less than the suggested fill price?
  const orderWontBeFullyExecuted = limitPrice.lt(fillPrice)
  // Is user's limit price less than suggested fill price AND best ask?
  // One could assume that if the limit price is lower than best ask then it's lower than fill
  // but just to be safe
  const orderWontBeExecuted = limitPrice.lt(bestAskPrice)
  const impactLevel = determineImpactLevel(impact)
  // Calculate Deep Market warning threshold using slippage
  // limitPrice * 1.05
  const isPriceAboveDeepMarketThreshold =
    impactLevel === ImpactLevel.HIGH && limitPrice.gte(fillPrice.times(HIGH_PLACEHOLDER_SLIPPAGE))
  // Price is:
  // 1. above Fill Price
  // 2.not above deep market
  const isPriceMidImpactAndExecutable =
    !isPriceAboveDeepMarketThreshold && limitPrice.gte(fillPrice.times(MID_PLACEHOLDER_SLIPPAGE))

  switch (true) {
    // CASE 6: Limit price is GREATER THAN Fill price AND upper threshold 5%
    case isPriceAboveDeepMarketThreshold:
      return WARNINGS.DEEP_MARKET
    // CASE 5
    case orderWontBeExecuted:
      return WARNINGS.UNEXECUTED
    case orderWontBeFullyExecuted:
      return WARNINGS.PARTIALLY_EXECUTED
    // CASE 2
    case isPriceMidImpactAndExecutable:
      return WARNINGS.MAYBE_FULLY_EXECUTED
    // CASE 4 & 3
    default:
      return ''
  }
}

function calculatePriceImpact({ limitPrice: limitPriceString, bestAskPrice }: PriceImpactArgsBase): BigNumber | null {
  const limitPrice = limitPriceString && parseBigNumber(limitPriceString)
  if (!bestAskPrice || !limitPrice) return null

  // PRICE_IMPACT = 100 - (BEST_ASK / LIMIT_PRICE * 100)
  const impact = ONE_HUNDRED_BIG_NUMBER.minus(bestAskPrice.div(limitPrice).times(ONE_HUNDRED_BIG_NUMBER))
  return impact.lt(ZERO_BIG_NUMBER) ? ZERO_BIG_NUMBER : impact
}

export { calculatePriceImpact, determinePriceWarning, getImpactColourClass }
