import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatPrice, formatSmart, formatAmountFull, DEFAULT_PRECISION, isOrderUnlimited } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'

import { isTradeFilled, isTradeSettled, formatDateFromBatchId } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'

export function classifyTrade(trade: Trade): string {
  return !trade.remainingAmount ? 'Unknown' : isTradeFilled(trade) ? 'Full' : 'Partial'
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
  min-width: 5.3em;
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
    remainingAmount,
    orderBuyAmount,
    orderSellAmount,
  } = trade
  const buyTokenDecimals = buyToken.decimals || DEFAULT_PRECISION
  const sellTokenDecimals = sellToken.decimals || DEFAULT_PRECISION

  const typeColumnTitle = useMemo(() => {
    if (!orderSellAmount) {
      return ''
    }
    if (orderBuyAmount && isOrderUnlimited(orderSellAmount, orderBuyAmount)) {
      return 'Unlimited order'
    }

    const tradeAmount = formatAmountFull({
      amount: sellAmount,
      precision: sellTokenDecimals,
    })
    const orderAmount = formatAmountFull({
      amount: orderSellAmount,
      precision: sellTokenDecimals,
    })

    return `${tradeAmount} matched out of ${orderAmount}`
  }, [orderBuyAmount, orderSellAmount, sellAmount, sellTokenDecimals])

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <tr data-order-id={orderId} data-batch-id={batchId}>
      <td data-label="Date" title={new Date(timestamp).toLocaleString()}>
        {formatDateFromBatchId(batchId, { strict: true })}
      </td>
      <td>
        {displayTokenSymbolOrLink(buyToken)}/{displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Amount" title={formatAmountFull({ amount: sellAmount, precision: sellTokenDecimals })}>
        {formatSmart({ amount: sellAmount, precision: sellTokenDecimals })} {displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Limit Price" title={limitPrice && formatPrice({ price: limitPrice, decimals: 8 })}>
        {limitPrice ? formatPrice(limitPrice) : 'N/A'}
      </td>
      <td data-label="Fill Price" title={formatPrice({ price: fillPrice, decimals: 8 })}>
        {formatPrice(fillPrice)}
      </td>
      <td data-label="Received" title={formatAmountFull({ amount: buyAmount, precision: buyTokenDecimals })}>
        {formatSmart({ amount: buyAmount, precision: buyTokenDecimals })} {displayTokenSymbolOrLink(buyToken)}
      </td>
      <td data-label="Type" title={typeColumnTitle}>
        <TypePill $bgColor={!remainingAmount ? 'grey' : isTradeFilled(trade) ? 'darkgreen' : 'darkorange'}>
          {classifyTrade(trade)}
        </TypePill>
      </td>
      <td>
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
