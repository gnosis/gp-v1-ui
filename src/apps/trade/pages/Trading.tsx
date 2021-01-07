import React from 'react'
import styled from 'styled-components'

import OrderForm from 'components/OrderForm'

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);
`

export const Trading: React.FC = () => (
  <Wrapper>
    <OrderForm />
  </Wrapper>
)

export default Trading
