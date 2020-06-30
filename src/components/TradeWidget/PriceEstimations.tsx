import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import BigNumber from 'bignumber.js'

import { TokenDetails, invertPrice } from '@gnosis.pm/dex-js'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { displayTokenSymbolOrLink } from 'utils/display'

import Spinner from 'components/Spinner'

import { TradeFormData } from 'components/TradeWidget'

interface PriceEstimationsProps {
  networkId: number
  baseToken: TokenDetails
  quoteToken: TokenDetails
  amount: string
  isPriceInverted: boolean
  priceInputId: string
  priceInverseInputId: string
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
    <div>
      <strong>Price suggestions</strong>
      <OnchainOrderbookPriceEstimation {...props} amount="" updatePrices={updatePrices} />
      {amount && +amount != 0 && +amount != 1 && (
        <OnchainOrderbookPriceEstimation {...props} updatePrices={updatePrices} />
      )}
    </div>
  )
}

interface OnchainOrderbookPriceEstimationProps extends Omit<PriceEstimationsProps, 'inputId'> {
  updatePrices: (price: string, invertedPrice: string) => () => void
}

function formatPriceToPrecision(price: BigNumber): string {
  return price.toFixed(PRICE_ESTIMATION_PRECISION)
}

const OnchainOrderbookPriceEstimation: React.FC<OnchainOrderbookPriceEstimationProps> = props => {
  const { networkId, amount, baseToken, quoteToken, isPriceInverted, updatePrices: updatePrice } = props
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
    <div
      style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1em 0 0.1em 0.5em', fontSize: '1.2rem' }}
    >
      <span>
        Onchain orderbook price for selling <strong>{amount || '1'}</strong> {displayTokenSymbolOrLink(quoteToken)}:
      </span>
      <button disabled={isPriceLoading || displayPrice === 'N/A'} onClick={updatePrice(price, invertedPrice)}>
        {isPriceLoading ? <Spinner /> : displayPrice}
      </button>
      <small>
        {displayTokenSymbolOrLink(displayBaseToken)}/{displayTokenSymbolOrLink(displayQuoteToken)}
      </small>
    </div>
  )
}
