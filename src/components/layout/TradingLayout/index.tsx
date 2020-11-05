import React from 'react'
import GlobalStyles from 'styles/globalTrading'
import { Header } from './Header'

export const TradingLayout: React.FC = ({ children }) => (
  <div>
    <GlobalStyles />
    <Header />
    {children}
    <div>Footer</div>
  </div>
)

export default TradingLayout
