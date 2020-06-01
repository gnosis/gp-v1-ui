import React from 'react'
import styled from 'styled-components'

import { formatPrice, formatSmart, formatAmountFull } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'

import { isTradeFilled, isTradeSettled } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'

export function classifyTrade(trade: Trade): string {
  return isTradeFilled(trade) ? 'Full' : 'Partial'
}

interface TradeRowProps {
  trade: Trade
  networkId?: number
}

const TypePill = styled.span<{
  $bgColor?: string
}>`
  background-color: ${({ $bgColor = 'green' }): string => $bgColor};
  color: white;
  font-weight: bold;
  border-radius: 1em;
  text-align: center;
  text-transform: uppercase;
  padding: 0.5em;
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
  } = trade

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <tr data-order-id={orderId} data-batch-id={batchId}>
      <td>
        {displayTokenSymbolOrLink(buyToken)}/{displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Amount" title={formatAmountFull({ amount: sellAmount, precision: sellToken.decimals as number })}>
        {formatSmart({ amount: sellAmount, precision: sellToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(sellToken)}
      </td>
      <td data-label="Limit Price" title={formatPrice({ price: limitPrice, decimals: 8 })}>
        {formatPrice(limitPrice)}
      </td>
      <td data-label="Fill Price" title={formatPrice({ price: fillPrice, decimals: 8 })}>
        {formatPrice(fillPrice)}
      </td>
      <td data-label="Received" title={formatAmountFull({ amount: buyAmount, precision: buyToken.decimals as number })}>
        {formatSmart({ amount: buyAmount, precision: buyToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(buyToken)}
      </td>
      <td>
        <TypePill $bgColor={isTradeFilled(trade) ? 'darkgreen' : 'darkorange'}>{classifyTrade(trade)}</TypePill>
      </td>
      <td>{new Date(timestamp).toLocaleString()}</td>
      <td>
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
