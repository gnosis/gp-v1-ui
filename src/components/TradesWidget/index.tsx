import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, formatSmart } from '@gnosis.pm/dex-js'

import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'
import { EtherscanLink } from 'components/EtherscanLink'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'

import { Trade } from 'api/exchange/ExchangeApi'

import { isTradeFilled } from 'utils'
import { StatusCountdown } from 'components/StatusCountdown'
import { displayTokenSymbolOrLink } from 'utils/display'

function classifyTrade(trade: Trade): string {
  return isTradeFilled(trade) ? 'Full' : 'Partial'
}

const Trades: React.FC = () => {
  const { networkId } = useWalletConnection()
  const trades = useTrades()
  const now = new Date()

  return (
    <ContentPage>
      <CardTable $columns="1fr 1.2fr repeat(2, 0.8fr) 1.2fr 0.7fr 0.8fr 1fr 0.5fr" $rowSeparation="0">
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
          {trades.map(trade => (
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
          ))}
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
