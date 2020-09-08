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
  separator?: string
  showOnlyQuoteToken?: boolean
  onSwapPrices: () => void
}

export const SwapPrice: React.FC<Props> = ({
  baseToken,
  quoteToken,
  separator = '/',
  isPriceInverted,
  showOnlyQuoteToken = false,
  onSwapPrices,
}) => {
  const displayBaseToken = !isPriceInverted ? quoteToken : baseToken
  const displayQuoteToken = isPriceInverted ? quoteToken : baseToken
  const displayBtName = displayTokenSymbolOrLink(displayBaseToken)
  const displayQtName = displayTokenSymbolOrLink(displayQuoteToken)

  return (
    <SwapPriceWrapper onClick={onSwapPrices}>
      {!showOnlyQuoteToken && (
        <>
          <EllipsisText title={safeTokenName(displayBaseToken)}>{displayBtName}</EllipsisText>
          <div className="separator">{separator}</div>
        </>
      )}
      <EllipsisText title={safeTokenName(displayQuoteToken)}>{displayQtName}</EllipsisText>
      <SwapIcon />
    </SwapPriceWrapper>
  )
}
