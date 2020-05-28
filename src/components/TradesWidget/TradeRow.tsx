import React, { useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, formatSmart } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { EtherscanLink } from 'components/EtherscanLink'
import { StatusCountdown } from 'components/StatusCountdown'

import { isTradeFilled } from 'utils'
import { displayTokenSymbolOrLink } from 'utils/display'

import useSafeState from 'hooks/useSafeState'

export function classifyTrade(trade: Trade): string {
  return isTradeFilled(trade) ? 'Full' : 'Partial'
}

interface TradeRowProps {
  trade: Trade
  networkId?: number
}

export const TradeRow: React.FC<TradeRowProps> = params => {
  const { trade, networkId } = params

  const now = new Date()

  // Dima's trick to force component update
  const [, forceUpdate] = useSafeState({})

  const refreshTimeout = useRef<null | NodeJS.Timeout>(null)

  // Refresh component when countdown reaches 0, if any
  useEffect(() => {
    function clear(): void {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current)
      refreshTimeout.current = null
    }

    clear()

    if (trade.settlingDate > now) {
      const timeout = trade.settlingDate.getTime() - now.getTime()
      refreshTimeout.current = setTimeout(() => forceUpdate({}), timeout)
    }

    return clear
  }, [forceUpdate, now, trade.settlingDate])

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
      <td>{trade.settlingDate > now ? <StatusCountdown timeoutDelta={60} /> : <FontAwesomeIcon icon={faCheck} />}</td>
    </tr>
  )
}
