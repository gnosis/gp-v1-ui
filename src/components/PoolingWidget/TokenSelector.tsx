import React from 'react'

// assets
import { TokenImgWrapper } from 'components/common/TokenImg'
import checkIcon from 'assets/img/li-check.svg'

// types
import { TokenDetails } from '@gnosis.pm/dex-js'

// PoolingWidget: subcomponent
import { ProgressStepText } from 'components/PoolingWidget/PoolingWidget.styled'
import { TokenSelectorWrapper, TokenBox, CheckboxWrapper } from 'components/PoolingWidget/TokenSelector.styled'

export interface TokenSelectorProps {
  handleTokenSelect: (tokenData: TokenDetails) => void
  selectedTokensMap: Map<number, TokenDetails>
  tokens: TokenDetails[]
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ handleTokenSelect, selectedTokensMap, tokens }) => {
  return (
    <TokenSelectorWrapper>
      {tokens.map((tokenDetails) => {
        const { name, symbol, address, addressMainnet, id } = tokenDetails
        return (
          <TokenBox
            key={address}
            onClick={(): void => handleTokenSelect(tokenDetails)}
            $selected={selectedTokensMap.has(id)}
          >
            <CheckboxWrapper>
              {/* <FontAwesomeIcon icon={faCheckCircle} color="green" /> */}
              <img src={checkIcon} width="20" height="20" />
            </CheckboxWrapper>
            <TokenImgWrapper address={address} addressMainnet={addressMainnet} name={name} symbol={symbol} />
            <div>
              <ProgressStepText>{symbol}</ProgressStepText>
              <ProgressStepText>
                <i>{name}</i>
              </ProgressStepText>
            </div>
          </TokenBox>
        )
      })}
    </TokenSelectorWrapper>
  )
}

export default TokenSelector
