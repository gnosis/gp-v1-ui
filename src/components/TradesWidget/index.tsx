import React, { useCallback, useMemo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'

import { formatPrice, TokenDetails, formatAmount } from '@gnosis.pm/dex-js'

import { ContentPage } from 'components/Layout/PageWrapper'
import { CardTable } from 'components/Layout/Card'
import { ConnectWalletBanner } from 'components/ConnectWalletBanner'
import { FileDownloaderLink } from 'components/FileDownloaderLink'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'

import { Trade } from 'api/exchange/ExchangeApi'

import { toCsv } from 'utils/csv'

import { TradeRow, classifyTrade } from 'components/TradesWidget/TradeRow'
import { getNetworkFromId, isTradeSettled } from 'utils'

const csvHeaders = [
  'Market',
  'BuyTokenSymbol',
  'BuyTokenAddress',
  'SellTokenSymbol',
  'SellTokenAddress',
  'Limit Price',
  'Fill Price',
  'Amount',
  'Received',
  'Type',
  'Time',
  'TransactionHash',
  'EventLogIndex',
  'OrderId',
  'BatchId',
]

function symbolOrAddress(token: TokenDetails): string {
  return token.symbol || token.address
}

function csvTransformer(trade: Trade): string[] {
  const {
    buyToken,
    sellToken,
    limitPrice,
    fillPrice,
    sellAmount,
    buyAmount,
    timestamp,
    txHash,
    eventIndex,
    orderId,
    batchId,
  } = trade

  return [
    `${symbolOrAddress(buyToken)}/${symbolOrAddress(sellToken)}`,
    buyToken.symbol || '',
    buyToken.address,
    sellToken.symbol || '',
    sellToken.address,
    formatPrice(limitPrice),
    formatPrice(fillPrice),
    formatAmount({
      amount: sellAmount,
      precision: sellToken.decimals as number,
      decimals: sellToken.decimals,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    formatAmount({
      amount: buyAmount,
      precision: buyToken.decimals as number,
      decimals: sellToken.decimals,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    classifyTrade(trade),
    new Date(timestamp).toISOString(),
    txHash,
    eventIndex.toString(),
    orderId,
    batchId.toString(),
  ]
}

const Trades: React.FC = () => {
  const { networkId, userAddress, isConnected } = useWalletConnection()
  const trades = useTrades()

  const generateCsv = useCallback(
    () =>
      toCsv({
        headers: csvHeaders,
        data: trades.filter(isTradeSettled),
        transformer: csvTransformer,
      }),
    [trades],
  )

  const filename = useMemo(
    () => `trades_${getNetworkFromId(networkId as number).toLowerCase()}_${userAddress}_${new Date().getTime()}.csv`,
    [networkId, userAddress],
  )

  return !isConnected ? (
    <ConnectWalletBanner />
  ) : (
    <ContentPage>
      {trades.length > 0 && (
        <FileDownloaderLink data={generateCsv} options={{ type: 'text/csv;charset=utf-8;' }} filename={filename}>
          <FontAwesomeIcon icon={faFileCsv} size="2x" />
        </FileDownloaderLink>
      )}
      <CardTable $columns="1fr 1.2fr repeat(2, 0.8fr) 1.2fr 0.7fr 0.8fr 1fr" $rowSeparation="0">
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
