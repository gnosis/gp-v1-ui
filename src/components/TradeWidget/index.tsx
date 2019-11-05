import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import TokenRow from './TokenRow'
import Widget from 'components/layout/Widget'

import useURLParams, { useLocation } from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { tokenListApi } from 'api'

import { Network, TokenDetails } from 'types'

import { getToken } from 'utils'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
`

const IconWrapper = styled.a`
  margin: -0.5em 0 1.5em 1em;
  width: 2em;
`

const WarningLabel = styled.code`
  background: #ffa8a8;
  border-radius: 25;
  font-weight: 800;
  margin: 0 auto 15px;
  padding: 6;
  text-align: center;
  width: 75%;
`

const SubmitButton = styled.button`
  margin: 2em 0 0 0;
  line-height: 2;
`

const TradeWidget: React.FC = () => {
  const { networkId } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])

  // Listen on manual changes to URL search query
  const urlSeachQuery = useLocation()

  const sellTokenSymbol = urlSeachQuery.get('sell') || 'DAI'
  const receiveTokenSymbol = urlSeachQuery.get('receive') || 'USDC'

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || getToken('symbol', 'DAI', tokens),
  )
  const [receiveToken, setReceiveToken] = useState(
    () => getToken('symbol', receiveTokenSymbol, tokens) || getToken('symbol', 'USDC', tokens),
  )

  // Change URL on internal token change
  useURLParams(`sell=${sellToken.symbol}&receive=${receiveToken.symbol}`)

  const { balances } = useTokenBalances()

  const sellTokenBalance = useMemo(() => getToken('symbol', sellToken.symbol, balances), [balances, sellToken.symbol])
  const receiveTokenBalance = useMemo(() => getToken('symbol', receiveToken.symbol, balances), [
    balances,
    receiveToken.symbol,
  ])

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

  let sameToken = sellToken === receiveToken

  return (
    <WrappedWidget>
      {sameToken && <WarningLabel>Tokens cannot be the same!</WarningLabel>}
      <TokenRow
        token={sellToken}
        tokens={tokens}
        balance={sellTokenBalance}
        selectLabel="sell"
        onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
      />
      <IconWrapper onClick={swapTokens}>
        <FontAwesomeIcon icon={faExchangeAlt} rotation={90} size="2x" />
      </IconWrapper>
      <TokenRow
        token={receiveToken}
        tokens={tokens}
        balance={receiveTokenBalance}
        selectLabel="receive"
        onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
      />
      <SubmitButton disabled={sameToken} style={{ cursor: sameToken ? 'default' : 'pointer' }}>
        <FontAwesomeIcon icon={faPaperPlane} size="lg" />{' '}
        {sameToken ? 'Please select different tokens' : 'Send limit order'}
      </SubmitButton>
    </WrappedWidget>
  )
}

export default TradeWidget
