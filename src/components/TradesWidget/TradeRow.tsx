import React from 'react'

import { formatPrice, formatSmart } from '@gnosis.pm/dex-js'

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
      <td>
        {formatSmart({ amount: sellAmount, precision: sellToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(sellToken)}
      </td>
      <td>{formatPrice(limitPrice)}</td>
      <td>{formatPrice(fillPrice)}</td>
      <td>
        {formatSmart({ amount: buyAmount, precision: buyToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(buyToken)}
      </td>
      <td>{classifyTrade(trade)}</td>
      <td>{new Date(timestamp).toLocaleString()}</td>
      <td>
        <EtherscanLink type={'event'} identifier={txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
