import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, formatSmart } from '@gnosis.pm/dex-js'
import { EtherscanLink } from 'components/EtherscanLink'

import { Trade } from 'api/exchange/ExchangeApi'

import { isTradeFilled } from 'utils'
import { StatusCountdown } from 'components/StatusCountdown'
import { displayTokenSymbolOrLink } from 'utils/display'

function classifyTrade(trade: Trade): string {
  return isTradeFilled(trade) ? 'Full' : 'Partial'
}

interface TradeRowProps {
  trade: Trade
  networkId?: number
  now: Date
}

export const TradeRow: React.FC<TradeRowProps> = params => {
  const { trade, networkId, now } = params

  return (
    <tr key={trade.id} data-order-id={trade.orderId} data-batch-id={trade.batchId}>
      <td>
        {displayTokenSymbolOrLink(trade.sellToken)}/{displayTokenSymbolOrLink(trade.buyToken)}
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
      <td>
        {/* TODO: refresh component when countdown reaches 0 */}
        {trade.settlingDate > now ? <StatusCountdown timeoutDelta={60} /> : <FontAwesomeIcon icon={faCheck} />}
      </td>
    </tr>
  )
}
