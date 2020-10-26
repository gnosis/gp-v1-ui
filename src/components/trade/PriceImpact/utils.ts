import BigNumber from 'bignumber.js'

import { parseBigNumber } from 'utils'
import { ONE_HUNDRED_BIG_NUMBER, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { PriceImpactArgs, PriceImpactArgsBase } from '../PriceImpact'

// Limit as to where price colour changes
const HIGH_PRICE_IMPACT_THRESHOLD = new BigNumber(5)
const MID_PRICE_IMPACT_THRESHOLD = new BigNumber(3)
const LOW_PRICE_IMPACT_THRESHOLD = ONE_BIG_NUMBER
// TODO: remove for slippage toggle
// 0.5% placeholder slippage
const PLACEHOLDER_SLIPPAGE = new BigNumber(0.005)

const determineImpactLevel = (impact: BigNumber | null): number => {
  let impactLevel = 0
  if (impact) {
    if (impact.gte(HIGH_PRICE_IMPACT_THRESHOLD)) {
      impactLevel = 3
    } else if (impact.gte(MID_PRICE_IMPACT_THRESHOLD)) {
      impactLevel = 2
    } else if (impact.lt(LOW_PRICE_IMPACT_THRESHOLD)) {
      impactLevel = 1
    }
  }

  return impactLevel
}

// sets colour of strong tag presenting price impact
const getImpactColourClass = (impact: BigNumber | null): string => {
  const impactLevel = determineImpactLevel(impact)

  let className = ''
  if (impactLevel) {
    if (impactLevel === 3) {
      className = 'highImpact'
    } else if (impactLevel === 2) {
      className = 'midImpact'
    } else if (impactLevel === 1) {
      className = 'lowImpact'
    }
  }

  return className
}

function determinePriceWarning(params: PriceImpactArgs, impact: BigNumber | null): string | null {
  const { limitPrice, fillPrice, bestAskPrice } = params

  const limitPriceBigNumber = limitPrice && parseBigNumber(limitPrice)
  const fillPriceRounded = fillPrice?.toFixed(5)

  // CASE 1 & 2: no warning
  // round fillPrice to 5 decimals points and string compare against limit
  if (
    !limitPriceBigNumber ||
    limitPriceBigNumber.isZero() ||
    !fillPrice ||
    !bestAskPrice ||
    fillPriceRounded === limitPrice
  )
    return null

  // Is user's limit price less than the suggested fill price?
  const isLimitPriceLessThanFillPrice = limitPriceBigNumber.lt(fillPrice)
  // Is user's limit price less than suggested fill price AND best ask?
  // One could assume that if the limit price is lower than best ask then it's lower than fill
  // but just to be safe
  const isLimitPriceLessThanFillAndBestAsk = isLimitPriceLessThanFillPrice && limitPriceBigNumber.lt(bestAskPrice)

  let warning: string
  if (isLimitPriceLessThanFillPrice) {
    // CASE 5: Limit price LESS THAN Fill price AND Best Ask price
    if (isLimitPriceLessThanFillAndBestAsk) {
      warning = '⚠️ Your order might only be filled when the market price reaches your limit price'
    } else {
      // CASE 3 & 4: Limit price LESS THAN Fill price but EQUAL TO or GREATER than Best Ask price
      warning = 'Your order might only be partially filled'
    }
  } else {
    // CASE 6: Limit price is GREATER THAN Fill price (and Best Ask)
    const impactLevel = determineImpactLevel(impact)
    // Calculate Deep Market warning threshold using slippage
    const deepMarketPriceCeiling = limitPriceBigNumber.gte(fillPrice.times(ONE_BIG_NUMBER.plus(PLACEHOLDER_SLIPPAGE)))
    // Check against impact level AND the slippage
    if (impactLevel === 3 && deepMarketPriceCeiling) {
      warning = '⚠️ Deep in the market: Your order might be fully executed at this price.'
    } else {
      warning = 'Your order might be fully executed at this price.'
    }
  }

  return warning
}

function calculatePriceImpact({ limitPrice, bestAskPrice }: PriceImpactArgsBase): BigNumber | null {
  const limitPriceBigNumber = limitPrice && parseBigNumber(limitPrice)
  if (!bestAskPrice || !limitPriceBigNumber) return null

  // PRICE_IMPACT = 100 - (BEST_ASK / LIMIT_PRICE * 100)
  const impact = ONE_HUNDRED_BIG_NUMBER.minus(bestAskPrice.div(limitPriceBigNumber).times(ONE_HUNDRED_BIG_NUMBER))
  return impact.lt(ZERO_BIG_NUMBER) ? ZERO_BIG_NUMBER : impact
}

export { calculatePriceImpact, determinePriceWarning, getImpactColourClass }
