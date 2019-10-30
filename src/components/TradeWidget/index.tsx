import React, { useState, useMemo } from 'react'
import styled from 'styled-components'

import Widget from 'components/layout/Widget'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { Network, TokenDetails } from 'types'
import { tokenListApi } from 'api'
import TokenRow from './TokenRow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

function _getToken(symbol: string, tokens: TokenDetails[]): TokenDetails {
  return tokens.find(token => token.symbol == symbol)
}

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
`

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
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet
  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])
  const [sellToken, setSellToken] = useState(() => _getToken('DAI', tokens))
  const [receiveToken, setReceiveToken] = useState(() => _getToken('USDC', tokens))

  const swapTokens = (): void => {
    setSellToken(receiveToken)
    setReceiveToken(sellToken)
  }

  const onSelectChangeFactory = (
    setToken: React.Dispatch<React.SetStateAction<TokenDetails>>,
    oppositeToken: TokenDetails,
  ): ((selected: TokenDetails) => void) => {
    return (selected: TokenDetails): void => {
      if (selected.symbol === oppositeToken.symbol) {
        swapTokens()
      } else {
        setToken(selected)
      }
    }
  }

  return (
    <WrappedWidget>
      <TokenRow
        token={sellToken}
        tokens={tokens}
        selectLabel="sell"
        onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
      />
      <IconWrapper onClick={swapTokens}>
        <FontAwesomeIcon icon={faExchangeAlt} rotation={90} size="2x" />
      </IconWrapper>
      <TokenRow
        token={receiveToken}
        tokens={tokens}
        selectLabel="receive"
        onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
      />
      <SubmitButton>
        <FontAwesomeIcon icon={faPaperPlane} size="lg" /> Send limit order
      </SubmitButton>
    </WrappedWidget>
  )
}

export default TradeWidget
