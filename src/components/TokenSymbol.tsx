import React from 'react'
import styled from 'styled-components'

import alertIcon from 'assets/img/alert.svg'

interface TokenSymbolProps {
  symbol?: string
  warning?: string
}

const WarningImage = styled.img`
  &&&&& {
    width: 1.2em;
    height: auto;
    margin-left: 1em;
  }
`

const SymbolStyled = styled.strong`
  display: block;
`

export const TokenSymbol: React.FC<TokenSymbolProps> = ({ symbol, warning }) => {
  return (
    <SymbolStyled>
      <span>{symbol}</span>
      {warning && <WarningImage src={alertIcon} title={warning} />}
    </SymbolStyled>
  )
}
