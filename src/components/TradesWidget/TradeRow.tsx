import React, { useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUndo } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, formatSmart, formatAmountFull, DEFAULT_PRECISION, isOrderUnlimited } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'

import { isTradeFilled, isTradeSettled, formatDateFromBatchId } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'
import { ONE_HUNDRED_BIG_NUMBER } from 'const'

type TradeType = 'full' | 'partial' | 'liquidity' | 'unknown'

export function classifyTrade(trade: Trade): TradeType {
  const { remainingAmount, orderBuyAmount, orderSellAmount } = trade

  if (!remainingAmount) {
    return 'unknown'
  }
  if (orderBuyAmount && orderSellAmount && isOrderUnlimited(orderBuyAmount, orderSellAmount)) {
    return 'liquidity'
  }
  return isTradeFilled(trade) ? 'full' : 'partial'
}

interface TradeRowProps {
  trade: Trade
  networkId?: number
}

const TypePill = styled.span<{
  tradeType: TradeType
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
  } = trade
  const buyTokenDecimals = buyToken.decimals || DEFAULT_PRECISION
  const sellTokenDecimals = sellToken.decimals || DEFAULT_PRECISION

  const tradeType = useMemo(() => classifyTrade(trade), [trade])

  const typeColumnTitle = useMemo(() => {
    switch (tradeType) {
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
  }, [orderSellAmount, sellAmount, sellToken, sellTokenDecimals, tradeType])

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <tr data-order-id={orderId} data-batch-id={batchId}>
      <td data-label="Date" title={new Date(timestamp).toLocaleString()}>
        {formatDateFromBatchId(batchId, { strict: true })}
      </td>
      <td>
        {displayTokenSymbolOrLink(buyToken)}/{displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Limit Price" title={limitPrice && formatPrice({ price: limitPrice, decimals: 8 })}>
        {limitPrice ? formatPrice(limitPrice) : 'N/A'}
      </td>
      <td data-label="Fill Price" title={formatPrice({ price: fillPrice, decimals: 8 })}>
        {formatPrice(fillPrice)}
      </td>
      <td data-label="Amount" title={formatAmountFull({ amount: sellAmount, precision: sellTokenDecimals })}>
        {formatSmart({ amount: sellAmount, precision: sellTokenDecimals })} {displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Received" title={formatAmountFull({ amount: buyAmount, precision: buyTokenDecimals })}>
        {formatSmart({ amount: buyAmount, precision: buyTokenDecimals })} {displayTokenSymbolOrLink(buyToken)}
      </td>
      <td data-label="Type" title={typeColumnTitle}>
        <TypePill tradeType={tradeType}>{tradeType}</TypePill>
      </td>
      <td>
        {/* TODO: remove icon and filter out reverted trades */}
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />{' '}
        {trade.revertId && (
          <FontAwesomeIcon
            icon={faUndo}
            data-trade-id={trade.id}
            data-revert-id={trade.revertId}
            data-revert-timestamp={trade.revertTimestamp}
            data-sell-token-id={trade.sellTokenId}
            data-buy-token-id={trade.buyTokenId}
            data-order-id={trade.orderId}
          />
        )}
      </td>
    </tr>
  )
}
