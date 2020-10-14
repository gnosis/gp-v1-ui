import { calculatePrice, formatPrice, invertPrice, safeTokenName } from '@gnosis.pm/dex-js'
import React, { useMemo, useState } from 'react'
import { Fraction, TokenDetails } from 'types'

import { SwapPrice } from 'components/common/SwapPrice'
import { getMarket } from 'utils'

interface Props {
  buyToken: TokenDetails
  sellToken: TokenDetails
  price: Fraction
}

export const SmartPrice: React.FC<Props> = ({ buyToken, sellToken, price: priceFraction }) => {
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const { baseToken, quoteToken } = getMarket({ sellToken, receiveToken: buyToken })

  const [price, priceInverse] = useMemo((): string[] => {
    const buyOrderPrice = calculatePrice({
      numerator: { amount: priceFraction.numerator, decimals: buyToken.decimals },
      denominator: { amount: priceFraction.denominator, decimals: sellToken.decimals },
    })
    const buyOrderPriceInverse = invertPrice(buyOrderPrice)
    const buyTokenIsQuote = buyToken === quoteToken
    let price, priceInverse
    if (buyTokenIsQuote) {
      price = buyOrderPrice
      priceInverse = buyOrderPriceInverse
    } else {
      price = buyOrderPriceInverse
      priceInverse = buyOrderPrice
    }
    return [formatPrice(price), formatPrice(priceInverse)]
  }, [buyToken, sellToken, quoteToken, priceFraction])

  let priceDisplayed: string, quoteDisplayed: TokenDetails, baseDisplayed: TokenDetails
  if (isPriceInverted) {
    priceDisplayed = priceInverse
    quoteDisplayed = baseToken
    baseDisplayed = quoteToken
  } else {
    priceDisplayed = price
    quoteDisplayed = quoteToken
    baseDisplayed = baseToken
  }

  return (
    <span title={`${priceDisplayed} ${safeTokenName(quoteDisplayed)} per ${safeTokenName(baseDisplayed)}`}>
      {priceDisplayed}
      &nbsp;
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        isPriceInverted={isPriceInverted}
        onSwapPrices={(): void => setIsPriceInverted(!isPriceInverted)}
      />
    </span>
  )
}
