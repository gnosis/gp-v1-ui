import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, formatAmount } from '@gnosis.pm/dex-js'

import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'
import { EtherscanLink } from 'components/EtherscanLink'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'

import { Trade } from 'api/exchange/ExchangeApi'

import { isTradeFilled } from 'utils'
import { StatusCountdown } from 'components/StatusCountdown'

function classifyTrade(trade: Trade): string {
  return isTradeFilled(trade) ? 'Full' : 'Partial'
}

const Trades: React.FC = () => {
  const { networkId } = useWalletConnection()
  const trades = useTrades()
  const now = new Date()

  return (
    <ContentPage>
      <CardTable $columns="repeat(9, 1fr)" $rowSeparation="0">
        <thead>
          <tr>
            <th>Market</th>
            <th>Amount</th>
            <th>Limit Price</th>
            <th>Fill Price</th>
            <th>Received</th>
            <th>Type</th>
            <th>Time</th>
            <th>Tx</th>
            <th>Settled</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} data-order-id={trade.orderId} data-batch-id={trade.batchId}>
              <td>
                {trade.sellToken.symbol}/{trade.buyToken.symbol}
              </td>
              <td>
                {formatAmount({ amount: trade.sellAmount, precision: trade.sellToken.decimals as number })}{' '}
                {trade.sellToken.symbol}
              </td>
              <td>{formatPrice(trade.limitPrice)}</td>
              <td>{formatPrice(trade.fillPrice)}</td>
              <td>
                {formatAmount({ amount: trade.buyAmount, precision: trade.buyToken.decimals as number })}{' '}
                {trade.buyToken.symbol}
              </td>
              <td>{classifyTrade(trade)}</td>
              <td>{new Date(trade.timestamp).toISOString()}</td>
              <td>
                <EtherscanLink type={'event'} identifier={trade.txHash} networkId={networkId} />
              </td>
              <td>
                {trade.settlingDate > now ? <StatusCountdown timeoutDelta={60} /> : <FontAwesomeIcon icon={faCheck} />}
              </td>
            </tr>
          ))}
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
