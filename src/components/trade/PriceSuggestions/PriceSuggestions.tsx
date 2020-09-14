import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { MEDIA } from 'const'

import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { SwapPrice } from 'components/common/SwapPrice'
import { EllipsisText } from 'components/common/EllipsisText'
import { PriceSuggestionItem } from 'components/trade/PriceSuggestions/PriceSuggestionItem'
import BigNumber from 'bignumber.js'

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

export interface Props {
  // Market
  baseToken: TokenDetails
  quoteToken: TokenDetails
  isPriceInverted: boolean

  // Order Size
  amount?: string

  // Prices
  bestAskPrice: BigNumber | null
  bestAskPriceLoading: boolean
  fillPrice: BigNumber | null
  fillPriceLoading: boolean

  // events
  onClickPrice: (price: string, invertedPrice: string) => void
  onSwapPrices: () => void
}

export const PriceSuggestions: React.FC<Props> = (props) => {
  const {
    amount,
    baseToken,
    quoteToken,
    isPriceInverted,
    bestAskPrice,
    bestAskPriceLoading,
    fillPrice,
    fillPriceLoading,
    onClickPrice,
    onSwapPrices,
  } = props

  const commonProps = {
    baseToken,
    quoteToken,
    isPriceInverted,
    onClickPrice,
    onSwapPrices,
  }

  return (
    <Wrapper>
      <div>
        <strong>Price Suggestions</strong> <HelpTooltip tooltip={OnchainOrderbookTooltip} />
        <SwapPrice
          quoteToken={baseToken}
          baseToken={quoteToken}
          onSwapPrices={onSwapPrices}
          isPriceInverted={isPriceInverted}
        />
      </div>
      <div className="container">
        <PriceSuggestionItem label="Best ask" price={bestAskPrice} loading={bestAskPriceLoading} {...commonProps} />
        {amount && +amount != 0 && +amount != 1 && (
          <PriceSuggestionItem
            label="Fill price"
            amount={amount}
            price={fillPrice}
            loading={fillPriceLoading}
            {...commonProps}
          />
        )}
      </div>
    </Wrapper>
  )
}
