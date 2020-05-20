import React from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'
import { calculatePrice, formatPrice, formatAmountFull } from '@gnosis.pm/dex-js'
import { EtherscanLink } from 'components/EtherscanLink'

const Trades: React.FC = () => {
  const { networkId } = useWalletConnection()
  const trades = useTrades()

  return (
    <ContentPage>
      <CardTable $columns="repeat(6, 1fr)" $rowSeparation="0">
        <thead>
          <tr>
            <th>Limit Price</th>
            <th>Fill Price</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Tx</th>
            <th>Settled</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} data-order-id={trade.orderId} data-trade-id={trade.id}>
              {/* TODO: entries marked with NA are not yet available from the event.
                        Need to enrich event data first */}
              <td>NA</td>
              <td>
                {/* TODO: fix decimals */}
                {/* TODO: add BUY SYMBOL/SELL SYMBOL */}
                {formatPrice(
                  calculatePrice({ numerator: { amount: trade.buyAmount }, denominator: { amount: trade.sellAmount } }),
                )}
              </td>
              {/* TODO: fix decimals */}
              {/* TODO: add SELL SYMBOL */}
              <td>{formatAmountFull(trade.sellAmount)}</td>
              <td>NA</td>
              <td>
                <EtherscanLink type={'tx'} identifier={trade.txHash} networkId={networkId} />
              </td>
              <td>NA</td>
            </tr>
          ))}
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
