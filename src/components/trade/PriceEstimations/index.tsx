import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

import { TokenDetails } from '@gnosis.pm/dex-js'

import { MEDIA } from 'const'

import { TradeFormData } from 'components/TradeWidget'

import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'

import { SwapPrice } from 'components/common/SwapPrice'
import { EllipsisText } from 'components/common/EllipsisText'

import { PriceEstimation } from 'components/trade/PriceEstimations/PriceEstimation'

import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

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
  networkId: number
  baseToken: TokenDetails
  quoteToken: TokenDetails
  amount?: string
  isPriceInverted: boolean
  priceInputId: string
  priceInverseInputId: string
  onSwapPrices: () => void
}

export const PriceEstimations: React.FC<Props> = (props) => {
  const {
    networkId,
    amount,
    baseToken,
    quoteToken,
    isPriceInverted,
    priceInputId,
    priceInverseInputId,
    onSwapPrices,
  } = props
  const { id: baseTokenId, decimals: baseTokenDecimals } = baseToken
  const { id: quoteTokenId, decimals: quoteTokenDecimals } = quoteToken

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

  const { priceEstimation: limitPrice, isPriceLoading: limitPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: amount || '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  // TODO: Use best ask price instead
  const { priceEstimation: bestAskPrice, isPriceLoading: bestAskPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: '0',
    baseTokenId,
    baseTokenDecimals,
    quoteTokenId,
    quoteTokenDecimals,
  })

  const priceEstimationCommonPros = {
    baseToken,
    quoteToken,
    isPriceInverted,
    onSwapPrices,
    onClickPrice: updatePrices,
  }

  return (
    <Wrapper>
      <div>
        <strong>Price Suggestions</strong> <HelpTooltip tooltip={OnchainOrderbookTooltip} />
        <SwapPrice
          baseToken={quoteToken}
          quoteToken={baseToken}
          onSwapPrices={onSwapPrices}
          isPriceInverted={isPriceInverted}
        />
      </div>
      <div className="container">
        <PriceEstimation
          label="Best ask"
          price={bestAskPrice}
          loading={bestAskPriceLoading}
          {...priceEstimationCommonPros}
        />
        {amount && +amount != 0 && +amount != 1 && (
          <PriceEstimation
            label="Fill price"
            amount={amount}
            price={limitPrice}
            loading={limitPriceLoading}
            {...priceEstimationCommonPros}
          />
        )}
      </div>
    </Wrapper>
  )
}
