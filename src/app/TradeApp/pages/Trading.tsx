import React from 'react'
import styled from 'styled-components'

// Components
import { OrderForm } from 'components/OrderForm'
import { OrderBookPanel } from 'components/OrderBookPanel'

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);
`

const Trading: React.FC = () => (
  <Wrapper>
    <OrderForm />
    <OrderBookPanel />
  </Wrapper>
)

export default Trading
