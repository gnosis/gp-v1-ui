import React, { useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { formatPrice, formatSmart, formatAmountFull, invertPrice, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'

import { Trade, TradeType } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'

import { isTradeSettled, formatDateFromBatchId } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'
import { ONE_HUNDRED_BIG_NUMBER } from 'const'

interface TradeRowProps {
  trade: Trade
  networkId?: number
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

// TODO: move to dex-js
/**
 * Formats percentage values with 2 decimals of precision.
 * Adds `%` at the end
 * Adds `<` at start when smaller than 0.01
 * Adds `>` at start when greater than 99.99
 *
 * @param percentage Raw percentage value. E.g.: 50% == 0.5
 */
function formatPercentage(percentage: BigNumber): string {
  const displayPercentage = percentage.times(ONE_HUNDRED_BIG_NUMBER)
  let result = ''
  if (!displayPercentage.gte('0.01')) {
    result = '<0.01'
  } else if (displayPercentage.gt('99.99')) {
    result = '>99.99'
  } else {
    result = displayPercentage.decimalPlaces(2, BigNumber.ROUND_FLOOR).toString(10)
  }
  return result + '%'
}

export const TradeRow: React.FC<TradeRowProps> = params => {
  const { trade, networkId } = params
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

  const typeColumnTitle = useMemo(() => {
    switch (type) {
      case 'full':
      case 'partial': {
        if (orderSellAmount) {
          const fillPercentage = formatPercentage(
            new BigNumber(sellAmount.toString()).dividedBy(new BigNumber(orderSellAmount.toString())),
          )
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

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <tr data-order-id={orderId} data-batch-id={batchId}>
      <td data-label="Date" title={new Date(timestamp).toLocaleString()}>
        {formatDateFromBatchId(batchId, { strict: true })}
      </td>
      <td data-label="Trade">
        {displayTokenSymbolOrLink(buyToken)}/{displayTokenSymbolOrLink(sellToken)}
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
        data-label="Amount / Received"
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
      <td data-label="View on Etherscan">
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
