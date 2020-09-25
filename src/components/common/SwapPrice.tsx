import React from 'react'
import styled from 'styled-components'
import { displayTokenSymbolOrLink, symbolOrAddress } from 'utils/display'
import { EllipsisText } from 'components/common/EllipsisText'

import { SwapIcon } from 'components/TradeWidget/SwapIcon'
import { TokenDetails } from '@gnosis.pm/dex-js'

const SwapPriceWrapper = styled.div`
  display: inline-block;
  cursor: pointer;

  ${EllipsisText} {
    display: inline;
  }

  small {
    margin: 0 0.3rem;
    font-size: 1rem;
  }
`
export interface Props {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  showBaseToken?: boolean
  isPriceInverted: boolean
  onSwapPrices: () => void
}

export const SwapPrice: React.FC<Props> = (props) => {
  const { baseToken, quoteToken, isPriceInverted, showBaseToken = false, onSwapPrices } = props
  let actualBaseToken, actualQuoteToken, actualBaseTokenTitle, actualQuoteTokenTitle
  if (isPriceInverted) {
    // Price is inversed
    actualBaseToken = displayTokenSymbolOrLink(quoteToken)
    actualQuoteToken = displayTokenSymbolOrLink(baseToken)
    actualBaseTokenTitle = symbolOrAddress(quoteToken)
    actualQuoteTokenTitle = symbolOrAddress(baseToken)
  } else {
    // Price is direct
    actualBaseToken = displayTokenSymbolOrLink(baseToken)
    actualQuoteToken = displayTokenSymbolOrLink(quoteToken)
    actualBaseTokenTitle = symbolOrAddress(baseToken)
    actualQuoteTokenTitle = symbolOrAddress(quoteToken)
  }

  return (
    <SwapPriceWrapper onClick={onSwapPrices}>
      <EllipsisText as="strong" title={actualQuoteTokenTitle}>
        {actualQuoteToken}
      </EllipsisText>
      {showBaseToken && (
        <>
          <small> per </small>
          <EllipsisText as="strong" title={actualBaseTokenTitle}>
            {actualBaseToken}
          </EllipsisText>
        </>
      )}

      <SwapIcon />
    </SwapPriceWrapper>
  )
}
