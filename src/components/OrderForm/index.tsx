import React from 'react'
import styled from 'styled-components'

import { TokenPairSelector } from 'components/TokenPairSelector'

const OrderFormStyled = styled.div`
  display: flex;
  background: lightgrey;
  width: 31rem;
  flex-flow: column wrap;
  position: relative;
  height: 100%;
`
export const OrderForm: React.FC = () => (
  <OrderFormStyled>
    <TokenPairSelector />
  </OrderFormStyled>
)

export default OrderForm
