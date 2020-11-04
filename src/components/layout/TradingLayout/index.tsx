import React from 'react'
import { Frame } from 'components/common/Frame'
import { Header } from './Header'

export const TradingLayout: React.FC = ({ children }) => (
  <div>
    <Header label="My Header" />
    <Frame>{children}</Frame>
    <Frame>My Footer</Frame>
  </div>
)

export default TradingLayout
