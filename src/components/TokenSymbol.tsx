import React from 'react'
import styled from 'styled-components'

import alertIcon from 'assets/img/alert.svg'

interface TokenSymbolProps {
  symbol?: string
  warning?: string
  warningUrl?: string
}

interface WarningProps {
  title: string
  url?: string
}

const WarningImage = styled.img`
  &&&&& {
    width: 1em;
    height: auto;
    margin-left: 0.4em;
  }
`

const Warning: React.FC<WarningProps> = ({ title, url }) => {
  const img = <WarningImage src={alertIcon} title={title} />
  if (!url) return img

  return (
    <a href={url} rel="noopener noreferrer" target="_blank">
      {img}
    </a>
  )
}

const SymbolStyled = styled.strong`
  display: block;
`

export const TokenSymbol: React.FC<TokenSymbolProps> = ({ symbol, warning, warningUrl }) => {
  return (
    <SymbolStyled>
      <span>{symbol}</span>
      {warning && <Warning title={warning} url={warningUrl} />}
    </SymbolStyled>
  )
}
