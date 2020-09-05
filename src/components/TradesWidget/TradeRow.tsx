import React, { useMemo } from 'react'
import styled from 'styled-components'
import { formatDistanceStrict } from 'date-fns'

import { formatPrice, formatSmart, formatAmountFull, invertPrice, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'

import { Trade, TradeType } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/atoms/EtherscanLink'
import { FoldableRowWrapper } from 'components/Layout/Card'

import { isTradeSettled, divideBN, formatPercentage } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'
import { MEDIA } from 'const'
import { EllipsisText } from 'components/Layout'

const TradeRowFoldableWrapper = styled(FoldableRowWrapper)`
  td {
    &[data-label='Order ID'],
    &[data-label='Market'] {
      cursor: pointer;
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
  const invertedLimitPrice = limitPrice && !limitPrice.isZero() && invertPrice(limitPrice)
  const invertedFillPrice = invertPrice(fillPrice)

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
      case 'liquidity':
      case 'unknown':
      default:
        return ''
    }
  }, [orderSellAmount, sellAmount, sellToken, sellTokenDecimals, type])

  const market = useMemo(() => `${displayTokenSymbolOrLink(buyToken)}/${displayTokenSymbolOrLink(sellToken)}`, [
    buyToken,
    sellToken,
  ])

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <TradeRowFoldableWrapper data-order-id={orderId} data-batch-id={batchId}>
      <td data-label="Date" className="showResponsive" title={date.toLocaleString()}>
        {formatDistanceStrict(date, new Date(), { addSuffix: true })}
      </td>
      <td
        data-label="Market"
        className="showResponsive"
        onClick={(): void =>
          onCellClick({
            target: { value: market },
          })
        }
      >
        {market}
      </td>
      <td
        data-label="Limit Price / Fill Price"
        title={`${invertedLimitPrice ? formatPrice({ price: invertedLimitPrice, decimals: 8 }) : 'N/A'} / ${formatPrice(
          {
            price: invertedFillPrice,
            decimals: 8,
          },
        )}`}
      >
        {invertedLimitPrice ? formatPrice(invertedLimitPrice) : 'N/A'}
        <br />
        {formatPrice(invertedFillPrice)}
      </td>
      <td
        data-label="Sold / Bought"
        className="showResponsive"
        title={`${formatAmountFull({
          amount: sellAmount,
          precision: sellTokenDecimals,
        })} / ${formatAmountFull({ amount: buyAmount, precision: buyTokenDecimals })}`}
      >
        {formatSmart({ amount: sellAmount, precision: sellTokenDecimals })} {displayTokenSymbolOrLink(sellToken)}
        <br />
        {formatSmart({ amount: buyAmount, precision: buyTokenDecimals })} {displayTokenSymbolOrLink(buyToken)}
      </td>
      <td data-label="Type" title={typeColumnTitle}>
        <TypePill tradeType={type}>{type}</TypePill>
      </td>
      <td data-label="Order ID" onClick={(): void => onCellClick({ target: { value: orderId } })}>
        <EllipsisText title={orderId}>{orderId}</EllipsisText>
      </td>
      <td data-label="View on Etherscan">
        <EtherscanLink type="event" identifier={txHash} networkId={networkId} />
      </td>
    </TradeRowFoldableWrapper>
  )
}
