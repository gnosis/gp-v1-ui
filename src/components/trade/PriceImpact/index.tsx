import React from 'react'

import { FormMessage } from 'components/common/FormMessage'
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { BoldColourTag } from './PriceImpact.styled'
import { PriceSuggestionsWrapper } from '../PriceSuggestions/PriceSuggestions'

import usePriceImpact from './usePriceImpact'

import { PriceImpactProps } from './types'

const PriceImpactTooltip: React.FC = () => (
  <HelpTooltipContainer>
    The difference between the market price and the limit price due to order size
  </HelpTooltipContainer>
)

function PriceImpact(params: PriceImpactProps): React.ReactElement | null {
  const {
    baseToken: { id: baseTokenId },
    quoteToken: { id: quoteTokenId },
    ...rest
  } = params

  const { priceImpactSmart, priceImpactWarning, priceImpactClassName } = usePriceImpact({
    ...rest,
    baseTokenId,
    quoteTokenId,
  })

  return (
    <PriceSuggestionsWrapper as="section">
      {priceImpactSmart && (
        <div className="container">
          <span>
            <span>Price impact </span>
            <BoldColourTag className={priceImpactClassName}>
              <HelpTooltip tooltip={<PriceImpactTooltip />} /> {priceImpactSmart}%
            </BoldColourTag>
          </span>
        </div>
      )}
      {/* Warning */}
      {priceImpactWarning && (
        <FormMessage className="warning">
          <BoldColourTag as="span">{priceImpactWarning}</BoldColourTag>
        </FormMessage>
      )}
    </PriceSuggestionsWrapper>
  )
}

export default PriceImpact
