import React from 'react'
import styled from 'styled-components'

import Widget from 'components/layout/Widget'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { Network, TokenDetails } from 'types'
import { tokenListApi } from 'api'
import TokenRow from './TokenRow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

function _getTokenDetails(symbol: string, networkId: number): TokenDetails {
  const _networkId = networkId ? networkId : Network.Mainnet // fallback to mainnet
  return tokenListApi.getTokens(_networkId).find(tokenDetails => tokenDetails.symbol == symbol)
}

const IconWrapper = styled.a`
  margin: -1em 0 1.5em 0.75em;
  width: 2em;
`

const SubmitButton = styled.button`
  margin: 2em 0 0 0;
  line-height: 2;
`

const TradeWidget: React.FC = () => {
  const { networkId } = useWalletConnection()
  const DAI = _getTokenDetails('DAI', networkId)
  const USDC = _getTokenDetails('USDC', networkId)

  return (
    <Widget>
      <TokenRow tokenDetails={DAI} selectLabel="pay with" />
      <IconWrapper>
        <FontAwesomeIcon icon={faExchangeAlt} rotation={90} size="2x" />
      </IconWrapper>
      <TokenRow tokenDetails={USDC} selectLabel="receive" />
      <SubmitButton>
        <FontAwesomeIcon icon={faPaperPlane} size="lg" /> Send limit order
      </SubmitButton>
    </Widget>
  )
}

export default TradeWidget
