import React from 'react'
import OrdersWidget from 'components/OrdersWidget'
import { PageWrapper } from 'components/layout/PageWrapper'

const Orders: React.FC = () => (
  <PageWrapper>
    <OrdersWidget displayOnly="regular" />
  </PageWrapper>
)

export default Orders
