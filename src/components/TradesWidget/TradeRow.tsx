import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatPrice, formatSmart, formatAmountFull, DEFAULT_PRECISION, isOrderUnlimited } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'

import { isTradeFilled, isTradeSettled, formatDateFromBatchId } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'

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
  $bgColor?: string
}>`
  background-color: ${({ $bgColor = 'green' }): string => $bgColor};
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

  const [typeColumnTitle, tradeTypePillColor] = useMemo(() => {
    let title = ''
    let color = 'grey'

    let tradeAmount, orderAmount
    if (orderSellAmount) {
      tradeAmount = formatAmountFull({
        amount: sellAmount,
        precision: sellTokenDecimals,
      })
      orderAmount = formatAmountFull({
        amount: orderSellAmount,
        precision: sellTokenDecimals,
      })
    }

    switch (tradeType) {
      case 'full':
        title = `${tradeAmount} matched out of ${orderAmount}`
        color = 'darkgreen'
        break
      case 'partial': {
        title = `${tradeAmount} matched out of ${orderAmount}`
        color = 'darkorange'
        break
      }
      case 'liquidity':
        color = 'blueviolet'
        break
      case 'unknown':
        color = 'grey'
        break
      default:
        title = ''
    }
    return [title, color]
  }, [orderSellAmount, sellAmount, sellTokenDecimals, tradeType])

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
        <TypePill $bgColor={tradeTypePillColor}>{tradeType}</TypePill>
      </td>
      <td>
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
