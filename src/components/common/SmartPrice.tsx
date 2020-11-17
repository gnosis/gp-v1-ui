import { calculatePrice, formatPrice, invertPrice, safeTokenName } from '@gnosis.pm/dex-js'
import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Fraction, TokenDetails } from 'types'

import { SwapPrice } from 'components/common/SwapPrice'
import { amountToPrecisionUp, getMarket } from 'utils'
import { DEFAULT_DECIMALS } from 'const'

interface Props {
  buyToken: TokenDetails
  sellToken: TokenDetails
  price: Fraction
}

export const SmartPrice: React.FC<Props> = ({ buyToken, sellToken, price: priceFraction }) => {
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const { baseToken, quoteToken } = useMemo(() => getMarket({ sellToken, receiveToken: buyToken }), [
    buyToken,
    sellToken,
  ])

  const [price, priceInverse] = useMemo((): BigNumber[] => {
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

    return [price, priceInverse]
  }, [buyToken, sellToken, quoteToken, priceFraction])

  let priceDisplayed: BigNumber, quoteDisplayed: TokenDetails, baseDisplayed: TokenDetails
  if (isPriceInverted) {
    priceDisplayed = priceInverse
    quoteDisplayed = baseToken
    baseDisplayed = quoteToken
  } else {
    priceDisplayed = price
    quoteDisplayed = quoteToken
    baseDisplayed = baseToken
  }

  const [priceDisplay, priceDisplayFull] = useMemo(
    // Decimals here refers to decimal places to show. Not a precision issue
    () => [
      formatPrice({ price: priceDisplayed, decimals: DEFAULT_DECIMALS }),
      amountToPrecisionUp(priceDisplayed, (isPriceInverted ? baseToken : quoteToken).decimals).toString(10),
    ],
    [priceDisplayed, isPriceInverted, quoteToken, baseToken],
  )

  return (
    <span title={`${priceDisplayFull} ${safeTokenName(quoteDisplayed)} per ${safeTokenName(baseDisplayed)}`}>
      {priceDisplay}
      &nbsp;
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        isPriceInverted={isPriceInverted}
        onSwapPrices={(): void => setIsPriceInverted((isPriceInverted) => !isPriceInverted)}
      />
    </span>
  )
}
