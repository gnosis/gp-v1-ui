import React from 'react'
import styled from 'styled-components'
import Tabs, { TabItemType, TabThemeType } from 'components/common/Tabs/Tabs'
import OrderBook from 'components/OrderBook'
import PairTradeHistory from 'components/PairTradeHistory'
import { OrderBookTradesStyled as Wrapper } from './OrderBookTrades.styled'
import { dummyOrders } from 'components/OrderBook/dummyTradingData'

const tabItems = (orders: OrderBookWidgetsProp['orders']): TabItemType[] => [
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
  activeBg: '--color-transparent',
  inactiveBg: '--color-transparent',
  activeText: '--color-text-primary',
  inactiveText: '--color-text-secondary2',
  activeBorder: '--color-text-primary',
  inactiveBorder: '--color-text-secondary2',
  borderRadius: false,
  fontSize: '--font-size-default',
}

const TabsWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0;

  // Alternatively use a prop for setting a different bg color in the Tabs component
  // eslint-disable-next-line prettier/prettier
  > div > div[role='tablist'] {
    background: var(--color-gradient-2);
    padding: calc(var(--padding-container-default) / 2) var(--padding-container-default)
      var(--padding-container-default);
    justify-content: flex-end;
  }

  > div > div[role='tablist'] > button {
    flex: 0 1 auto;
    padding: 0 0.8rem;
    line-height: 2;
    height: auto;
  }

  > div > div:last-of-type {
    height: calc(100% - 8.4rem);
  }
`

interface OrderBookWidgetsProp {
  readonly orders?: typeof dummyOrders
}

export const OrderBookTradesWidget: React.FC<OrderBookWidgetsProp> = ({ orders }) => (
  <Wrapper>
    <TabsWrapper>
      <Tabs tabItems={tabItems(orders)} theme={tabThemeConfig} />
    </TabsWrapper>
  </Wrapper>
)

export default OrderBookTradesWidget
