import React from 'react'
import styled from 'styled-components'
import { Frame } from 'components/common/Frame'

const Wrapper = styled.div`
  h2 {
    margin: 20px;
  }

  text-align: center;
`

export const Trading: React.FC = () => (
  <Wrapper>
    <h2>Trading page</h2>
    <Frame>Trade page content</Frame>
  </Wrapper>
)

export default Trading
