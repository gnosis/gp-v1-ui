import React, { useEffect, useState } from 'react'
import { PairTradeHistoryStyled as Wrapper, Header, History, Trade } from './PairTradeHistory.styled'
import { dummyTradeHistory } from './dummyTradingData'

export const PairTradeHistory: React.FC = () => {
  const [history, setHistory] = useState([...dummyTradeHistory.shorts, ...dummyTradeHistory.longs])

  // Simulate fake trades
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((history) => {
        return [...history.sort(() => 0.5 - Math.random())]
      })
    }, 1000)
    return (): void => clearInterval(interval)
  }, [])

  return (
    <Wrapper>
      <Header className="header">
        <span>Amount(ETH)</span>
        <span>Price(USD)</span>
        <span>Time</span>
      </Header>

      <History>
        {history &&
          history.map((trade, i) => (
            <Trade key={i}>
              <span>{trade.s}</span>
              <span>{trade.p}</span>
              <span>{trade.t}</span>
            </Trade>
          ))}
      </History>
    </Wrapper>
  )
}

export default PairTradeHistory
