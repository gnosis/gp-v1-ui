import React from 'react'
import styled from 'styled-components'

import { OrderForm } from 'components/OrderForm'

const TradeInterface = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 32rem;
  flex: 1 1 auto;
  height: calc(100vh - var(--height-default-bar));
`

export const Trading: React.FC = () => (
  <TradeInterface>
    <OrderForm />
  </TradeInterface>
)

export default Trading
