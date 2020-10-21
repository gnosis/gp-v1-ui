import React from 'react'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { TokenDex } from '@gnosis.pm/dex-js'

<<<<<<< HEAD
import { BoldColourTag } from './PriceImpact.styled'
import { FormMessage } from 'components/common/FormMessage'
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { PriceSuggestionsWrapper } from '../PriceSuggestions/PriceSuggestions'

import useBestAsk from 'hooks/useBestAsk'
=======
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { PriceSuggestionsWrapper } from '../PriceSuggestions/PriceSuggestions'
import { BoldColourTag, PriceImpactFormMessage } from './PriceImpact.styled'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
>>>>>>> move unrelated files into more related FS

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
    The difference between the market price and the limit price due to order size
  </HelpTooltipContainer>
)

function PriceImpact({
  limitPrice,
  fillPrice,
  baseToken,
  quoteToken,
  networkId,
}: PriceImpactProps): React.ReactElement | null {
  const { id: baseTokenId } = baseToken
  const { id: quoteTokenId } = quoteToken

  const { bestAskPrice } = useBestAsk({
    networkId,
    baseTokenId,
    quoteTokenId,
  })

  const { priceImpactSmart, className, priceWarning } = React.useMemo(() => {
    const priceImpact = calculatePriceImpact({ bestAskPrice, limitPrice })
    const priceImpactBN = priceImpact && (parseAmount(priceImpact.toString(), 4) as BN)
    // Smart format, if possible
    let priceImpactSmart: string
    if (priceImpactBN && !priceImpactBN.isZero()) {
      priceImpactSmart = formatSmart({
        amount: priceImpactBN,
        precision: 4,
        smallLimit: '0.01',
      })
    } else {
      priceImpactSmart = '<0.01'
    }
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
        <FormMessage className="warning">
          <BoldColourTag as="span">{priceWarning}</BoldColourTag>
        </FormMessage>
      )}
    </PriceSuggestionsWrapper>
  )
}

export default PriceImpact
