import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'

interface Props
  extends Pick<PriceSuggestionsProps, 'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices'> {
  networkId: number
  priceInputId: string
  priceInverseInputId: string
}

export const PriceSuggestionWidget: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
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
      if (!isPriceInverted) {
        setValue(priceInputId, price)
        setValue(priceInverseInputId, invertedPrice)
      } else {
        setValue(priceInverseInputId, price)
        setValue(priceInputId, invertedPrice)
      }
      trigger()
    },
    [isPriceInverted, trigger, setValue, priceInputId, priceInverseInputId],
  )

  const { priceEstimation: limitPrice, isPriceLoading: fillPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  // TODO: Use best ask price instead
  const { priceEstimation: bestAskPrice, isPriceLoading: bestAskPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  return (
    <PriceSuggestions
      // Market
      baseToken={baseToken}
      quoteToken={quoteToken}
      isPriceInverted={isPriceInverted}
      // Order size
      amount={amount}
      // Prices
      fillPrice={limitPrice}
      fillPriceLoading={fillPriceLoading}
      bestAskPrice={bestAskPrice}
      bestAskPriceLoading={bestAskPriceLoading}
      // Events
      onClickPrice={updatePrices}
      onSwapPrices={onSwapPrices}
    />
  )
}
