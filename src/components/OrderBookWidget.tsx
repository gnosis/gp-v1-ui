import React from 'react'
import styled from 'styled-components'
import { TokenDetails } from 'types'

interface OrderBookProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #757597;
  min-height: 25rem;
  color: white;
  text-align: center;
  font-size: 1.6rem;
  padding: 3rem;
  width: 100%;
`

const OrderBookWidget: React.FC<OrderBookProps> = props => {
  const { baseToken, quoteToken } = props

  return (
    <Wrapper>
      Show order book for token {baseToken.symbol} ({baseToken.id}) and {quoteToken.symbol} ({quoteToken.id})
    </Wrapper>
  )
}

export default OrderBookWidget
