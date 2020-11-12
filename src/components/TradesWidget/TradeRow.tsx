import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatDistanceStrict } from 'date-fns'
import BigNumber from 'bignumber.js'

import { formatPrice, formatSmart, formatAmountFull, invertPrice, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'

import { Trade, TradeType } from 'api/exchange/ExchangeApi'

import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { EllipsisText } from 'components/common/EllipsisText'

import { FoldableRowWrapper } from 'components/layout/SwapLayout/Card'

import { isTradeSettled, divideBN, formatPercentage, getMarket } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'
import { DEFAULT_DECIMALS, MEDIA, ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER } from 'const'
import { SwapIcon } from 'components/TradeWidget/SwapIcon'

// minimum floor amount surplus must be greater than for it to display on frontend
const SURPLUS_THRESHOLD = 0.01

const TradeRowFoldableWrapper = styled(FoldableRowWrapper)`
  td {
    &[data-label='Order ID'],
    &[data-label='Market'] {
      cursor: pointer;
    }

    span.swapIcon {
      margin-left: 0.4rem;
    }

    div.surplusHighlight {
      color: var(--color-button-success);
      font-size: smaller;
      font-weight: bolder;
      margin: 0.2rem 0;
    }
  }

  @media ${MEDIA.mobile} {
    &&&&& {
      display: flex;

      td[data-label='Order ID'] {
        order: -2;
      }

      td[data-label='Market'] {
        order: -1;
        border-bottom: 0.1rem solid rgba(0, 0, 0, 0.14);
      }

      td[data-label='View on Etherscan'] {
        border-bottom: none;
      }
    }
  }
`

const SplitHeaderTitle = styled.div`
  display: flex;
  flex-flow: column;
`

interface TradeRowProps {
  trade: Trade
  networkId?: number
  onCellClick: (e: Pick<React.BaseSyntheticEvent<HTMLInputElement>, 'target'>) => void
}

const TypePill = styled.span<{
  tradeType?: TradeType
}>`
  background-color: ${({ tradeType }): string => {
    switch (tradeType) {
      case 'full':
        return 'darkgreen'
      case 'partial':
        return 'darkorange'
      case 'liquidity':
        return 'blueviolet'
      case 'unknown':
      default:
        return 'grey'
    }
  }};
  display: inline-block;
  font-size: 0.9rem;
  padding: 0.2rem 0.8rem;
  min-width: 6.5em;
  color: white;
  font-weight: bold;
  border-radius: 1em;
  text-align: center;
  text-transform: uppercase;
`

interface MarketAndPricesParams extends Pick<Trade, 'buyToken' | 'sellToken' | 'limitPrice' | 'fillPrice'> {
  isPriceInverted: boolean
}

interface MarketAndPrices {
  quoteTokenLabel: React.ReactNode
  sellTokenLabel: React.ReactNode
  buyTokenLabel: React.ReactNode
  market: string
  limitPrice?: BigNumber
  fillPrice: BigNumber
  surplus?: number
}

const calcPercentage = (amount: BigNumber, divisor: BigNumber): BigNumber =>
  ONE_HUNDRED_BIG_NUMBER.times(ONE_BIG_NUMBER.minus(amount.div(divisor)))

function getMarketAndPrices(params: MarketAndPricesParams): MarketAndPrices {
  const { sellToken, buyToken, isPriceInverted, fillPrice, limitPrice } = params
  const { baseToken: baseTokenDefault, quoteToken: quoteTokenDefault } = getMarket({
    sellToken,
    receiveToken: buyToken,
  })
  const baseToken = isPriceInverted ? quoteTokenDefault : baseTokenDefault

  const sellTokenLabel = displayTokenSymbolOrLink(sellToken)
  const buyTokenLabel = displayTokenSymbolOrLink(buyToken)
  const surplus = limitPrice && Math.abs(calcPercentage(limitPrice, fillPrice).toNumber())

  const market = `${buyTokenLabel}/${sellTokenLabel}`
  let quoteTokenLabel: React.ReactNode, limitPriceBN: BigNumber | undefined, fillPriceBN: BigNumber
  if (sellToken === baseToken) {
    quoteTokenLabel = buyTokenLabel
    limitPriceBN = limitPrice
    fillPriceBN = fillPrice
  } else {
    quoteTokenLabel = sellTokenLabel
    limitPriceBN = (limitPrice && !limitPrice.isZero() && invertPrice(limitPrice)) || undefined
    fillPriceBN = invertPrice(fillPrice)
  }

  return {
    market,
    quoteTokenLabel,
    sellTokenLabel,
    buyTokenLabel,
    limitPrice: limitPriceBN,
    fillPrice: fillPriceBN,
    surplus,
  }
}

export const TradeRow: React.FC<TradeRowProps> = (params) => {
  const { trade, networkId, onCellClick } = params
  const {
    buyToken,
    sellToken,
    sellAmount,
    buyAmount,
    limitPrice,
    fillPrice,
    orderId,
    batchId,
    timestamp,
    txHash,
    orderSellAmount,
    type,
  } = trade
  const buyTokenDecimals = buyToken.decimals || DEFAULT_PRECISION
  const sellTokenDecimals = sellToken.decimals || DEFAULT_PRECISION
  // Calculate the inverse price - just make sure Limit Price is defined and isn't ZERO
  // don't want none of that divide by zero and destroy the world stuff

  const date = new Date(timestamp)

  const typeColumnTitle = useMemo(() => {
    switch (type) {
      case 'full':
      case 'partial': {
        if (orderSellAmount) {
          const fillPercentage = formatPercentage(divideBN(sellAmount, orderSellAmount))
          const orderAmount = formatSmart({
            amount: orderSellAmount,
            precision: sellTokenDecimals,
          })
          return `${fillPercentage} matched out of ${orderAmount} ${displayTokenSymbolOrLink(sellToken)}`
        }
      }
      // falls through
      case 'liquidity':
      case 'unknown':
      default:
        return ''
    }
  }, [orderSellAmount, sellAmount, sellToken, sellTokenDecimals, type])

  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const {
    market,
    quoteTokenLabel,
    sellTokenLabel,
    buyTokenLabel,
    fillPrice: marketFillPrice,
    limitPrice: marketLimitPrice,
    surplus,
  } = useMemo(
    () =>
      getMarketAndPrices({
        sellToken,
        buyToken,
        isPriceInverted,
        limitPrice,
        fillPrice,
      }),
    [sellToken, buyToken, isPriceInverted, limitPrice, fillPrice],
  )

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <TradeRowFoldableWrapper data-order-id={orderId} data-batch-id={batchId}>
      <td data-label="Market" className="showResponsive">
        <span
          onClick={(): void =>
            onCellClick({
              target: { value: market },
            })
          }
        >
          Swap {sellTokenLabel} for {buyTokenLabel}
        </span>
      </td>
      <td
        data-label="Fill Price"
        title={formatPrice({
          price: marketFillPrice,
          decimals: 8,
        })}
      >
        <SplitHeaderTitle>
          <div>
            {formatPrice({ price: marketFillPrice, decimals: DEFAULT_DECIMALS })} {quoteTokenLabel}
          </div>
          {surplus && surplus > SURPLUS_THRESHOLD && (
            <div className="surplusHighlight">+{surplus.toFixed(2)}% surplus</div>
          )}
        </SplitHeaderTitle>
        <SwapIcon swap={(): void => setIsPriceInverted(!isPriceInverted)} />{' '}
      </td>
      <td
        data-label="Sold"
        className="showResponsive"
        title={`${formatAmountFull({
          amount: sellAmount,
          precision: sellTokenDecimals,
        })}`}
      >
        {formatSmart({ amount: sellAmount, decimals: DEFAULT_DECIMALS, precision: sellTokenDecimals })} {sellTokenLabel}
      </td>
      <td
        data-label="Bought"
        className="showResponsive"
        title={`${formatAmountFull({ amount: buyAmount, precision: buyTokenDecimals })}`}
      >
        {formatSmart({ amount: buyAmount, decimals: DEFAULT_DECIMALS, precision: buyTokenDecimals })} {buyTokenLabel}
      </td>
      <td data-label="Type" title={typeColumnTitle}>
        <TypePill tradeType={type}>{type}</TypePill>
      </td>
      <td data-label="Order ID" onClick={(): void => onCellClick({ target: { value: orderId } })}>
        <EllipsisText title={orderId}>{orderId}</EllipsisText>
      </td>
      <td
        data-label="Limit Price"
        title={marketLimitPrice ? formatPrice({ price: marketLimitPrice, decimals: 8 }) : 'N/A'}
      >
        {marketLimitPrice ? formatPrice({ price: marketLimitPrice, decimals: DEFAULT_DECIMALS }) : 'N/A'}{' '}
        {quoteTokenLabel}
        <SwapIcon swap={(): void => setIsPriceInverted(!isPriceInverted)} />{' '}
      </td>
      <td data-label="Date" className="showResponsive" title={date.toLocaleString()}>
        {formatDistanceStrict(date, new Date(), { addSuffix: true })}
      </td>
      <td data-label="View on Etherscan">
        <BlockExplorerLink type="event" identifier={txHash} networkId={networkId} />
      </td>
    </TradeRowFoldableWrapper>
  )
}
