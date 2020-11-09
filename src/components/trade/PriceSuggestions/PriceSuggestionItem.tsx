import React from 'react'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

import { DEFAULT_DECIMAL_PLACES } from 'const'
import { formatAmount, formatAmountFull, invertPrice, parseAmount, TokenDex } from '@gnosis.pm/dex-js'

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

function formatPriceWithFloor(price: BigNumber): string {
  const priceAsBN = parseAmount(price.toString(10), 18)
  if (!priceAsBN || priceAsBN.isZero()) return 'N/A'

  const displayPrice = formatAmount({ amount: priceAsBN, precision: 18, decimals: DEFAULT_DECIMAL_PLACES })
  return price.gt(LOW_PRICE_FLOOR) ? displayPrice : '< ' + LOW_PRICE_FLOOR.toString(10)
}

interface GetPriceFormatted {
  price: BigNumber | null
  isPriceInverted: boolean
  btDecimals: number
  qtDecimals: number
}

function getPriceFormatted({ price, isPriceInverted }: GetPriceFormatted): FormattedPrices {
  if (price) {
    const inversePriceLabel = formatPriceWithFloor(invertPrice(price))
    const priceLabel = formatPriceWithFloor(price)
    // Use full precision for accuracy and tightest price
    const inversePriceBN = parseAmount(invertPrice(price).toString(10), 18) as BN
    const priceValueBN = parseAmount(price.toString(10), 18) as BN

    // Have to explicitly pass full precision when using object params
    const inversePriceValue = formatAmountFull({
      amount: inversePriceBN,
      precision: 18,
      thousandSeparator: false,
    })
    // Have to explicitly pass full precision when using object params
    const priceValue = formatAmountFull({
      amount: priceValueBN,
      precision: 18,
      thousandSeparator: false,
    })

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
    btDecimals: baseToken.decimals,
    qtDecimals: quoteToken.decimals,
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
