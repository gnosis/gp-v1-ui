import React from 'react'
import styled from 'styled-components'

const TokenPairListStyled = styled.div`
  width: 100%;
  display: none;
  position: absolute;
  top: 0;
  height: 100vh;
  background: yellow;
  left: 0;
`
export const TokenPairSelectorList: React.FC = () => (
  <TokenPairListStyled>-Token Pair List Element -</TokenPairListStyled>
)

export default TokenPairSelectorList
