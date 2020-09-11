import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'
import { TokenDetails } from 'types'

interface Props
  extends Pick<
    PriceSuggestionsProps,
    'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices' | 'wasPriorityAdjusted'
  > {
  receiveToken: TokenDetails
  sellToken: TokenDetails
  networkId: number
  priceInputId: string
  priceInverseInputId: string
}

export const PriceSuggestionsComp: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
    receiveToken,
    sellToken,
    isPriceInverted,
    priceInputId,
    priceInverseInputId,
    wasPriorityAdjusted,
    onSwapPrices,
  } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = receiveToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = sellToken

  const { setValue, trigger } = useFormContext<TradeFormData>()

  const updatePrices = useCallback(
    (price: string, invertedPrice) => {
      if (wasPriorityAdjusted) {
        if (!isPriceInverted) {
          setValue(priceInputId, price)
          setValue(priceInverseInputId, invertedPrice)
        } else {
          setValue(priceInverseInputId, price)
          setValue(priceInputId, invertedPrice)
        }
      } else {
        if (!isPriceInverted) {
          setValue(priceInverseInputId, invertedPrice)
          setValue(priceInputId, price)
        } else {
          setValue(priceInputId, invertedPrice)
          setValue(priceInverseInputId, price)
        }
      }
      trigger()
    },
    [wasPriorityAdjusted, trigger, isPriceInverted, setValue, priceInputId, priceInverseInputId],
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
      sellToken={sellToken}
      isPriceInverted={isPriceInverted}
      wasPriorityAdjusted={wasPriorityAdjusted}
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