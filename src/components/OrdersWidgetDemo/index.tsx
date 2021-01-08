import React from 'react'
import Tabs, { TabItemType, TabThemeType } from 'components/common/Tabs/Tabs'
import { OrdersWidgetDemo as Wrapper } from './OrdersWidgetDemo.styled'
import { ActiveOrdersContent } from './ActiveOrdersContent'

const tabItems = (): TabItemType[] => [
  {
    id: 1,
    title: 'Active Orders',
    content: <ActiveOrdersContent />,
    count: 5,
  },
  {
    id: 2,
    title: 'Order History',
    content: <ActiveOrdersContent />,
    count: 10,
  },
  {
    id: 3,
    title: 'Closed Orders',
    content: 'content',
    count: 21,
  },
]

// Provide a custom theme
const tabThemeConfig: TabThemeType = {
  activeBg: '--color-primary',
  activeText: '--color-text-primary',
  inactiveBg: '--color-transparent',
  inactiveText: '--color-text-secondary2',
  fontWeight: '--font-weight-normal',
  fontSize: '--font-size-default',
  letterSpacing: '0.03rem',
}

const OrdersWidgetDemo: React.FC = () => {
  return (
    <Wrapper>
      <Tabs tabItems={tabItems()} theme={tabThemeConfig} />
    </Wrapper>
  )
}

export default OrdersWidgetDemo
