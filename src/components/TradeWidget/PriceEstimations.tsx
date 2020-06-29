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
  const { isPriceInverted, priceInputId, priceInverseInputId } = props

  const { setValue } = useFormContext<TradeFormData>()

  const updatePrice = useCallback(
    (price: string) => (): void => {
      if (!isPriceInverted) {
        setValue(priceInputId, price)
        setValue(priceInverseInputId, invertPrice(new BigNumber(price)).toFixed(PRICE_ESTIMATION_PRECISION))
      } else {
        setValue(priceInverseInputId, price)
        setValue(priceInputId, invertPrice(new BigNumber(price)).toFixed(PRICE_ESTIMATION_PRECISION))
      }
    },
    [isPriceInverted, setValue, priceInputId, priceInverseInputId],
  )

  return (
    <div>
      <strong>Price suggestions</strong>
      <OnchainOrderbookPriceEstimation {...props} amount="" updatePrice={updatePrice} />
      <OnchainOrderbookPriceEstimation {...props} updatePrice={updatePrice} />
    </div>
  )
}

interface OnchainOrderbookPriceEstimationProps extends Omit<PriceEstimationsProps, 'inputId'> {
  updatePrice: (price: string) => () => void
}

const OnchainOrderbookPriceEstimation: React.FC<OnchainOrderbookPriceEstimationProps> = props => {
  const { networkId, amount, baseToken, quoteToken, isPriceInverted, updatePrice } = props
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

  const displayPrice = priceEstimation
    ? (isPriceInverted ? invertPrice(priceEstimation) : priceEstimation).toFixed(PRICE_ESTIMATION_PRECISION)
    : '0'

  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1em 0 0.1em 0.5em', fontSize: '1.4rem' }}
    >
      <span>
        Onchain orderbook price for <strong>{amount || '1'}</strong>{' '}
        {displayTokenSymbolOrLink(isPriceInverted ? baseToken : quoteToken)}:
      </span>
      <button disabled={isPriceLoading} onClick={updatePrice(displayPrice)}>
        {isPriceLoading && <Spinner />}
        {displayPrice}
      </button>
    </div>
  )
}
