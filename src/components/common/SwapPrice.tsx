import React from 'react'
import styled from 'styled-components'
import { displayTokenSymbolOrLink } from 'utils/display'
import { EllipsisText } from 'components/common/EllipsisText'
import { Props as PriceEstimationsProps } from 'components/trade/PriceEstimations'

import { SwapIcon } from 'components/TradeWidget/SwapIcon'
import { safeTokenName } from '@gnosis.pm/dex-js'

const SwapPriceWrapper = styled.div`
  cursor: pointer;
  div.separator {
    margin: 0 0.4rem;
  }
`
export interface Props
  extends Pick<PriceEstimationsProps, 'baseToken' | 'quoteToken' | 'isPriceInverted' | 'swapPrices'> {
  separator?: string
  showOnlyQuoteToken?: boolean
}

export const SwapPrice: React.FC<Props> = ({
  baseToken,
  quoteToken,
  separator = '/',
  isPriceInverted,
  swapPrices,
  showOnlyQuoteToken = false,
}) => {
  const displayBaseToken = !isPriceInverted ? quoteToken : baseToken
  const displayQuoteToken = isPriceInverted ? quoteToken : baseToken
  const displayBtName = displayTokenSymbolOrLink(displayBaseToken)
  const displayQtName = displayTokenSymbolOrLink(displayQuoteToken)

  return (
    <SwapPriceWrapper onClick={swapPrices}>
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
