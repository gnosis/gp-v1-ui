import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import OrderForm from 'components/OrderForm'
import MarketNavBar from 'components/MarketNavBar'
import OrderBookTradesWidget from 'components/OrderBookTradesWidget'
import PriceDepthChartWidget from 'components/PriceDepthChartWidget'

import { dummyOrders } from 'components/OrderBook/dummyTradingData'

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - 9.2rem);
  display: grid;
  grid-template-areas: 'orderform marketnavbar marketnavbar' 'orderform orderbook priceDepthChartWidget';
  grid-template-columns:
    [orderform] minmax(15rem, 31rem)
    [orderbook] minmax(15rem, 31rem)
    [marketnavbar] auto
    [priceDepthChartWidget] fit-content(100%);
  grid-template-rows: [marketnavbar] minmax(6.2rem, 6.2rem);
  align-items: start;
`

// type OrdersType = {
//   orders: {
//     buy: {
//       p: number
//       a: number
//       t: number
//     }
//     sell: {
//       p: number
//       a: number
//       t: number
//     }
//   }
// }

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
    </Wrapper>
  )
}

export default Trading
