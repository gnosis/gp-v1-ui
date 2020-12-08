import React from 'react'
import styled from 'styled-components'

import TokenPairSelector from 'components/TokenPairSelector'
import OrderBuySell from 'components/OrderBuySell'

const Wrapper = styled.div`
  display: flex;
  background: none;
  /* width: 31rem; */
  width: 100%;
  flex-flow: column wrap;
  position: relative;
  height: 100%;
  border-right: 0.1rem solid var(--color-border);
  grid-area: orderform;
`

const OrderForm: React.FC = () => (
  <Wrapper>
    <TokenPairSelector selectedPair="WETH/USDT" selectLabel="Select Pair" />
    <OrderBuySell />
  </Wrapper>
)

export default OrderForm
