import React from 'react'
import styled from 'styled-components'

import { TokenPairSelector } from 'components/TokenPairSelector'

const Wrapper = styled.div`
  display: flex;
  background: none;
  width: 31rem;
  flex-flow: column wrap;
  position: relative;
  height: 100%;
  border-right: 0.1rem solid var(--color-border);
`

export const OrderForm: React.FC = () => (
  <Wrapper>
    <TokenPairSelector selectedPair="ETH/USDC" selectLabel="Select Pair" />
  </Wrapper>
)

export default OrderForm
