import React from 'react'
import BigNumber from 'bignumber.js'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { formatAmount, invertPrice, parseAmount, TokenDex } from '@gnosis.pm/dex-js'

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
  priceLabel: string
  inversePriceLabel: string
  priceValue: string
  inversePriceValue: string
}

const LOW_PRICE_FLOOR = new BigNumber('0.0001')

interface FormatPriceOptions {
  useThreshold?: boolean | undefined
  decimals?: number | undefined
}

export function formatPriceWithFloor(
  price: BigNumber,
  { useThreshold = false, decimals = PRICE_ESTIMATION_PRECISION }: FormatPriceOptions,
): string {
  const priceAsBN = parseAmount(price.toString(10), 18)
  return price.gt(LOW_PRICE_FLOOR) || !useThreshold
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      formatAmount({ amount: priceAsBN!, precision: 18, decimals })
    : '< ' + LOW_PRICE_FLOOR.toString()
}

function getPriceFormatted(price: BigNumber | null, isPriceInverted: boolean): FormattedPrices {
  if (price) {
    const inversePriceLabel = formatPriceWithFloor(invertPrice(price), { useThreshold: true })
    const priceLabel = formatPriceWithFloor(price, { useThreshold: true })
    const inversePriceValue = invertPrice(price).toString(10)
    const priceValue = price.toString(10)

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
  const { priceValue, inversePriceValue, priceLabel, inversePriceLabel } = getPriceFormatted(price, isPriceInverted)
  const displayPrice = priceLabel === 'Infinity' || inversePriceLabel === 'Infinity' ? 'N/A' : priceLabel
  return (
    <>
      <span>
        <span>{label}</span>{' '}
      </span>
      <button
        type="button"
        title={isPriceInverted ? inversePriceValue : priceValue}
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
