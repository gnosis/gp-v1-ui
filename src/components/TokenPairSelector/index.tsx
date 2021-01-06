import React from 'react'

import { TokenPairSelectorStyled as Wrapper } from './tokenPairSelector.styled'
import TokenPairSelectorList from 'components/TokenPairSelectorList'

type selectorProps = {
  selectedPair: string
  selectLabel: string
}

export const TokenPairSelector: React.FC<selectorProps> = ({ selectedPair, selectLabel }) => (
  <Wrapper>
    <button>
      <b>{selectedPair}</b>
      <i>{selectLabel}</i>
      <TokenPairSelectorList />
    </button>
  </Wrapper>
)

export default TokenPairSelector
