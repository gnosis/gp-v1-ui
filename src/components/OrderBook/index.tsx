import React from 'react'
import { OrderBookStyled as Wrapper, Header, Book, Orders, Order, Spread } from './OrderBook.styled'

export const OrderBook: React.FC = ({ orders }) => {
  return (
    <Wrapper>
      <Header className="header">
        <span>Price(USD)</span>
        <span>Amount(ETH)</span>
        <span>Total</span>
      </Header>

      <Book>
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

        <Spread className="spread">
          <span>{dummyPrice.last} USD</span>
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
