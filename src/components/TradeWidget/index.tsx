import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { faExchangeAlt, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import switchTokenPair from 'assets/img/switch.svg'
import arrow from 'assets/img/arrow.svg'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router'

import TokenRow from './TokenRow'
import OrderDetails from './OrderDetails'
import Widget from 'components/Layout/Widget'
import OrdersWidget from 'components/OrdersWidget'

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

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
  max-height: 54rem;
`

const WrappedForm = styled.form`
  display: flex;
  flex-flow: column wrap;
  width: 50%;
  padding: 1.6rem;
  box-sizing: border-box;
  
    > p {
      font-size: 1.3rem;
      color: #476481;
      letter-spacing: 0;
      text-align: center;
      margin: 1.6rem 0 0;
    }
`
// Switcharoo arrows
const IconWrapper = styled.a`
  margin: 1rem auto;
  
    > img {
      transition: opacity .2s ease-in-out;
      opacity: .5;
      &:hover {
        opacity: 1;
      }
    }
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
  background-color: #218DFF;
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
  color: #FFFFFF;
  letter-spacing: .1rem;
  text-align: center;
  text-transform: uppercase;
  padding: 1rem 2rem;
  box-sizing: border-box;
  line-height: 1;
  width: 100%;
  font-weight: var(--font-weight-medium);
  height: 4.6rem;
  margin: 1rem auto;
  max-width: 32rem;

  &:disabled {
    cursor: not-allowed;
    opacity: .5rem;
  }
`

const PriceWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin: 2.4rem 0;
  justify-content: space-between;
  
    > strong {
      text-transform: capitalize;
      color: #2F3E4E;
      width: 100%;
      margin: 0 0 1rem;
      padding: 0 1rem;
      box-sizing: border-box;
    }
`

const PriceInputBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  width: 50%;
  width: calc(50% - .8rem);
  height: 5.6rem;
  position: relative;
  
  label {
    display: flex;
    width: auto;
    max-width: 100%;
    position: relative;
  }
  
  label > small {
    position: absolute;
    right: 1rem;
    top: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    align-items: center;
    opacity: 0.75;
    font-size: 1.2rem;
    color: #476481;
    letter-spacing: -0.05rem;
    text-align: right;
    font-weight: var(--font-weight-medium)
  }

  input {
    margin: 0;
    width: auto;
    max-width: 100%;
    background: #E7ECF3;
    border-radius: .6rem .6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: .2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 7rem 0 1rem;
    
    &:focus {
      border-bottom: .2rem solid #218DFF;
      border-color: #218DFF;
      color: #218DFF;
    }

    &.error {
      border-color: #ff0000a3;
    }

    &.warning {
      border-color: orange;
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

const OrdersPanel = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 50%;
  background: #EDF2F7;
  border-radius: 0 .6rem .6rem 0;
  box-sizing: border-box;
  
    > div {
      width: 100%;
      width: calc(100% - 1.6rem);
      height: auto;
      box-sizing: border-box;
      display: flex;
      flex-flow: row wrap;
      overflow-y: auto;
      border-radius: 0 .6rem .6rem 0;
    }
  
    > div > h5 {
      width: 100%;
      margin: 0 auto;
      padding: 1.6rem 0 1rem;
      font-weight: var(--font-weight-medium);
      font-size: 1.6rem;
      color: #2F3E4E;
      letter-spacing: 0.03rem;
      text-align: center;
      box-sizing: border-box;
      text-align: center;
    }
  
    > button {
      width: 1.6rem;
      height: 100%;
      border-right: .1rem solid rgba(159,180,201,0.50);
      background: #ecf2f7 url(${arrow}) no-repeat center/1.2rem 1rem;
      padding: 0;
      margin: 0;
      outline: 0;
        &:hover {background-color: #ecf2f7;}
    }
`

export const enum TradeFormTokenId {
  sellToken = 'sellToken',
  receiveToken = 'receiveToken',
}

export type TradeFormData = {
  [K in keyof typeof TradeFormTokenId]: string
}

const TradeWidget: React.FC = () => {
  const { networkId, isConnected, userAddress } = useWalletConnection()
  const [, dispatch] = useGlobalState()

  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, buy: receiveTokenSymbol } = useParams()
  const { sellAmount, buyAmount: receiveAmount } = useQuery()

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || (getToken('symbol', 'DAI', tokens) as Required<TokenDetails>),
  )
  const [receiveToken, setReceiveToken] = useState(
    () =>
      getToken('symbol', receiveTokenSymbol, tokens) || (getToken('symbol', 'USDC', tokens) as Required<TokenDetails>),
  )
  const sellInputId = TradeFormTokenId.sellToken
  const receiveInputId = TradeFormTokenId.receiveToken

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: {
      [sellInputId]: sellAmount,
      [receiveInputId]: receiveAmount,
    },
  })
  const { handleSubmit, watch, reset } = methods

  const searchQuery = buildSearchQuery({ sell: watch(sellInputId), buy: watch(receiveInputId) })
  const url = `/order/${sellToken.symbol}-${receiveToken.symbol}?${searchQuery}`
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
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)

    // Do not let potential null values through
    if (!buyAmount || !sellAmount || !cachedBuyToken || !cachedSellToken || !networkId || !userAddress) return

    if (isConnected) {
      let pendingTxHash: string | undefined = undefined
      const { success } = await placeOrder({
        buyAmount,
        buyToken: cachedBuyToken,
        sellAmount,
        sellToken: cachedSellToken,
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
        reset()
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
            selectLabel="Sell"
            onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
            tabIndex={1}
          />
          <IconWrapper onClick={swapTokens}>
            <img src={switchTokenPair}/>
          </IconWrapper>
          <TokenRow
            selectedToken={receiveToken}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="Receive at least"
            onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={2}
          />
          {/* Refactor these price input fields */}
          <PriceWrapper>
            <strong>Min. sell price</strong>
            <PriceInputBox><label><input placeholder="0" value="146.666" type="text" required /><small>WETH/DAI</small></label></PriceInputBox>
            <PriceInputBox><label><input placeholder="0" value="0.00682" type="text" required /><small>DAI/WETH</small></label></PriceInputBox>
          </PriceWrapper>
          {/* Refactor these price input fields */}
          {/* <OrderDetails
            sellAmount={watch(sellInputId)}
            sellTokenName={safeTokenName(sellToken)}
            receiveAmount={watch(receiveInputId)}
            receiveTokenName={safeTokenName(receiveToken)}
          /> */}
          <p>This order might be partially filled.</p>
          <SubmitButton data-text="This order might be partially filled." type="submit" disabled={!methods.formState.isValid || isSubmitting} tabIndex={5}>
            <FontAwesomeIcon icon={isSubmitting ? faSpinner : ""} size="lg" spin={isSubmitting} />{' '}
            {sameToken ? 'Please select different tokens' : 'Submit limit order'}
          </SubmitButton>
        </WrappedForm>
      </FormContext>
      <OrdersPanel>
        {/* Toggle panel visiblity (arrow) */}
        <button></button>
        {/* Actual orders content */}
        <div>
          <h5>Your orders</h5>
          <OrdersWidget></OrdersWidget>
        </div>
      </OrdersPanel>
    </WrappedWidget>
  )
}

export default TradeWidget
