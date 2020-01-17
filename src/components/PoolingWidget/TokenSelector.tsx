import React from 'react'

import TokenImg from 'components/TokenImg'
import { ProgressStepText } from './PoolingWidget.styled'
import { TokenSelectorWrapper, TokenBox, CheckboxWrapper } from './TokenSelector.styled'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import { TokenDetails } from '@gnosis.pm/dex-js'

export interface TokenSelectorProps {
  handleTokenSelect: (tokenData: TokenDetails) => void
  selectedTokensMap: Map<number, TokenDetails>
  tokens: TokenDetails[]
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ handleTokenSelect, selectedTokensMap, tokens }) => {
  return (
    <TokenSelectorWrapper>
      {tokens.map(tokenDetails => {
        const { name, symbol, address, id, image } = tokenDetails
        return (
          <TokenBox
            key={address}
            onClick={(): void => handleTokenSelect(tokenDetails)}
            $selected={selectedTokensMap.has(id)}
          >
            <CheckboxWrapper>
              <FontAwesomeIcon icon={faCheckCircle} color="green" />
            </CheckboxWrapper>
            <TokenImg alt={name} src={image} />
            <div>
              <ProgressStepText $bold="bold">{symbol}</ProgressStepText>
              <ProgressStepText $bold="bold">{name}</ProgressStepText>
            </div>
          </TokenBox>
        )
      })}
    </TokenSelectorWrapper>
  )
}

export default TokenSelector
