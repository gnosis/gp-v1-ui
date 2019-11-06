import React from 'react'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

import { TokenDetails } from 'types'
import { FEE_PERCENTAGE } from 'const'

const Wrapper = styled.dl`
  margin: 2em 0 0 0;
  font-size: 0.8em;
`

const Dd = styled.dd`
  font-weight: bold;
  margin: 0;
`

const Dt = styled.dt`
  margin: 0 0 0.25em 4em;
`

const Highlight = styled.span`
  font-weight: bold;
  color: #367be0;
`

// TODO: move to utils?
function calculatePrice(sellAmount: number, receiveAmount: number): number {
  return sellAmount > 0 ? receiveAmount / sellAmount : 0
}

interface Props {
  sellTokenId: string
  sellToken: TokenDetails
  receiveTokenId: string
  receiveToken: TokenDetails
}

const OrderDetails: React.FC<Props> = ({ sellTokenId, sellToken, receiveTokenId, receiveToken }) => {
  const { watch } = useFormContext()

  const sellAmount = Number(watch(sellTokenId))
  const receiveAmount = Number(watch(receiveTokenId))

  if (!(sellAmount > 0 && receiveAmount > 0)) {
    return null
  }

  function _calculatePrice(): string {
    return calculatePrice(sellAmount, receiveAmount).toFixed(2)
  }

  return (
    <Wrapper>
      <Dd>Order details:</Dd>
      <Dt>
        Sell up to{' '}
        <Highlight>
          {watch(sellTokenId)} {sellToken.symbol}
        </Highlight>{' '}
        at a price{' '}
        <Highlight>
          1 {sellToken.symbol} = {_calculatePrice()} {receiveToken.symbol}
        </Highlight>{' '}
        or better. <br />
        Your order might be partially filled.
      </Dt>

      <Dd>Fee:</Dd>
      <Dt>
        <Highlight>{FEE_PERCENTAGE}%</Highlight>, included already in your limit price.
      </Dt>

      <Dd>Expiration date:</Dd>
      <Dt>
        <Highlight>30 min</Highlight>
      </Dt>
    </Wrapper>
  )
}

export default OrderDetails
