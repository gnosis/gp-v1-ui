import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import useBestAsk from 'hooks/useBestAsk'

import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'
import { TokenDetails } from 'types'
import { invertPrice } from '@gnosis.pm/dex-js'

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

export const PriceSuggestionWidget: React.FC<Props> = (props) => {
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
        if (isPriceInverted) {
          setValue(priceInputId, price)
          setValue(priceInverseInputId, invertedPrice)
        } else {
          setValue(priceInverseInputId, price)
          setValue(priceInputId, invertedPrice)
        }
      } else {
        if (isPriceInverted) {
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

  const { bestAskPrice, isBestAskLoading } = useBestAsk({
    networkId,
    baseTokenId,
    quoteTokenId,
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
      bestAskPrice={bestAskPrice && invertPrice(bestAskPrice)}
      bestAskPriceLoading={isBestAskLoading}
      // Events
      onClickPrice={updatePrices}
      onSwapPrices={onSwapPrices}
    />
  )
}
