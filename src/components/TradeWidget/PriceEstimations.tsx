import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import BigNumber from 'bignumber.js'

import { TokenDetails, invertPrice, safeTokenName } from '@gnosis.pm/dex-js'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { PRICE_ESTIMATION_PRECISION, MEDIA } from 'const'
import { displayTokenSymbolOrLink } from 'utils/display'

import Spinner from 'components/atoms/Spinner'

import { TradeFormData } from 'components/TradeWidget'
import { SwapIcon } from 'components/TradeWidget/SwapIcon'
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { EllipsisText } from 'components/Layout'

const Wrapper = styled.div`
  > div {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin: 0 0 1rem;

    > strong {
      display: inline-block;
      box-sizing: border-box;
      font-size: 1.5rem;
      margin-right: 0.5rem;
      text-transform: capitalize;

      // tooltip
      ~ span {
        font-size: 1.2rem;
      }
    }
    // swapper
    > div {
      display: none;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      font-size: 1.2rem;

      @media ${MEDIA.xSmallDown} {
        display: flex;
      }
    }
  }

  button {
    border-radius: 3rem;
    padding: 0.5rem 1rem;
    font-size: smaller;
  }

  .container {
    display: grid;
    grid-template-columns: 4fr 1fr min-content;
    gap: 0.5rem;
    font-size: 1.25rem;
    align-items: center;
    line-height: 1.4;
    padding: 0 0.8rem;

    > div {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      > ${EllipsisText} {
        display: inline-block;
        font-size: smaller;
        width: 6ch;
        text-align: right;
        font-weight: bold;
      }

      // Separator
      > div:nth-child(2) {
        font-size: larger;
        margin: 0 0.1rem;
      }
      // Swap SVG
      > span:last-child {
        padding: 0 0.2rem 0 0.4rem;
      }
    }

    @media ${MEDIA.xSmallDown} {
      grid-auto-flow: row;

      > div {
        // tokenA/TokenB swapSVG
        > div {
          // hide: /
          &:nth-child(2),
          // hide: tokenB
          &:nth-child(3),
          // hide: swapSVG
          ~ span {
            display: none;
          }
        }
      }
    }
  }
`

interface SwapPriceProps
  extends Pick<PriceEstimationsProps, 'baseToken' | 'quoteToken' | 'isPriceInverted' | 'swapPrices'> {
  separator?: string
  showOnlyQuoteToken?: boolean
}

const SwapPriceWrapper = styled.div`
  cursor: pointer;
  div.separator {
    margin: 0 0.4rem;
  }
`

export const SwapPrice: React.FC<SwapPriceProps> = ({
  baseToken,
  quoteToken,
  separator = '/',
  isPriceInverted,
  swapPrices,
  showOnlyQuoteToken = false,
}) => {
  const displayBaseToken = !isPriceInverted ? quoteToken : baseToken
  const displayQuoteToken = isPriceInverted ? quoteToken : baseToken
  const displayBtName = displayTokenSymbolOrLink(displayBaseToken)
  const displayQtName = displayTokenSymbolOrLink(displayQuoteToken)

  return (
    <SwapPriceWrapper onClick={swapPrices}>
      {!showOnlyQuoteToken && (
        <>
          <EllipsisText title={safeTokenName(displayBaseToken)}>{displayBtName}</EllipsisText>
          <div className="separator">{separator}</div>
        </>
      )}
      <EllipsisText title={safeTokenName(displayQuoteToken)}>{displayQtName}</EllipsisText>
      <SwapIcon />
    </SwapPriceWrapper>
  )
}

const OnchainOrderbookTooltip = (
  <HelpTooltipContainer>
    Based on existing Onchain orders, taking into account possible ring trades. <br />
    Price is affected by sell amount. <br />
    Higher amounts might yield worse prices, or no price at all, considering what&apos;s available in the current batch.
    <br />
    <a href="https://docs.gnosis.io/protocol/docs/introduction1/" rel="noopener noreferrer" target="_blank">
      More details
    </a>
    .
  </HelpTooltipContainer>
)

interface PriceEstimationsProps {
  networkId: number
  baseToken: TokenDetails
  quoteToken: TokenDetails
  amount?: string
  isPriceInverted: boolean
  priceInputId: string
  priceInverseInputId: string
  swapPrices: () => void
}

export const PriceEstimations: React.FC<PriceEstimationsProps> = (props) => {
  const { amount, baseToken, quoteToken, isPriceInverted, priceInputId, priceInverseInputId, swapPrices } = props

  const { setValue, trigger } = useFormContext<TradeFormData>()

  const updatePrices = useCallback(
    (price: string, invertedPrice) => (): void => {
      if (!isPriceInverted) {
        setValue(priceInputId, price)
        setValue(priceInverseInputId, invertedPrice)
      } else {
        setValue(priceInverseInputId, price)
        setValue(priceInputId, invertedPrice)
      }
      trigger()
    },
    [isPriceInverted, trigger, setValue, priceInputId, priceInverseInputId],
  )

  return (
    <Wrapper>
      <div>
        <strong>Price Suggestions</strong> <HelpTooltip tooltip={OnchainOrderbookTooltip} />
        <SwapPrice
          baseToken={quoteToken}
          quoteToken={baseToken}
          swapPrices={swapPrices}
          isPriceInverted={isPriceInverted}
        />
      </div>
      <div className="container">
        <OnchainOrderbookPriceEstimation {...props} amount="" updatePrices={updatePrices} />
        {amount && +amount != 0 && +amount != 1 && (
          <OnchainOrderbookPriceEstimation {...props} updatePrices={updatePrices} />
        )}
      </div>
    </Wrapper>
  )
}

interface OnchainOrderbookPriceEstimationProps extends Omit<PriceEstimationsProps, 'inputId'> {
  updatePrices: (price: string, invertedPrice: string) => () => void
}

function formatPriceToPrecision(price: BigNumber): string {
  return price.toFixed(PRICE_ESTIMATION_PRECISION)
}

const OnchainOrderbookPriceEstimation: React.FC<OnchainOrderbookPriceEstimationProps> = (props) => {
  const { networkId, amount, baseToken, quoteToken, isPriceInverted, swapPrices, updatePrices } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  let price = 'N/A'
  let invertedPrice = 'N/A'

  if (priceEstimation) {
    price = formatPriceToPrecision(isPriceInverted ? invertPrice(priceEstimation) : priceEstimation)
    invertedPrice = formatPriceToPrecision(!isPriceInverted ? invertPrice(priceEstimation) : priceEstimation)
  }
  const displayPrice = price === 'Infinity' || invertedPrice === 'Infinity' ? 'N/A' : price

  return (
    <>
      <span>
        <span>Best ask</span>{' '}
        {amount && (
          <strong>
            ({amount} {displayTokenSymbolOrLink(quoteToken)})
          </strong>
        )}
      </span>
      <button
        type="button"
        disabled={isPriceLoading || displayPrice === 'N/A'}
        onClick={updatePrices(price, invertedPrice)}
      >
        {isPriceLoading ? <Spinner /> : displayPrice}
      </button>
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        swapPrices={swapPrices}
        isPriceInverted={isPriceInverted}
        showOnlyQuoteToken
      />
    </>
  )
}
