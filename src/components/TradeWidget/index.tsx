import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { faExchangeAlt, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router'

import TokenRow from './TokenRow'
import OrderDetails from './OrderDetails'
import OrderValidity from './OrderValidity'
import Widget from 'components/Layout/Widget'

import { useForm, FormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import useURLParams from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder } from 'hooks/usePlaceOrder'
import { useQuery, buildSearchQuery } from 'hooks/useQuery'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'

import { tokenListApi } from 'api'

import { Network, TokenDetails } from 'types'

import { getToken, safeTokenName, parseAmount } from 'utils'
import { ZERO } from 'const'
import Price, { parseBigNumber } from './Price'

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
  border-radius: var(--border-radius);
  font-weight: bolder;
  margin: 0 auto 0.9375rem;
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

export const enum TradeFormTokenId {
  sellToken = 'sellToken',
  receiveToken = 'receiveToken',
  validUntil = 'validUntil',
  price = 'price',
  priceInverse = 'priceInverse',
}

export type TradeFormData = {
  [K in keyof typeof TradeFormTokenId]: string
}

const DEFAULT_FORM_STATE = {
  sellToken: '0',
  receiveToken: '0',
  validUntil: '0',
}

const TradeWidget: React.FC = () => {
  const { networkId, isConnected, userAddress } = useWalletConnection()
  const [, dispatch] = useGlobalState()

  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])
  const sellInputId = TradeFormTokenId.sellToken
  const receiveInputId = TradeFormTokenId.receiveToken
  const priceInputId = TradeFormTokenId.price
  const priceInverseInputId = TradeFormTokenId.priceInverse
  const validUntilId = TradeFormTokenId.validUntil

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, buy: receiveTokenSymbol } = useParams()
  const { sellAmount, buyAmount: receiveAmount, validUntil } = useQuery()
  // TODO: Get price from query params

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || (getToken('symbol', 'DAI', tokens) as Required<TokenDetails>),
  )
  const [receiveToken, setReceiveToken] = useState(
    () =>
      getToken('symbol', receiveTokenSymbol, tokens) || (getToken('symbol', 'USDC', tokens) as Required<TokenDetails>),
  )
  const [unlimited, setUnlimited] = useState(!validUntil || !Number(validUntil))

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: {
      [sellInputId]: sellAmount,
      [receiveInputId]: receiveAmount,
      [validUntilId]: validUntil,
      [priceInputId]: '',
      [priceInverseInputId]: '',
    },
  })
  const { handleSubmit, watch, reset, setValue } = methods

  const priceValue = watch(priceInputId)
  const priceInverseValue = watch(priceInverseInputId)
  const sellValue = watch(sellInputId)
  const receiveValue = watch(receiveInputId)
  const validUntilValue = watch(validUntilId)

  useEffect(() => {
    let receiveAmount: string | undefined
    if (priceValue && sellValue) {
      const sellAmount = parseBigNumber(sellValue)
      const price = parseBigNumber(priceValue)
      console.log(
        'sellAmount x price',
        sellAmount?.toString(),
        price?.toString(),
        sellAmount && price && sellAmount.multipliedBy(price).toString(),
      )

      if (sellAmount && price) {
        receiveAmount = sellAmount.multipliedBy(price).toString()
      }
    }
    setValue(receiveInputId, receiveAmount || '')
  }, [priceValue, priceInverseValue, setValue, receiveInputId, sellValue])

  const searchQuery = buildSearchQuery({
    sell: sellValue,
    buy: receiveValue,
    expires: validUntilValue,
  })
  const url = `/trade/${sellToken.symbol}-${receiveToken.symbol}?${searchQuery}`
  useURLParams(url, true)

  // TESTING
  const NULL_BALANCE_TOKEN = {
    exchangeBalance: ZERO,
    totalExchangeBalance: ZERO,
    pendingDeposit: { amount: ZERO, batchId: 0 },
    pendingWithdraw: { amount: ZERO, batchId: 0 },
    walletBalance: ZERO,
    claimable: false,
    enabled: false,
    highlighted: false,
    enabling: false,
    claiming: false,
  }

  const { balances } = useTokenBalances()

  const sellTokenBalance = useMemo(
    () => getToken('symbol', sellToken.symbol, balances) || { ...sellToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, sellToken],
  )

  const receiveTokenBalance = useMemo(
    () => getToken('symbol', receiveToken.symbol, balances) || { ...receiveToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, receiveToken],
  )

  const { isSubmitting, placeOrder } = usePlaceOrder()
  const history = useHistory()

  const swapTokens = useCallback((): void => {
    setSellToken(receiveToken)
    setReceiveToken(sellToken)
  }, [receiveToken, sellToken])

  const onSelectChangeFactory = useCallback(
    (
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
    },
    [swapTokens],
  )

  const sameToken = sellToken === receiveToken

  async function onSubmit(data: FieldValues): Promise<void> {
    const buyAmount = parseAmount(data[receiveInputId], receiveToken.decimals)
    const sellAmount = parseAmount(data[sellInputId], sellToken.decimals)
    // Minutes - then divided by 5min for batch length to get validity time
    // 0 validUntil time  = unlimited order
    // TODO: review this line
    const validUntil = +data[validUntilId] / 5
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)

    // Do not let potential null values through
    if (!buyAmount || !sellAmount || !cachedBuyToken || !cachedSellToken || !networkId) return

    if (isConnected && userAddress) {
      let pendingTxHash: string | undefined = undefined
      const { success } = await placeOrder({
        buyAmount,
        buyToken: cachedBuyToken,
        sellAmount,
        sellToken: cachedSellToken,
        validUntil,
        txOptionalParams: {
          onSentTransaction: (txHash: string): void => {
            pendingTxHash = txHash

            const newTxState = {
              txHash,
              id: 'PENDING ORDER',
              buyTokenId: cachedBuyToken.id,
              sellTokenId: cachedSellToken.id,
              priceNumerator: buyAmount,
              priceDenominator: sellAmount,
              user: userAddress,
              remainingAmount: ZERO,
              sellTokenBalance: ZERO,
              validFrom: 0,
              validUntil: 0,
            }

            return dispatch(savePendingOrdersAction({ orders: newTxState, networkId, userAddress }))
          },
        },
      })
      if (success && pendingTxHash) {
        // reset form on successful order placing
        reset(DEFAULT_FORM_STATE)
        setUnlimited(false)
        // remove pending tx
        dispatch(removePendingOrdersAction({ networkId, pendingTxHash, userAddress }))
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
            tabIndex={1}
            readOnly={false}
          />
          <IconWrapper onClick={swapTokens}>
            <FontAwesomeIcon icon={faExchangeAlt} rotation={90} size="2x" />
          </IconWrapper>
          <Price
            priceInputId={priceInputId}
            priceInverseInputId={priceInverseInputId}
            sellToken={sellToken}
            receiveToken={receiveToken}
          />
          <TokenRow
            selectedToken={receiveToken}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="receive"
            onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={2}
            readOnly={true}
          />
          <OrderValidity
            inputId={validUntilId}
            isDisabled={isSubmitting}
            isUnlimited={unlimited}
            setUnlimited={setUnlimited}
            tabIndex={3}
          />
          <OrderDetails
            sellAmount={sellValue}
            sellTokenName={safeTokenName(sellToken)}
            receiveAmount={receiveValue}
            receiveTokenName={safeTokenName(receiveToken)}
            validUntil={validUntilValue}
          />
          <SubmitButton type="submit" disabled={!methods.formState.isValid || isSubmitting} tabIndex={5}>
            <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPaperPlane} size="lg" spin={isSubmitting} />{' '}
            {sameToken ? 'Please select different tokens' : 'Send limit order'}
          </SubmitButton>
        </WrappedForm>
      </FormContext>
    </WrappedWidget>
  )
}

export default TradeWidget
