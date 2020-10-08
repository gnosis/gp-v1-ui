import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import { PriceSuggestionsWrapper } from './PriceSuggestions/PriceSuggestions'
import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { ONE_HUNDRED_BIG_NUMBER, ONE_BIG_NUMBER, HIGH_PRICE_IMPACT_THRESHOLD, LOW_PRICE_IMPACT_THRESHOLD } from 'const'
import { TokenDetails } from 'types'
import { parseBigNumber } from 'utils'
import { HelpTooltip } from 'components/Tooltip'

const BoldColourTag = styled.strong`
  &.highImpact {
    color: var(--color-button-danger);
  }

  &.lowImpact {
    color: var(--color-button-success);
  }

  > span {
    color: var(--color-text-primary);
    margin-right: 0.5rem;
  }
`

const PriceImpactTooltip = 'The difference between the market price and the estimated price due to trade size'

interface PriceImpactProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  limitPrice: string | null
  networkId: number
}

// sets colour of strong tag presenting price impact
const getImpactColourClass = (impact: string): string => {
  let className = ''
  if (impact) {
    if (+impact > HIGH_PRICE_IMPACT_THRESHOLD) {
      className = 'highImpact'
    } else if (+impact < LOW_PRICE_IMPACT_THRESHOLD) {
      className = 'lowImpact'
    }
  }

  return className
}

function calculatePriceImpact({
  limitPrice,
  bestAskPrice,
}: {
  limitPrice: string | null
  bestAskPrice: BigNumber | null
}): BigNumber | null {
  const limitPriceBigNumber = limitPrice && parseBigNumber(limitPrice)
  if (!bestAskPrice || !limitPriceBigNumber) return null

  // PRICE_IMPACT = 100 - 100 * BEST_ASK / LIMIT_PRICE
  return ONE_BIG_NUMBER.minus(bestAskPrice.div(limitPriceBigNumber)).times(ONE_HUNDRED_BIG_NUMBER)
}

function PriceImpact({ limitPrice, baseToken, quoteToken, networkId }: PriceImpactProps): React.ReactElement | null {
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  // TODO: useBestAskPrice hook here
  const { priceEstimation: bestAskPrice } = usePriceEstimationWithSlippage({
    networkId,
    amount: '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  const priceImpact = React.useMemo(() => calculatePriceImpact({ bestAskPrice, limitPrice }), [
    bestAskPrice,
    limitPrice,
  ])

  if (!priceImpact) return null

  return (
    <PriceSuggestionsWrapper>
      <div className="container">
        <span>
          <span>Price impact </span>
          <BoldColourTag className={getImpactColourClass(priceImpact.toFixed(0))}>
            <HelpTooltip tooltip={PriceImpactTooltip} /> {priceImpact.toFixed(2)}%
          </BoldColourTag>
        </span>
      </div>
    </PriceSuggestionsWrapper>
  )
}

export default PriceImpact
