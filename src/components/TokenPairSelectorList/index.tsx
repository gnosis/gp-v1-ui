import React from 'react'
import styled from 'styled-components'

const TokenPairSelectorListStyled = styled.div`
  width: 100%;
  display: none;
  position: absolute;
  top: 0;
  height: 100vh;
  background: yellow;
  left: 0;
`
export const TokenPairSelectorList: React.FC = () => (
  <TokenPairSelectorListStyled>-Token Pair List Element -</TokenPairSelectorListStyled>
)

export default TokenPairSelectorList
