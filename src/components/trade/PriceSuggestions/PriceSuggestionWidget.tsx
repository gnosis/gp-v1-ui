import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'

import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import useBestAsk from 'hooks/useBestAsk'

import { invertPrice } from '@gnosis.pm/dex-js'
import { TokenDetails } from 'types'

interface Props
  extends Pick<PriceSuggestionsProps, 'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices'> {
  networkId: number
  priceInputId: string
  priceInverseInputId: string
  receiveToken: TokenDetails
  sellToken: TokenDetails
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
    onSwapPrices,
  } = props
  const { id: baseTokenId } = baseToken
  const { id: quoteTokenId } = quoteToken
  const { id: receiveTokenId, decimals: receiveTokenDecimals } = receiveToken
  const { id: sellTokenId, decimals: sellTokenDecimals } = sellToken

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

  const { priceEstimation: limitPrice, isPriceLoading: fillPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId: receiveTokenId,
    baseTokenDecimals: receiveTokenDecimals,
    quoteTokenId: sellTokenId,
    quoteTokenDecimals: sellTokenDecimals,
  })

  // We need the price of the other token if the market was adjusted, otherwise prices will be wrong
  const adjustedLimitPrice = limitPrice && (sellToken === quoteToken ? limitPrice : invertPrice(limitPrice))

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
      isPriceInverted={isPriceInverted}
      // Order size
      amount={amount}
      // Prices
      fillPrice={adjustedLimitPrice}
      fillPriceLoading={fillPriceLoading}
      bestAskPrice={bestAskPrice}
      bestAskPriceLoading={isBestAskLoading}
      // Events
      onClickPrice={updatePrices}
      onSwapPrices={onSwapPrices}
    />
  )
}
