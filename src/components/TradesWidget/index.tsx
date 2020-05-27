import React from 'react'

import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'

import { TradeRow } from 'components/TradesWidget/TradeRow'

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
            <TradeRow key={trade.id} trade={trade} networkId={networkId} now={now} />
          ))}
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
