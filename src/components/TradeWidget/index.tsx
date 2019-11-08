import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import useForm, { FormContext } from 'react-hook-form'
import { faExchangeAlt, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router'

import TokenRow from './TokenRow'
import OrderDetails from './OrderDetails'
import Widget from 'components/layout/Widget'

import { useParams } from 'react-router'
import useURLParams from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder } from 'hooks/usePlaceOrder'

import { tokenListApi } from 'api'

import { Network, TokenDetails } from 'types'

import { getToken, safeTokenName, parseAmount } from 'utils'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
`

const WrappedForm = styled.form`
  display: flex;
  flex-direction: column;
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

  &:disabled {
    cursor: not-allowed;
  }
`

const TradeWidget: React.FC = () => {
  const { networkId, isConnected } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, sellAmt, receive: receiveTokenSymbol, receiveAmt } = useParams()

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || getToken('symbol', 'DAI', tokens),
  )
  const [receiveToken, setReceiveToken] = useState(
    () => getToken('symbol', receiveTokenSymbol, tokens) || getToken('symbol', 'USDC', tokens),
  )
  const sellInputId = 'sellToken'
  const receiveInputId = 'receiveToken'

  const methods = useForm({ mode: 'onBlur', defaultValues: { [sellInputId]: sellAmt, [receiveInputId]: receiveAmt } })
  const { handleSubmit, watch, reset } = methods

  // Change URL on internal token change
  useURLParams(`sell=${sellToken.symbol}-${watch(sellInputId)}&receive=${receiveToken.symbol}-${watch(receiveInputId)}`)

  const { balances } = useTokenBalances()

  const sellTokenBalance = useMemo(() => getToken('symbol', sellToken.symbol, balances), [balances, sellToken.symbol])
  const receiveTokenBalance = useMemo(() => getToken('symbol', receiveToken.symbol, balances), [
    balances,
    receiveToken.symbol,
  ])

  const { isSubmitting, placeOrder } = usePlaceOrder()
  const history = useHistory()

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

  async function onSubmit(data: FieldValues): Promise<void> {
    if (isConnected) {
      const success = await placeOrder({
        buyAmount: parseAmount(data[receiveInputId], receiveToken.decimals),
        buyToken: receiveToken,
        sellAmount: parseAmount(data[sellInputId], sellToken.decimals),
        sellToken,
      })
      if (success) {
        // reset form on successful order placing
        reset()
      }
    } else {
      history.push('/connect-wallet')
      // TODO: connect wallet then come back, ideally with the data pre-filled
      // might require David changes to be merged first
      // when redirect back we need:
      // 1. fill the form
      // 2. trigger validation
      // 3. call submit again
      // OR... bypass all that and call this function with given parameters?
      // we'll potentially need a flag from the redirect to indicate whether we are now connected
      //   and should proceed from where we left off
    }
  }

  return (
    <WrappedWidget>
      <FormContext {...methods}>
        <WrappedForm onSubmit={handleSubmit(onSubmit)}>
          {sameToken && <WarningLabel>Tokens cannot be the same!</WarningLabel>}
          <TokenRow
            selectedToken={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="sell"
            onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
          />
          <IconWrapper onClick={swapTokens}>
            <FontAwesomeIcon icon={faExchangeAlt} rotation={90} size="2x" />
          </IconWrapper>
          <TokenRow
            selectedToken={receiveToken}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="receive"
            onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
          />
          <OrderDetails
            sellAmount={watch(sellInputId)}
            sellTokenName={safeTokenName(sellToken)}
            receiveAmount={watch(receiveInputId)}
            receiveTokenName={safeTokenName(receiveToken)}
          />
          <SubmitButton type="submit" disabled={!methods.formState.isValid || isSubmitting}>
            <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPaperPlane} size="lg" spin={isSubmitting} />{' '}
            {sameToken ? 'Please select different tokens' : 'Send limit order'}
          </SubmitButton>
        </WrappedForm>
      </FormContext>
    </WrappedWidget>
  )
}

export default TradeWidget
