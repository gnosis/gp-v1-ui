import React from 'react'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { TokenDex } from '@gnosis.pm/dex-js'

import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { PriceSuggestionsWrapper } from '../PriceSuggestions/PriceSuggestions'
import { BoldColourTag, PriceImpactFormMessage } from './PriceImpact.styled'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { formatSmart, parseAmount } from 'utils'
import { calculatePriceImpact, determinePriceWarning, getImpactColourClass } from './utils'

export interface PriceImpactArgsBase {
  limitPrice?: string | null
  bestAskPrice: BigNumber | null
}

export interface PriceImpactArgs extends PriceImpactArgsBase {
  fillPrice: BigNumber | null
}

interface PriceImpactProps {
  baseToken: TokenDex
  quoteToken: TokenDex
  limitPrice?: string | null
  fillPrice: BigNumber | null
  networkId: number
}

const PriceImpactTooltip: React.FC = () => (
  <HelpTooltipContainer>
    The difference between the market price and the estimated fill price due to order size
  </HelpTooltipContainer>
)

function PriceImpact({
  limitPrice,
  fillPrice,
  baseToken,
  quoteToken,
  networkId,
}: PriceImpactProps): React.ReactElement | null {
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

  const { priceImpactSmart, className, priceWarning } = React.useMemo(() => {
    const priceImpact = calculatePriceImpact({ bestAskPrice, limitPrice })
    // Smart format, if possible
    const priceImpactSmart =
      (priceImpact &&
        !priceImpact.isZero() &&
        formatSmart({ amount: parseAmount(priceImpact.toString(), 4) as BN, precision: 4, smallLimit: '0.01' })) ||
      '<0.01'

    // Calculate any applicable trade warnings
    const priceWarning = determinePriceWarning({ limitPrice, fillPrice, bestAskPrice }, priceImpact)
    // Dynamic class for styling
    const className = getImpactColourClass(priceImpact)

    return {
      priceImpactSmart,
      className,
      priceWarning,
    }
  }, [bestAskPrice, fillPrice, limitPrice])

  return (
    <PriceSuggestionsWrapper as="section">
      {priceImpactSmart && (
        <div className="container">
          <span>
            <span>Price impact </span>
            <BoldColourTag className={className}>
              <HelpTooltip tooltip={<PriceImpactTooltip />} /> {priceImpactSmart}%
            </BoldColourTag>
          </span>
        </div>
      )}
      {/* Warning */}
      {priceWarning && (
        <PriceImpactFormMessage className="warning">
          <BoldColourTag as="span" className={className}>
            {priceWarning}
          </BoldColourTag>
        </PriceImpactFormMessage>
      )}
    </PriceSuggestionsWrapper>
  )
}

export default PriceImpact
