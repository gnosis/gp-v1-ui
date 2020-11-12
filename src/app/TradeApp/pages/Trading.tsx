import React from 'react'
import styled from 'styled-components'

import { OrderForm } from 'components/OrderForm'

const TradeInterface = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);
`

export const Trading: React.FC = () => (
  <TradeInterface>
    <OrderForm />
  </TradeInterface>
)

export default Trading
