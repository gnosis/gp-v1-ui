import React from 'react'
import styled from 'styled-components'
import { displayTokenSymbolOrLink } from 'utils/display'
import { EllipsisText } from 'components/common/EllipsisText'

import { SwapIcon } from 'components/TradeWidget/SwapIcon'
import { safeTokenName, TokenDetails } from '@gnosis.pm/dex-js'

const SwapPriceWrapper = styled.div`
  cursor: pointer;
  div.separator {
    margin: 0 0.4rem;
  }
`
export interface Props {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  isPriceInverted: boolean
  separator?: SVGAnimatedString
  onSwapPrices: () => void
}

export const SwapPrice: React.FC<Props> = ({ baseToken, quoteToken, isPriceInverted, onSwapPrices }) => {
  const displayQuoteToken = isPriceInverted ? baseToken : quoteToken
  const quoteTokenName = displayTokenSymbolOrLink(displayQuoteToken)

  return (
    <SwapPriceWrapper onClick={onSwapPrices}>
      <EllipsisText title={safeTokenName(displayQuoteToken)}>{quoteTokenName}</EllipsisText>
      <SwapIcon />
    </SwapPriceWrapper>
  )
}
