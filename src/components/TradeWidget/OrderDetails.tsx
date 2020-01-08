import React from 'react'
import styled from 'styled-components'

import { FEE_PERCENTAGE } from 'const'
import Highlight from 'components/Highlight'

const DECIMALS_FOR_PRICE = 4

const Wrapper = styled.dl`
  margin: 2em 0 0 0;
  font-size: 0.8em;

  dd {
    font-weight: bold;
    margin: 0;
  }

  dt {
    margin: 0 0 0.25em 4em;
  }
`

function _calculatePrice(sellAmount: number, receiveAmount: number): number {
  return sellAmount > 0 ? receiveAmount / sellAmount : 0
}

interface Props {
  sellAmount: string
  sellTokenName: string
  receiveAmount: string
  receiveTokenName: string
}

const OrderDetails: React.FC<Props> = ({ sellAmount, sellTokenName, receiveAmount, receiveTokenName }) => {
  const sellAmountNumber = Number(sellAmount)
  const receiveAmountNumber = Number(receiveAmount)

  if (!(sellAmountNumber > 0 && receiveAmountNumber > 0)) {
    return null
  }

  const price = _calculatePrice(sellAmountNumber, receiveAmountNumber).toFixed(DECIMALS_FOR_PRICE)

  return (
    <Wrapper>
      <dd>Order details:</dd>
      <dt>
        Sell up to{' '}
        <Highlight>
          {sellAmount} {sellTokenName}
        </Highlight>{' '}
        at a price{' '}
        <Highlight>
          1 {sellTokenName} = {price} {receiveTokenName}
        </Highlight>{' '}
        or better. <br />
        Your order might be partially filled.
      </dt>

      <dd>Fee:</dd>
      <dt>
        <Highlight>{FEE_PERCENTAGE}%</Highlight>, included already in your limit price.
      </dt>

      <dd>Expiration date:</dd>
      <dt>
        <Highlight>30 min</Highlight>
      </dt>
    </Wrapper>
  )
}

export default OrderDetails
