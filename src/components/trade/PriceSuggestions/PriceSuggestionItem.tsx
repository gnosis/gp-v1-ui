import React from 'react'
import BigNumber from 'bignumber.js'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { invertPrice, TokenDex } from '@gnosis.pm/dex-js'

import Spinner from 'components/common/Spinner'
import { SwapPrice } from 'components/common/SwapPrice'

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
  priceFormatted: string
  inversePriceFormatted: string
  inversePriceRaw: string
  priceRaw: string
}

const LOW_PRICE_FLOOR = new BigNumber(0.0001)

export function formatPriceToPrecision(price: BigNumber): string {
  return price.gt(LOW_PRICE_FLOOR) ? price.toFixed(PRICE_ESTIMATION_PRECISION) : '< ' + LOW_PRICE_FLOOR.toString()
}

function getPriceFormatted(price: BigNumber | null, isPriceInverted: boolean): FormattedPrices {
  if (price) {
    const inversePriceFormattedAux = formatPriceToPrecision(invertPrice(price))
    const priceFormattedAux = formatPriceToPrecision(price)
    const inversePriceRaw = invertPrice(price).toString(10)
    const priceRaw = price.toString(10)

    if (isPriceInverted) {
      // Price is inverted
      return {
        priceFormatted: inversePriceFormattedAux,
        inversePriceFormatted: priceFormattedAux,
        priceRaw: inversePriceRaw,
        inversePriceRaw: priceRaw,
      }
    } else {
      // Price is not inverted
      return {
        priceFormatted: priceFormattedAux,
        inversePriceFormatted: inversePriceFormattedAux,
        priceRaw,
        inversePriceRaw,
      }
    }
  } else {
    return {
      priceFormatted: 'N/A',
      inversePriceFormatted: 'N/A',
      priceRaw: 'N/A',
      inversePriceRaw: 'N/A',
    }
  }
}

export const PriceSuggestionItem: React.FC<Props> = (props) => {
  const { label, isPriceInverted, price, loading, baseToken, quoteToken, onSwapPrices, onClickPrice } = props

  // Return raw, unformatted values to pass to price calculations
  const { priceRaw, inversePriceRaw, priceFormatted, inversePriceFormatted } = getPriceFormatted(price, isPriceInverted)
  const displayPrice = priceFormatted === 'Infinity' || inversePriceFormatted === 'Infinity' ? 'N/A' : priceFormatted
  return (
    <>
      <span>
        <span>{label}</span>{' '}
      </span>
      <button
        type="button"
        title={isPriceInverted ? inversePriceRaw : priceRaw}
        disabled={loading || displayPrice === 'N/A'}
        onClick={(): void => onClickPrice(priceRaw, inversePriceRaw)}
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
