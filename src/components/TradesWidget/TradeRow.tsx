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

  // Do not display trades that are not settled
  return !isTradeSettled(trade) ? null : (
    <tr key={trade.id} data-order-id={trade.orderId} data-batch-id={trade.batchId}>
      <td>
        {displayTokenSymbolOrLink(trade.buyToken)}/{displayTokenSymbolOrLink(trade.sellToken)}
      </td>
      <td>
        {formatSmart({ amount: trade.sellAmount, precision: trade.sellToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(trade.sellToken)}
      </td>
      <td>{formatPrice(trade.limitPrice)}</td>
      <td>{formatPrice(trade.fillPrice)}</td>
      <td>
        {formatSmart({ amount: trade.buyAmount, precision: trade.buyToken.decimals as number })}{' '}
        {displayTokenSymbolOrLink(trade.buyToken)}
      </td>
      <td>{classifyTrade(trade)}</td>
      <td>{new Date(trade.timestamp).toLocaleString()}</td>
      <td>
        <EtherscanLink type={'event'} identifier={trade.txHash} networkId={networkId} />
      </td>
    </tr>
  )
}
