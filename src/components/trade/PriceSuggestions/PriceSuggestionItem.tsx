import React from 'react'
import BigNumber from 'bignumber.js'

import { DEFAULT_DECIMAL_PLACES } from 'const'
import { invertPrice, TokenDex } from '@gnosis.pm/dex-js'

import Spinner from 'components/common/Spinner'
import { SwapPrice } from 'components/common/SwapPrice'
import { amountToPrecisionDown, formatPriceWithFloor } from 'utils'

export interface Props {
  label: string
  baseToken: TokenDex
  quoteToken: TokenDex
  amount?: string
  price: BigNumber | null
  isPriceInverted: boolean
  loading: boolean
  onClickPrice: (price: string, invertedPrice: string) => void
  onSwapPrices: () => void
}

interface FormattedPrices {
  priceLabel: string
  inversePriceLabel: string
  priceValue: string
  inversePriceValue: string
}

interface GetPriceFormatted {
  price: BigNumber | null
  isPriceInverted: boolean
  baseTokenDecimals: number
  quoteTokenDecimals: number
}

function getPriceFormatted({
  price,
  isPriceInverted,
  baseTokenDecimals,
  quoteTokenDecimals,
}: GetPriceFormatted): FormattedPrices {
  if (price) {
    const inversePriceLabel = formatPriceWithFloor(invertPrice(price))
    const priceLabel = formatPriceWithFloor(price)

    // Use long precision form for accuracy
    // Rounds away 0's
    // See description on amountToPrecisionDown for more details/examples
    const inversePriceValue = amountToPrecisionDown(
      invertPrice(price),
      // if DEFAULT_DECIMAL_PLACES > someToken.decimals, show higher of the two
      // why? long form is used for calculation so a smaller precision aka less decimals would break math
      Math.max(baseTokenDecimals, DEFAULT_DECIMAL_PLACES),
    ).toString(10)

    const priceValue = amountToPrecisionDown(price, Math.max(quoteTokenDecimals, DEFAULT_DECIMAL_PLACES)).toString(10)

    if (isPriceInverted) {
      // Price is inverted
      return {
        priceLabel: inversePriceLabel,
        inversePriceLabel: priceLabel,
        priceValue: inversePriceValue,
        inversePriceValue: priceValue,
      }
    } else {
      // Price is not inverted
      return {
        priceLabel,
        inversePriceLabel,
        priceValue,
        inversePriceValue,
      }
    }
  } else {
    return {
      priceLabel: 'N/A',
      inversePriceLabel: 'N/A',
      priceValue: 'N/A',
      inversePriceValue: 'N/A',
    }
  }
}

export const PriceSuggestionItem: React.FC<Props> = (props) => {
  const { label, isPriceInverted, price, loading, baseToken, quoteToken, onSwapPrices, onClickPrice } = props

  // Return raw, unformatted values to pass to price calculations
  const { priceValue, inversePriceValue, priceLabel, inversePriceLabel } = getPriceFormatted({
    price,
    isPriceInverted,
    baseTokenDecimals: baseToken.decimals,
    quoteTokenDecimals: quoteToken.decimals,
  })
  const displayPrice = priceLabel === 'Infinity' || inversePriceLabel === 'Infinity' ? 'N/A' : priceLabel
  return (
    <>
      <span>
        <span>{label}</span>{' '}
      </span>
      <button
        type="button"
        // PriceValue inverted above, no need to invert here
        title={priceValue}
        disabled={loading || displayPrice === 'N/A'}
        onClick={(): void => onClickPrice(priceValue, inversePriceValue)}
      >
        {loading ? <Spinner /> : displayPrice}
      </button>
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        onSwapPrices={onSwapPrices}
        isPriceInverted={isPriceInverted}
      />
    </>
  )
}
