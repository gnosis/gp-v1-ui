import React from 'react'
import BigNumber from 'bignumber.js'
import { TokenDetails } from 'types'
import styled from 'styled-components'

const Wrapper = styled.div``

export interface Props {
  quoteToken: TokenDetails
  trades: LastTradesItem[]
}

export interface LastTradesItem {
  id: string
  size: BigNumber
  price: BigNumber
  time: Date
}

export const LastTrades: React.FC<Props> = (props) => {
  const { trades } = props

  const lastTrades = trades.map((trade) => {
    const { id, size, price, time } = trade
    return (
      <div key={id}>
        {size.toFixed(4)} - {price.toFixed(4)} - {time.toLocaleDateString()}
      </div>
    )
  })

  return (
    <Wrapper>
      {lastTrades.length === 0 ? (
        <div>No items</div>
      ) : (
        <>
          <h4>SIZE - PRICE - TIME</h4>
          <hr />
          <div>{lastTrades}</div>
        </>
      )}
    </Wrapper>
  )
}
