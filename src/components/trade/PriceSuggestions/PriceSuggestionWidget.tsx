import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import useBestAsk from 'hooks/useBestAsk'

import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'
import { TokenDetails } from 'types'

interface Props
  extends Pick<PriceSuggestionsProps, 'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices'> {
  receiveToken: TokenDetails
  sellToken: TokenDetails
  networkId: number
  priceInputId: string
  priceInverseInputId: string
  wasPriorityAdjusted: boolean
}

export const PriceSuggestionWidget: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
    sellToken,
    isPriceInverted,
    priceInputId,
    priceInverseInputId,
    wasPriorityAdjusted,
    onSwapPrices,
  } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  const { setValue, trigger } = useFormContext<TradeFormData>()

  const updatePrices = useCallback(
    (price: string, invertedPrice) => {
      // Why do we need to check if the market priority was adjusted here?
      // adjusting a market (i.e switching which token = QUOTE when showing price)
      // it is essentially the same as flipping the market, meaning inverting THAT price will essentially
      // show the original price. So it needs to be checked to keep it inverted
      if (wasPriorityAdjusted) {
        if (!isPriceInverted) {
          setValue(priceInputId, invertedPrice)
          setValue(priceInverseInputId, price)
        } else {
          setValue(priceInputId, price)
          setValue(priceInverseInputId, invertedPrice)
        }
      } else {
        if (!isPriceInverted) {
          setValue(priceInputId, price)
          setValue(priceInverseInputId, invertedPrice)
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
      // Order size
      amount={amount}
      // Prices
      fillPrice={limitPrice}
      fillPriceLoading={fillPriceLoading}
      bestAskPrice={bestAskPrice}
      bestAskPriceLoading={isBestAskLoading}
      // Events
      onClickPrice={updatePrices}
      onSwapPrices={onSwapPrices}
    />
  )
}
