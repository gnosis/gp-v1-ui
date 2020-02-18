import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

// import { FEE_PERCENTAGE } from 'const'
import Highlight from 'components/Highlight'
import { formatPrice, formatValidity } from 'utils'

const Wrapper = styled.dl`
  margin: 2em 0 0 0;
  font-size: 1rem;

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
  validUntil: string
}

const OrderDetails: React.FC<Props> = ({
  sellAmount: sellAmountString,
  sellTokenName,
  receiveAmount: receiveAmountString,
  receiveTokenName,
  validUntil,
}) => {
  const sellAmount = new BigNumber(sellAmountString)
  const receiveAmount = new BigNumber(receiveAmountString)

  const price = formatPrice(receiveAmount, sellAmount)
  const priceInverse = formatPrice(sellAmount, receiveAmount)
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
        at the <strong>following price or better</strong>:
        <Highlight>
          <ul>
            <li>
              1 {sellTokenName} = {price} {receiveTokenName}
            </li>
            <li>
              1 {receiveTokenName} = {priceInverse} {sellTokenName}
            </li>
          </ul>
        </Highlight>{' '}
        Your order may be partially filled
      </dt>

      <dd>Expiration date:</dd>
      <dt>
        <Highlight>{formatValidity(validUntil)}</Highlight>
      </dt>
    </Wrapper>
  )
}

export default OrderDetails
