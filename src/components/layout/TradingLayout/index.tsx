import React from 'react'
import { Header } from './Header'
import GlobalStyles from './GlobalStyles'
import { Frame } from 'components/common/Frame'

const Footer: React.FC = () => (
  <Frame>
    <footer>Footer</footer>
  </Frame>
)

export const TradingLayout: React.FC = ({ children }) => (
  <div>
    <GlobalStyles />
    <Header />
    {children}
    <Footer />
  </div>
)

export default TradingLayout
