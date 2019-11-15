import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import useForm, { FormContext } from 'react-hook-form'
import { faExchangeAlt, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory, useLocation } from 'react-router'

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

import { getToken, safeTokenName, parseAmount, formatAmountFull } from 'utils'

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

// This is sort of a duplication from the validation done on TokenRow.
// Still, required because the initial value comes from the URL params,
//   and we have no control over what the user inserts there.
// Thus, we make it a nicely formated value, or 0 if we can't
// And only on first render. Subsequent validation is taken care by TokenRow.
function sanitizeInputAmount(value: string, precision: number): string {
  const number = parseAmount(value, precision)
  if (!number) {
    return '0'
  }
  return formatAmountFull(number, precision, false)
}

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search)
}

const TradeWidget: React.FC = () => {
  const { networkId, isConnected } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, buy: receiveTokenSymbol } = useParams()
  const query = useQuery()
  const sellAmount = query.get('sell')
  const receiveAmount = query.get('buy')

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || getToken('symbol', 'DAI', tokens),
  )
  const [receiveToken, setReceiveToken] = useState(
    () => getToken('symbol', receiveTokenSymbol, tokens) || getToken('symbol', 'USDC', tokens),
  )
  const sellInputId = 'sellToken'
  const receiveInputId = 'receiveToken'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sanitizedSellAmount = useMemo(() => sanitizeInputAmount(sellAmount, sellToken.decimals), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sanitizedReceiveAmount = useMemo(() => sanitizeInputAmount(receiveAmount, receiveToken.decimals), [])

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      [sellInputId]: sanitizedSellAmount,
      [receiveInputId]: sanitizedReceiveAmount,
    },
  })
  const { handleSubmit, watch, reset } = methods

  const urlParams = new URLSearchParams({ sell: watch(sellInputId), buy: watch(receiveInputId) })
  const url = `/trade/${sellToken.symbol}-${receiveToken.symbol}?${urlParams.toString()}`
  useURLParams(url)

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
      const from = history.location.pathname + history.location.search
      history.push('/connect-wallet', { from })
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
