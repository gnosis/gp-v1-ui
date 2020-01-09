import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { FEE_PERCENTAGE } from 'const'
import Highlight from 'components/Highlight'
import { formatPrice } from 'utils'

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

interface Props {
  sellAmount: string
  sellTokenName: string
  receiveAmount: string
  receiveTokenName: string
}

const OrderDetails: React.FC<Props> = ({
  sellAmount: sellAmountString,
  sellTokenName,
  receiveAmount: receiveAmountString,
  receiveTokenName,
}) => {
  const sellAmount = new BigNumber(sellAmountString)
  const receiveAmount = new BigNumber(receiveAmountString)

  const price = formatPrice(sellAmount, receiveAmount)
  if (!price) {
    return null
  }

  return (
    <Wrapper>
      <dd>Order details:</dd>
      <dt>
        Sell up to{' '}
        <Highlight>
          {sellAmountString} {sellTokenName}
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
