import React from 'react'
import BigNumber from 'bignumber.js'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { formatPrice } from '@gnosis.pm/dex-js'
import Spinner from 'components/common/Spinner'
import ErrorMsg from 'components/ErrorMsg'
import { formatDateLocaleShortTime } from 'utils'

const Wrapper = styled.div`
  li {
    padding: 0.5rem;
  }
`

export interface Props {
  quoteToken: TokenDetails
  trades: LastTradesItem[]
  error?: Error
  loading: boolean
}

export interface LastTradesItem {
  id: string
  size: BigNumber
  price: BigNumber
  time: Date
}

export const LastTrades: React.FC<Props> = (props) => {
  const { loading, error, trades } = props
  const lastTrades = trades.map((trade) => {
    const { id, size, price, time } = trade
    return (
      <li key={id}>
        {formatPrice(size)} - {formatPrice(price)} - {formatDateLocaleShortTime(time.getTime())}
      </li>
    )
  })

  if (loading) {
    return (
      <Wrapper>
        <Spinner /> Loading trades
      </Wrapper>
    )
  }

  if (error) {
    return (
      <Wrapper>
        <ErrorMsg message={'Error loading the trades: ' + error.message} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {lastTrades.length === 0 ? (
        <div>No items</div>
      ) : (
        <>
          <h4>SIZE - PRICE - TIME</h4>
          <hr />
          <ul>{lastTrades}</ul>
        </>
      )}
    </Wrapper>
  )
}
