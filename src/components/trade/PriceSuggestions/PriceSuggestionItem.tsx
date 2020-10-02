import React from 'react'
import BigNumber from 'bignumber.js'

import { PRICE_ESTIMATION_PRECISION } from 'const'
import { invertPrice, TokenDetails } from '@gnosis.pm/dex-js'

import { displayTokenSymbolOrLink } from 'utils/display'

import Spinner from 'components/common/Spinner'
import { SwapPrice } from 'components/common/SwapPrice'

import styled from 'styled-components'

const LongPriceStrong = styled.strong`
  word-break: break-all;
`

export interface Props {
  label: string
  baseToken: TokenDetails
  quoteToken: TokenDetails
  sellToken: TokenDetails
  amount?: string
  price: BigNumber | null
  isPriceInverted: boolean
  loading: boolean
  onClickPrice: (price: string, invertedPrice: string) => void
  onSwapPrices: () => void
}

interface FormattedPrices {
  priceFormatted: string
  invertedPriceFormatted: string
}

function formatPriceToPrecision(price: BigNumber): string {
  return price.toFixed(PRICE_ESTIMATION_PRECISION)
}

function getPriceFormatted(price: BigNumber | null, isPriceInverted: boolean): FormattedPrices {
  if (price) {
    const invertedPriceFormattedAux = formatPriceToPrecision(invertPrice(price))
    const priceFormattedAux = formatPriceToPrecision(price)

    if (isPriceInverted) {
      // Price is inverted
      return {
        priceFormatted: invertedPriceFormattedAux,
        invertedPriceFormatted: priceFormattedAux,
      }
    } else {
      // Price is not inverted
      return {
        priceFormatted: priceFormattedAux,
        invertedPriceFormatted: invertedPriceFormattedAux,
      }
    }
  } else {
    return {
      priceFormatted: 'N/A',
      invertedPriceFormatted: 'N/A',
    }
  }
}

export const PriceSuggestionItem: React.FC<Props> = (props) => {
  const {
    label,
    isPriceInverted,
    price,
    loading,
    amount,
    sellToken,
    baseToken,
    quoteToken,
    onSwapPrices,
    onClickPrice,
  } = props

  const { priceFormatted, invertedPriceFormatted } = getPriceFormatted(price, isPriceInverted)
  const displayPrice = priceFormatted === 'Infinity' || invertedPriceFormatted === 'Infinity' ? 'N/A' : priceFormatted

  return (
    <>
      <span>
        <span>{label}</span>{' '}
        {amount && (
          <LongPriceStrong>
            ({amount} {displayTokenSymbolOrLink(sellToken)})
          </LongPriceStrong>
        )}
      </span>
      <button
        type="button"
        disabled={loading || displayPrice === 'N/A'}
        onClick={(): void => onClickPrice(priceFormatted, invertedPriceFormatted)}
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
