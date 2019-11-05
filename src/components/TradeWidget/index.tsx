import React, { useState, useMemo } from 'react'
import { faExchangeAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import useForm, { FormContext } from 'react-hook-form'

import { Network, TokenDetails } from 'types'
import { tokenListApi } from 'api'
import { getToken } from 'utils'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import TokenRow from './TokenRow'
import Widget from 'components/layout/Widget'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
`

const WrapperForm = styled.form`
  display: flex;
  flex-direction: column;
`

const IconWrapper = styled.a`
  margin: -0.5em 0 1.5em 1em;
  width: 2em;
`

const SubmitButton = styled.button`
  margin: 2em 0 0 0;
  line-height: 2;

  &:disabled {
    cursor: not-allowed;
  }
`

const TradeWidget: React.FC = () => {
  const { networkId } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])
  const [sellToken, setSellToken] = useState(() => getToken('symbol', 'DAI', tokens))
  const [receiveToken, setReceiveToken] = useState(() => getToken('symbol', 'USDC', tokens))

  const { balances } = useTokenBalances()
  const sellTokenBalance = useMemo(() => getToken('symbol', sellToken.symbol, balances), [balances, sellToken.symbol])
  const receiveTokenBalance = useMemo(() => getToken('symbol', receiveToken.symbol, balances), [
    balances,
    receiveToken.symbol,
  ])

  const methods = useForm({ mode: 'onBlur' })
  const sellTokenId = 'sellToken'
  const receiveTokenId = 'receiveToken'

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
      <FormContext {...methods}>
        <WrapperForm onSubmit={methods.handleSubmit(data => console.log('data', data))}>
          <TokenRow
            token={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="sell"
            onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
            inputId={sellTokenId}
            validateMaxAmount
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
            inputId={receiveTokenId}
          />
          <SubmitButton type="submit" disabled={!methods.formState.isValid}>
            <FontAwesomeIcon icon={faPaperPlane} size="lg" /> Send limit order
          </SubmitButton>
        </WrapperForm>
      </FormContext>
    </WrappedWidget>
  )
}

export default TradeWidget
