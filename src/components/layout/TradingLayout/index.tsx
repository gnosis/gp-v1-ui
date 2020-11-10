import React from 'react'
import GlobalStyles from 'styles/v2/global'
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
