import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import BigNumber from 'bignumber.js'

import { TokenDetails, invertPrice } from '@gnosis.pm/dex-js'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { displayTokenSymbolOrLink } from 'utils/display'

import Spinner from 'components/Spinner'

import { TradeFormData } from 'components/TradeWidget'
import { SwapIcon } from 'components/TradeWidget/SwapIcon'
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'

const Wrapper = styled.div`
  > strong {
    text-transform: capitalize;
    margin: 0 0 1rem;
    font-size: 1.5rem;
    box-sizing: border-box;
    display: block;
  }

  .container {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr;
    gap: 0.25rem;
    font-size: 1.25rem;
    align-items: center;

    > small {
      justify-self: end;
    }
  }
`

interface PriceEstimationsProps {
  networkId: number
  baseToken: TokenDetails
  quoteToken: TokenDetails
  amount: string
  isPriceInverted: boolean
  priceInputId: string
  priceInverseInputId: string
  swapPrices: () => void
}

export const PriceEstimations: React.FC<PriceEstimationsProps> = props => {
  const { amount, isPriceInverted, priceInputId, priceInverseInputId } = props

  const { setValue } = useFormContext<TradeFormData>()

  const updatePrices = useCallback(
    (price: string, invertedPrice) => (): void => {
      if (!isPriceInverted) {
        setValue(priceInputId, price)
        setValue(priceInverseInputId, invertedPrice)
      } else {
        setValue(priceInverseInputId, price)
        setValue(priceInputId, invertedPrice)
      }
    },
    [isPriceInverted, setValue, priceInputId, priceInverseInputId],
  )

  return (
    <Wrapper>
      <strong>Price suggestions</strong>
      <div className="container">
        <OnchainOrderbookPriceEstimation {...props} amount="" updatePrices={updatePrices} />
        {amount && +amount != 0 && +amount != 1 && (
          <OnchainOrderbookPriceEstimation {...props} updatePrices={updatePrices} />
        )}
      </div>
    </Wrapper>
  )
}

interface OnchainOrderbookPriceEstimationProps extends Omit<PriceEstimationsProps, 'inputId'> {
  updatePrices: (price: string, invertedPrice: string) => () => void
}

function formatPriceToPrecision(price: BigNumber): string {
  return price.toFixed(PRICE_ESTIMATION_PRECISION)
}

const OnchainOrderbookTooltip = (
  <HelpTooltipContainer>
    Based on existing Onchain orders, taking into account possible ring trades. <br />
    Price is affected by sell amount. <br />
    Higher amounts might yield worse prices, or no price at all, considering what&apos;s available in the current batch.
    <br />
    <a href="https://docs.gnosis.io/protocol/docs/introduction1/" rel="noopener noreferrer" target="_blank">
      More details
    </a>
    .
  </HelpTooltipContainer>
)

const HighlightedText = styled.span`
  text-decoration-line: underline;
  text-decoration-style: dotted;
`

const OnchainOrderbookPriceEstimation: React.FC<OnchainOrderbookPriceEstimationProps> = props => {
  const { networkId, amount, baseToken, quoteToken, isPriceInverted, updatePrices, swapPrices } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount,
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  let price = 'N/A'
  let invertedPrice = 'N/A'

  if (priceEstimation) {
    price = formatPriceToPrecision(isPriceInverted ? invertPrice(priceEstimation) : priceEstimation)
    invertedPrice = formatPriceToPrecision(!isPriceInverted ? invertPrice(priceEstimation) : priceEstimation)
  }
  const displayPrice = price === 'Infinity' || invertedPrice === 'Infinity' ? 'N/A' : price

  const displayBaseToken = isPriceInverted ? quoteToken : baseToken
  const displayQuoteToken = !isPriceInverted ? quoteToken : baseToken

  return (
    <>
      <span>
        <HighlightedText>Onchain orderbook price</HighlightedText> <HelpTooltip tooltip={OnchainOrderbookTooltip} /> for
        selling{' '}
        <strong>
          {+amount || '1'} {displayTokenSymbolOrLink(quoteToken)}
        </strong>
        :
      </span>
      <button
        type="button"
        disabled={isPriceLoading || displayPrice === 'N/A'}
        onClick={updatePrices(price, invertedPrice)}
      >
        {isPriceLoading ? <Spinner /> : displayPrice}
      </button>
      <small>
        {displayTokenSymbolOrLink(displayQuoteToken)}/{displayTokenSymbolOrLink(displayBaseToken)}
        <SwapIcon swap={swapPrices} />
      </small>
    </>
  )
}
