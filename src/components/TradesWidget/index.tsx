import React, { useCallback, useMemo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'

import { formatPrice, formatAmount, invertPrice, formatAmountFull } from '@gnosis.pm/dex-js'

import FilterTools from 'components/FilterTools'
import { CardTable } from 'components/layout/SwapLayout/Card'
import { ConnectWalletBanner } from 'components/ConnectWalletBanner'
import { FileDownloaderLink } from 'components/FileDownloaderLink'
import { StandaloneCardWrapper } from 'components/layout'
import { TradeRow } from 'components/TradesWidget/TradeRow'
import { BalancesWidget } from 'components/DepositWidget'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTrades } from 'hooks/useTrades'
import useDataFilter from 'hooks/useDataFilter'

import { Trade } from 'api/exchange/ExchangeApi'

import { toCsv, CsvColumns } from 'utils/csv'
import { filterTradesFn } from 'utils/filter'
import { getNetworkFromId, divideBN } from 'utils'
import { symbolOrAddress } from 'utils/display'

const OverflowContainer = styled(BalancesWidget)`
  > ${CardTable} {
    > thead > tr:not(.cardRowDrawer) {
      padding: 0.8rem 2rem 0.8rem 1.6rem;
    }

    > thead,
    > tbody {
      font-size: 1.3rem;

      > tr:not(.cardRowDrawer) {
        min-height: 4rem;
        text-align: left;
        > td,
        > th {
          justify-content: flex-start;
          text-align: left;
        }
      }
    }
  }
`

const CsvButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 75%;
`

const SplitHeaderTitle = styled.div`
  display: flex;
  flex-flow: column;
`

function csvTransformer(trade: Trade): CsvColumns {
  const {
    buyToken,
    sellToken,
    limitPrice,
    fillPrice,
    sellAmount,
    buyAmount,
    orderSellAmount,
    timestamp,
    txHash,
    eventIndex,
    orderId,
    batchId,
  } = trade

  const limitPriceStr = limitPrice ? formatPrice({ price: invertPrice(limitPrice), decimals: 8 }) : 'N/A'
  const inverseLimitPriceStr = limitPrice ? formatPrice({ price: limitPrice, decimals: 8 }) : 'N/A'
  const fillPriceStr = formatPrice({ price: invertPrice(fillPrice), decimals: 8 })
  const inverseFillPriceStr = formatPrice({ price: fillPrice, decimals: 8 })

  let fillPercentage = 'N/A'
  let totalOrderAmount = 'N/A'
  if (trade.type === 'liquidity') {
    fillPercentage = 'unlimited'
    totalOrderAmount = 'unlimited'
  } else if (orderSellAmount) {
    fillPercentage = divideBN(sellAmount, orderSellAmount).toString(10)
    totalOrderAmount = formatAmountFull({
      amount: orderSellAmount,
      precision: sellToken.decimals,
      thousandSeparator: false,
    })
  }

  // The order of the keys defines csv column order,
  // as well as names and whether to include it or not.
  // We can optionally define an interface for that.
  // I'm opting not to, to avoid duplication and the expectation of ordering,
  // since it's ultimately defined here.
  return {
    Date: new Date(timestamp).toISOString(),
    Market: `${symbolOrAddress(buyToken)}/${symbolOrAddress(sellToken)}`,
    'Buy Token Symbol': buyToken.symbol || '',
    'Buy Token Address': buyToken.address,
    'Sell Token Symbol': sellToken.symbol || '',
    'Sell Token Address': sellToken.address,
    'Limit Price': limitPriceStr,
    'Fill Price': fillPriceStr,
    'Price Unit': symbolOrAddress(sellToken),
    'Inverse Limit Price': inverseLimitPriceStr,
    'Inverse Fill Price': inverseFillPriceStr,
    'Inverse Price Unit': symbolOrAddress(buyToken),
    Sold: formatAmount({
      amount: sellAmount,
      precision: sellToken.decimals as number,
      decimals: sellToken.decimals,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    'Sold Unit': symbolOrAddress(sellToken),
    Bought: formatAmount({
      amount: buyAmount,
      precision: buyToken.decimals as number,
      decimals: sellToken.decimals,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    'Bought Unit': symbolOrAddress(buyToken),
    Type: trade.type || '',
    'Fill %': fillPercentage,
    'Total Order Amount': totalOrderAmount,
    'Total Order Amount Unit': symbolOrAddress(sellToken),
    'Transaction Hash': txHash,
    'Event Log Index': eventIndex.toString(),
    'Order Id': orderId,
    'Batch Id': batchId.toString(),
  }
}

const CSV_FILE_OPTIONS = { type: 'text/csv;charset=utf-8;' }

interface InnerTradesWidgetProps {
  onCellClick: (e: React.ChangeEvent<HTMLInputElement>) => void
  trades: Trade[]
  isTab?: boolean
}

export const InnerTradesWidget: React.FC<InnerTradesWidgetProps> = (props) => {
  const { isTab, trades, onCellClick } = props

  const { networkId, userAddress } = useWalletConnection()

  const generateCsv = useCallback(
    () =>
      toCsv({
        data: trades,
        transformer: csvTransformer,
      }),
    [trades],
  )

  const filename = useMemo(
    () => `trades_${getNetworkFromId(networkId as number).toLowerCase()}_${userAddress}_${new Date().getTime()}.csv`,
    [networkId, userAddress],
  )

  return (
    <CardTable
      $rowSeparation="0"
      $gap="0 0.6rem"
      $columns={`1fr 0.8fr minmax(6.6rem, 1fr) 1.2fr 6.5rem 5.5rem ${isTab ? 'minmax(9.3rem, 0.6fr)' : '0.74fr'}`}
    >
      <thead>
        <tr>
          <th>Date</th>
          <th>Market</th>
          <th>
            <SplitHeaderTitle>
              <span>Limit Price /</span>
              <span>Fill Price</span>
            </SplitHeaderTitle>
          </th>
          <th>
            <SplitHeaderTitle>
              <span>Sold /</span>
              <span>Bought</span>
            </SplitHeaderTitle>
          </th>
          <th>Type</th>
          <th>Order ID</th>
          <th>
            <CsvButtonContainer>
              <span>Tx</span>

              {trades.length > 0 && (
                <FileDownloaderLink data={generateCsv} options={CSV_FILE_OPTIONS} filename={filename}>
                  <FontAwesomeIcon icon={faFileCsv} size="2x" />
                </FileDownloaderLink>
              )}
            </CsvButtonContainer>
          </th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => (
          <TradeRow key={trade.id} trade={trade} networkId={networkId} onCellClick={onCellClick} />
        ))}
      </tbody>
    </CardTable>
  )
}

export const TradesWidget: React.FC = () => {
  const { isConnected } = useWalletConnection()
  const trades = useTrades()

  const {
    filteredData,
    search,
    handlers: { handleSearch },
  } = useDataFilter<Trade>({
    data: trades,
    filterFnFactory: filterTradesFn,
  })

  return !isConnected ? (
    <ConnectWalletBanner />
  ) : (
    <StandaloneCardWrapper>
      <OverflowContainer>
        <FilterTools
          className="widgetFilterTools"
          resultName="trades"
          searchValue={search}
          handleSearch={handleSearch}
          showFilter={!!search}
          dataLength={filteredData.length}
        />
        <InnerTradesWidget trades={filteredData} onCellClick={handleSearch} />
      </OverflowContainer>
    </StandaloneCardWrapper>
  )
}

export default TradesWidget
