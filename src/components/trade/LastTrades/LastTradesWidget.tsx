import React from 'react'
import { TokenDetails } from 'types'
import { LastTrades, LastTradesItem } from './LastTrades'

import { useQuery, gql } from '@apollo/client'
import BigNumber from 'bignumber.js'
import { calculatePrice } from '@gnosis.pm/dex-js'

const GET_TRADES = gql`
  query GetTrades {
    trades(first: 10, orderBy: tradeBatchId, orderDirection: desc, where: { revertEpoch: null }) {
      id
      sellVolume
      buyVolume
      tradeEpoch
      sellToken {
        decimals
      }
      buyToken {
        decimals
      }
    }
  }
`

export interface Props {
  quoteToken: TokenDetails
}

function toLastTradeItem(trade: any): LastTradesItem {
  const { id, sellVolume, buyVolume, tradeEpoch, sellToken, buyToken } = trade
  const sellTokenDecimals = +sellToken.decimals
  return {
    id,
    price: calculatePrice({
      denominator: { amount: sellVolume, decimals: sellTokenDecimals },
      numerator: { amount: buyVolume, decimals: +buyToken.decimals },
    }),
    size: new BigNumber(sellVolume).div(new BigNumber(10).pow(18 - sellTokenDecimals)),
    time: new Date(Number(tradeEpoch) * 1000),
  }
}

export const LastTradesWidget: React.FC<Props> = (props) => {
  const { loading, error, data } = useQuery(GET_TRADES)

  const { quoteToken } = props
  const lastTrades: LastTradesItem[] = data ? data.trades.map(toLastTradeItem) : []

  return <LastTrades loading={loading} error={error} quoteToken={quoteToken} trades={lastTrades} />
}
