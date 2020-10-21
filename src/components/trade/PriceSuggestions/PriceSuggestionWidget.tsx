import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'
import PriceImpact from '../PriceImpact'
import { isStrNumTruthy } from 'utils'

interface Props
  extends Pick<PriceSuggestionsProps, 'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices'> {
  networkId: number
  priceInputId: string
  priceInverseInputId: string
  limitPrice: string
}

export const PriceSuggestionWidget: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
    limitPrice,
    isPriceInverted,
    priceInputId,
    priceInverseInputId,
    onSwapPrices,
  } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  const { setValue, trigger } = useFormContext<TradeFormData>()

  const updatePrices = useCallback(
    (price: string, invertedPrice) => {
      if (isPriceInverted) {
        setValue(priceInverseInputId, price)
        setValue(priceInputId, invertedPrice)
      } else {
        setValue(priceInputId, price)
        setValue(priceInverseInputId, invertedPrice)
      }
      trigger()
    },
    [isPriceInverted, trigger, setValue, priceInputId, priceInverseInputId],
  )

  const { priceEstimation: fillPrice, isPriceLoading: fillPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  return (
    <>
      <PriceSuggestions
        // Market
        baseToken={baseToken}
        quoteToken={quoteToken}
        isPriceInverted={isPriceInverted}
        // Order size
        amount={amount}
        // Prices
        fillPrice={fillPrice}
        fillPriceLoading={fillPriceLoading}
        // Events
        onClickPrice={updatePrices}
        onSwapPrices={onSwapPrices}
      />
      {isStrNumTruthy(amount) && (
        <PriceImpact
          baseToken={baseToken}
          quoteToken={quoteToken}
          limitPrice={limitPrice}
          fillPrice={fillPrice}
          networkId={networkId}
        />
      )}
    </>
  )
}
