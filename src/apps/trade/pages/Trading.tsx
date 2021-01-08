import React, { useState, useEffect } from 'react'

import { TradingStyled as Wrapper } from './Trading.styled'
import OrderForm from 'components/OrderForm'
import MarketNavBar from 'components/MarketNavBar'
import OrderBookTradesWidget from 'components/OrderBookTradesWidget'
import PriceDepthChartWidget from 'components/PriceDepthChartWidget'
import OrdersWidgetDemo from 'components/OrdersWidgetDemo'

// Dummy data
import { dummyOrders } from 'components/OrderBook/dummyTradingData'

export const Trading: React.FC = () => {
  // Simulate fake orders
  const [orders, setOrders] = useState(dummyOrders)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((orders) => ({
        buy: orders.buy.sort(() => Math.random() - 1),
        sell: orders.sell.sort(() => Math.random() - 0.5),
      }))
    }, 1000)
    return (): void => clearInterval(interval)
  }, [])

  return (
    <Wrapper>
      <OrderForm />
      <MarketNavBar />
      <OrderBookTradesWidget orders={orders} />
      <PriceDepthChartWidget />
      <OrdersWidgetDemo />
    </Wrapper>
  )
}

export default Trading
