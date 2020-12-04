import React from 'react'
import styled from 'styled-components'
import Tabs, { TabItemType, TabThemeType } from 'components/common/Tabs/Tabs'
import OrderBook from 'components/OrderBook'
import PairTradeHistory from 'components/PairTradeHistory'
import { OrderBookTradesStyled as Wrapper } from './OrderBookTrades.styled'

const tabItems = ({ orders }): TabItemType[] => [
  {
    id: 1,
    title: 'Orderbook',
    content: <OrderBook orders={orders} />,
  },
  {
    id: 2,
    title: 'Trades',
    content: <PairTradeHistory />,
  },
]

// Provide a custom theme
const tabThemeConfig: TabThemeType = {
  activeBg: '--color-primary',
  inactiveBg: '--color-gradient-2',
  activeText: '--color-text-primary',
  inactiveText: '--color-text-secondary2',
}

const TabsWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0;

  // Alternatively use a prop for setting a different bg color in the Tabs component
  > div > div[role='tablist'] {
    background: var(--color-gradient-2);
    padding: var(--padding-container-default);
  }

  > div > div[role='tablist'] > button {
    height: 3.2rem;
  }
`

export const OrderBookTradesWidget: React.FC = () => (
  <Wrapper>
    <TabsWrapper>
      <Tabs tabItems={tabItems} theme={tabThemeConfig} />
    </TabsWrapper>
  </Wrapper>
)

export default OrderBookTradesWidget
