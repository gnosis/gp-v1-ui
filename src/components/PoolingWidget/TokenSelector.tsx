import React from 'react'

import styled from 'styled-components'
import TokenImg from 'components/TokenImg'
import { ProgressStepText } from './PoolingWidget.styled'
import { TokenSelectorWrapper, TokenBox, CheckboxWrapper } from './TokenSelector.styled'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import checkIcon from 'assets/img/li-check.svg'

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
              {/* <FontAwesomeIcon icon={faCheckCircle} color="green" /> */}
              <img src={checkIcon} width="20" height="20"/>
            </CheckboxWrapper>
            <TokenImg alt={name} src={image} />
            <div>
              <ProgressStepText $bold="bold">{symbol}</ProgressStepText>
              <ProgressStepText><i>{name}</i></ProgressStepText>
            </div>
          </TokenBox>
        )
      })}
    </TokenSelectorWrapper>
  )
}

export default TokenSelector
