import React, { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import { TradeFormData } from 'components/TradeWidget'
import { PriceSuggestions, Props as PriceSuggestionsProps } from './PriceSuggestions'
import PriceImpact from '../PriceImpact'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { isNonZeroNumber } from 'utils'
import { invertPrice } from '@gnosis.pm/dex-js'
import { TokenDetails } from 'types'

interface Props
  extends Pick<PriceSuggestionsProps, 'baseToken' | 'quoteToken' | 'amount' | 'isPriceInverted' | 'onSwapPrices'> {
  networkId: number
  priceInputId: string
  priceInverseInputId: string
  receiveToken: TokenDetails
  sellToken: TokenDetails
  limitPrice: string
}

export const PriceSuggestionWidget: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
    receiveToken,
    sellToken,
    limitPrice,
    isPriceInverted,
    priceInputId,
    priceInverseInputId,
    onSwapPrices,
  } = props
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

  const { priceEstimation: fillPrice, isPriceLoading: fillPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId: receiveTokenId,
    baseTokenDecimals: receiveTokenDecimals,
    quoteTokenId: sellTokenId,
    quoteTokenDecimals: sellTokenDecimals,
  })

  // We need the price of the other token if the market was adjusted, otherwise prices will be wrong
  const adjustedFillPrice = fillPrice && (sellToken === quoteToken ? fillPrice : invertPrice(fillPrice))

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
        fillPrice={adjustedFillPrice}
        fillPriceLoading={fillPriceLoading}
        // Events
        onClickPrice={updatePrices}
        onSwapPrices={onSwapPrices}
      />
      {isNonZeroNumber(amount) && (
        <PriceImpact
          // Pass original tokenPair to check market adjustment
          baseToken={receiveToken}
          quoteToken={sellToken}
          // Prices
          limitPrice={limitPrice}
          fillPrice={fillPrice}
          networkId={networkId}
        />
      )}
    </>
  )
}
