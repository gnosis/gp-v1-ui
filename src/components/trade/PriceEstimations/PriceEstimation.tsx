import React from 'react'
import BigNumber from 'bignumber.js'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { invertPrice } from '@gnosis.pm/dex-js'

import { displayTokenSymbolOrLink } from 'utils/display'
import Spinner from 'components/common/Spinner'
import { SwapPrice } from 'components/common/SwapPrice'

import { Props as PriceEstimationsProps } from 'components/trade/PriceEstimations'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

export interface Props extends Omit<PriceEstimationsProps, 'inputId'> {
  label: string
  updatePrices: (price: string, invertedPrice: string) => () => void
}

function formatPriceToPrecision(price: BigNumber): string {
  return price.toFixed(PRICE_ESTIMATION_PRECISION)
}

export const OnchainOrderbookPriceEstimation: React.FC<Props> = (props) => {
  const { networkId, amount, baseToken, quoteToken, isPriceInverted, swapPrices, updatePrices, label } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
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

  return (
    <>
      <span>
        <span>{label}</span>{' '}
        {amount && (
          <strong>
            ({amount} {displayTokenSymbolOrLink(quoteToken)})
          </strong>
        )}
      </span>
      <button
        type="button"
        disabled={isPriceLoading || displayPrice === 'N/A'}
        onClick={updatePrices(price, invertedPrice)}
      >
        {isPriceLoading ? <Spinner /> : displayPrice}
      </button>
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        swapPrices={swapPrices}
        isPriceInverted={isPriceInverted}
        showOnlyQuoteToken
      />
    </>
  )
}
