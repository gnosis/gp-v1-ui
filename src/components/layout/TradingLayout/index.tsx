import React from 'react'
import styled from 'styled-components'
import { Frame } from 'components/common/Frame'

const Wrapper = styled.div``

export const TradingLayout: React.FC = ({ children }) => (
  <Wrapper>
    <Frame>Header</Frame>
    <Frame>{children}</Frame>
    <Frame>Footer</Frame>
  </Wrapper>
)

export default TradingLayout
