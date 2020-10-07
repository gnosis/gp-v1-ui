import React from 'react'
import { Frame } from 'components/common/Frame'

export const TradingLayout: React.FC = ({ children }) => (
  <div>
    <Frame>Header</Frame>
    <Frame>{children}</Frame>
    <Frame>Footer</Frame>
  </div>
)

export default TradingLayout
