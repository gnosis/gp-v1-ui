import React, { useMemo } from 'react'

import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'

import { TradeRow, classifyTrade } from 'components/TradesWidget/TradeRow'

import { formatPrice, formatSmart } from '@gnosis.pm/dex-js'

import { Trade } from 'api/exchange/ExchangeApi'

import { displayTokenSymbolOrLink } from 'utils/display'
import { FileDownloaderLink } from 'components/FileDownloaderLink'

const formatTradeAsCSV = (trade: Trade, now: Date): string => {
  return [
    displayTokenSymbolOrLink(trade.sellToken) + '/' + displayTokenSymbolOrLink(trade.buyToken),
    formatSmart({ amount: trade.sellAmount, precision: trade.sellToken.decimals as number }) +
      ' ' +
      displayTokenSymbolOrLink(trade.sellToken),
    formatPrice(trade.limitPrice),
    formatPrice(trade.fillPrice),
    formatSmart({ amount: trade.buyAmount, precision: trade.buyToken.decimals as number }) +
      ' ' +
      displayTokenSymbolOrLink(trade.buyToken),
    classifyTrade(trade),
    new Date(trade.timestamp).toLocaleString(),
    trade.txHash,
    trade.settlingDate > now ? 'NOT SETTLED' : 'SETTLED',
  ]
    .map(value => {
      // " is a string delimeter
      // if already included in e.g. symbol
      // must be replaced by double ""
      value = value.replace(/"/g, '""')

      // if there's a field delimeter comma in e.g. symbol or date
      // need to enclose whole string in quotes
      if (value.includes(',')) value = `"${value}"`
      return value
    })
    .join(',')
}

const tableHeads = ['Market', 'Amount', 'Limit Price', 'Fill Price', 'Received', 'Type', 'Time', 'Tx', 'Settled']
const tableHeader = tableHeads.join(',') + '\n'

const Trades: React.FC = () => {
  const { networkId } = useWalletConnection()
  const trades = useTrades()

  const csvString = useMemo(() => {
    const now = new Date()
    return tableHeader + trades.map(trade => formatTradeAsCSV(trade, now)).join('\n')
  }, [trades])

  return (
    <ContentPage>
      {trades.length > 0 && <FileDownloaderLink data={csvString} options={{ type: 'text/csv;charset=utf-8;' }} />}
      <CardTable $columns="1fr 1.2fr repeat(2, 0.8fr) 1.2fr 0.7fr 0.8fr 1fr 0.5fr" $rowSeparation="0">
        <thead>
          <tr>
            {tableHeads.map(head => (
              <th key={head}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map(trade => (
            <TradeRow key={trade.id} trade={trade} networkId={networkId} />
          ))}
        </tbody>
      </CardTable>
    </ContentPage>
  )
}

export default Trades
