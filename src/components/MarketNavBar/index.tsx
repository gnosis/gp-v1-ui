import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { MarketNavBarStyled as Wrapper } from './MarketNavBar.styled'

const dummyMarketPrice = [370.96, 370.01, 369.3]

const ActivePairInfo = styled.div`
  display: flex;
  > p {
    margin: 0 3.2rem 0 0;
    font-weight: var(--font-weight-bold);
  }

  > p > small {
    font-size: var(--font-size-default);
    font-weight: var(--font-weight-normal);
    color: var(--color-text-secondary2);
    margin: 0 0 0 0.6rem;
  }
`

// Add logic to conditionally pick a green/red color
const PriceTicker = styled.b`
  color: var(--color-green);
`

export const MarketNavBar: React.FC = () => {
  const [marketPrice, setMarketPrice] = useState(dummyMarketPrice[0])

  // Simulate fake mid market price movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrice(dummyMarketPrice[Math.floor(Math.random() * dummyMarketPrice.length)])
    }, 1000)
    return (): void => clearInterval(interval)
  }, [])

  return (
    <Wrapper>
      <ActivePairInfo>
        <p>
          {marketPrice} USDC <small>Mid market price</small>
        </p>
        <p>
          <PriceTicker>+1.32%</PriceTicker> <small>24h price</small>
        </p>
        <p>
          32,4642 ETH <small>24h volume</small>
        </p>
      </ActivePairInfo>
    </Wrapper>
  )
}

export default MarketNavBar
