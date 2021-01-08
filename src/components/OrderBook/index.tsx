import React, { useEffect, useRef } from 'react'
import { OrderBookStyled as Wrapper, Header, Book, Orders, Order, Spread } from './OrderBook.styled'
import { dummyOrders, dummyPrice } from 'components/OrderBook/dummyTradingData'
interface OrdersType {
  readonly orders?: typeof dummyOrders
}

export const OrderBook: React.FC<OrdersType> = ({ orders }) => {
  const SpreadEl = useRef<HTMLInputElement>(null)
  useEffect(() => {
    SpreadEl.current &&
      SpreadEl.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
  }, [])

  return (
    <Wrapper>
      <Book>
        <Header className="header">
          <span>Price(USDT)</span>
          <span>Amount(WETH)</span>
          <span>Total</span>
        </Header>

        <Orders className="sell">
          {orders &&
            orders.sell.map((order, i) => (
              <Order key={i}>
                <span>{order.p}</span>
                <span>{order.a}</span>
                <span>{order.t}</span>
              </Order>
            ))}
        </Orders>

        <Spread className="spread" ref={SpreadEl}>
          <span>{dummyPrice.last} USDT</span>
          <span>{dummyPrice.spread}%</span>
        </Spread>

        <Orders className="buy">
          {orders &&
            orders.buy.map((order, i) => (
              <Order key={i}>
                <span>{order.p}</span>
                <span>{order.a}</span>
                <span>{order.t}</span>
              </Order>
            ))}
        </Orders>
      </Book>
    </Wrapper>
  )
}

export default OrderBook
