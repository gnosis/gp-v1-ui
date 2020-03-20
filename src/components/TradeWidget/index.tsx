import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import switchTokenPair from 'assets/img/switch.svg'
import arrow from 'assets/img/arrow.svg'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'toastify'
import BN from 'bn.js'

import TokenRow from './TokenRow'
import OrderValidity from './OrderValidity'
import Widget from 'components/Layout/Widget'
import OrdersWidget from 'components/OrdersWidget'
import { OrdersWrapper } from 'components/OrdersWidget/OrdersWidget.styled'
import { TxNotification } from 'components/TxNotification'
import { Wrapper } from 'components/ConnectWalletBanner'
import FormMessage from './FormMessage'

import { useForm, FormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import useURLParams from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder } from 'hooks/usePlaceOrder'
import { useQuery, buildSearchQuery } from 'hooks/useQuery'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'
import { MEDIA } from 'const'

import { tokenListApi } from 'api'

import { Network, TokenDetails } from 'types'

import { getToken, parseAmount, parseBigNumber, dateToBatchId } from 'utils'
import { ZERO } from 'const'
import Price, { invertPriceFromString } from './Price'
import { useConnectWallet } from 'hooks/useConnectWallet'
import { PendingTxObj } from 'api/exchange/ExchangeApi'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
  margin: 0 auto;
  max-width: 160rem;
  height: 58rem;
  width: auto;
  flex-flow: row nowrap;
  display: flex;
  background: #ffffff;
  box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
    rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
    rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
    rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 54rem;
  font-size: 1.6rem;
  line-height: 1;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    max-height: initial;
    min-height: initial;
    width: 100%;
    height: initial;
  }
`

const WrappedForm = styled.form`
  display: flex;
  flex-flow: column wrap;
  flex: 1 0 42rem;
  max-width: 50rem;
  padding: 1.6rem;
  box-sizing: border-box;
  transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;
  opacity: 1;

  .react-select__control:focus-within,
  input[type='checkbox']:focus,
  button:focus {
    outline: 1px dotted gray;
  }

  .expanded & {
    width: 0;
    overflow: hidden;
    flex: none;
    padding: 0;
    opacity: 0;
  }

  @media ${MEDIA.mobile} {
    width: 100%;
    flex: 1 1 100%;
    max-width: 100%;
  }

  > p {
    font-size: 1.3rem;
    color: #476481;
    letter-spacing: 0;
    text-align: center;
    margin: 1.6rem 0 0;
  }

  ${FormMessage} {
    font-size: 1.3rem;
    margin: 0.5rem 0 0;
    flex-flow: row wrap;
    justify-content: flex-start;

    > b {
      margin: 0.3rem;
    }
    > i {
      margin: 0.3rem 0 0.3rem 0;
      font-style: normal;
    }
    > strong {
      margin: 0.3rem 0 0.3rem 0.3rem;
      font-size: 1.3rem;
    }
  }
`
// Switcharoo arrows
const IconWrapper = styled.a`
  margin: 1rem auto;

  > img {
    transition: opacity 0.2s ease-in-out;
    opacity: 0.5;
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
  background-color: #218dff;
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
  color: #ffffff;
  letter-spacing: 0.1rem;
  text-align: center;
  text-transform: uppercase;
  padding: 1rem 2rem;
  box-sizing: border-box;
  line-height: 1;
  width: 100%;
  font-weight: var(--font-weight-bold);
  height: 4.6rem;
  margin: 1rem auto 0;
  max-width: 32rem;
  @media ${MEDIA.mobile} {
    font-size: 1.3rem;
    margin: 1rem auto 1.6rem;
  }
`

const OrdersPanel = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 1;
  min-width: 48rem;
  max-width: 100%;
  background: #edf2f7;
  border-radius: 0 0.6rem 0.6rem 0;
  box-sizing: border-box;
  transition: flex 0.2s ease-in-out;
  align-items: flex-start;
  align-content: flex-start;

  .expanded & {
    flex: 1 1 100%;
    min-width: 85rem;
  }

  // Connect Wallet banner in the orders panel
  ${Wrapper} {
    background: transparent;
    box-shadow: none;
  }

  // Orders widget when inside the OrdersPanel
  ${OrdersWrapper} {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    min-height: initial;
    min-width: initial;
    max-width: initial;
  }

  > div {
    width: 100%;
    width: calc(100% - 1.6rem);
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    border-radius: 0 0.6rem 0.6rem 0;
    overflow-y: auto;

    @media ${MEDIA.mobile} {
      display: none;
      &.visible {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
      }
    }
  }

  > div > h5 {
    width: 100%;
    margin: 0 auto;
    padding: 1.6rem 0 1rem;
    font-weight: var(--font-weight-bold);
    font-size: 1.6rem;
    color: #2f3e4e;
    letter-spacing: 0.03rem;
    text-align: center;
    box-sizing: border-box;
    text-align: center;
  }

  > div > h5 > a {
    font-size: 1.3rem;
    font-weight: var(--font-weight-normal);
    color: #218dff;
    text-decoration: underline;
  }

  > div > h5 > a {
    font-size: 1.3rem;
    font-weight: var(--font-weight-normal);
    color: #218dff;
    text-decoration: underline;
  }
`

const OrdersToggler = styled.button<{ $isOpen?: boolean }>`
  width: 1.6rem;
  height: 100%;
  border-right: 0.1rem solid rgba(159, 180, 201, 0.5);
  background: #ecf2f7;
  padding: 0;
  margin: 0;
  outline: 0;

  @media ${MEDIA.mobile} {
    display: none;
  }

  &::before {
    display: block;
    content: ' ';
    background: url(${arrow}) no-repeat center/contain;
    height: 1.2rem;
    width: 1.6rem;
    margin: 0;
    transform: rotate(${({ $isOpen }): number => ($isOpen ? 0.5 : 0)}turn);
  }

  &:hover {
    background-color: #ecf2f7;
  }
`

export const enum TradeFormTokenId {
  sellToken = 'sellToken',
  receiveToken = 'receiveToken',
  validFrom = 'validFrom',
  validUntil = 'validUntil',
  price = 'price',
  priceInverse = 'priceInverse',
}

export type TradeFormData = {
  [K in keyof typeof TradeFormTokenId]: string
}

export const DEFAULT_FORM_STATE = {
  sellToken: '0',
  receiveToken: '0',
  price: '0',
  // ASAP
  validFrom: '0',
  // 2 days
  validUntil: '2880',
}

function _getReceiveTokenTooltipText(sellValue: string, receiveValue: string): string {
  const sellAmount = parseBigNumber(sellValue)

  if (!sellAmount || sellAmount.isZero()) {
    return 'First input the sell amount'
  }

  const receiveAmount = parseBigNumber(receiveValue)
  if (!receiveAmount || receiveAmount.isZero()) {
    return 'Input the price to get the receive tokens'
  } else {
    return 'Minimum amount of tokens you will receive if the order is fully executed at the given price'
  }
}

const TradeWidget: React.FC = () => {
  const { networkId, isConnected, userAddress } = useWalletConnection()
  const { connectWallet } = useConnectWallet()
  const [, dispatch] = useGlobalState()

  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const sellInputId = TradeFormTokenId.sellToken
  const receiveInputId = TradeFormTokenId.receiveToken
  const priceInputId = TradeFormTokenId.price
  const priceInverseInputId = TradeFormTokenId.priceInverse
  const validFromId = TradeFormTokenId.validFrom
  const validUntilId = TradeFormTokenId.validUntil
  const { balances } = useTokenBalances()

  // If user is connected, use balances, otherwise get the default list
  const tokens = useMemo(
    () => (isConnected && balances.length > 0 ? balances : tokenListApi.getTokens(fallBackNetworkId)),
    [balances, fallBackNetworkId, isConnected],
  )

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, buy: receiveTokenSymbol } = useParams()
  const {
    sellAmount: sellParam,
    price: priceParam,
    validFrom: validFromParam,
    validUntil: validUntilParam,
  } = useQuery()

  const [ordersVisible, setOrdersVisible] = useState(true)
  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || (getToken('symbol', 'DAI', tokens) as Required<TokenDetails>),
  )
  const [receiveToken, setReceiveToken] = useState(
    () =>
      getToken('symbol', receiveTokenSymbol, tokens) || (getToken('symbol', 'USDC', tokens) as Required<TokenDetails>),
  )
  const [unlimited, setUnlimited] = useState(!validUntilParam || !Number(validUntilParam))
  const [asap, setAsap] = useState(!validFromParam || !Number(validFromParam))

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: {
      [sellInputId]: sellParam,
      [receiveInputId]: '',
      [validFromId]: validFromParam,
      [validUntilId]: validUntilParam,
      [priceInputId]: priceParam,
      [priceInverseInputId]: invertPriceFromString(priceParam),
    },
  })
  const { handleSubmit, reset, watch, setValue } = methods

  const priceValue = watch(priceInputId)
  const priceInverseValue = watch(priceInverseInputId)
  const sellValue = watch(sellInputId)
  const receiveValue = watch(receiveInputId)
  const validFromValue = watch(validFromId)
  const validUntilValue = watch(validUntilId)

  // Update receive amount
  useEffect(() => {
    let receiveAmount: string | undefined
    if (priceValue && sellValue) {
      const sellAmount = parseBigNumber(sellValue)
      const price = parseBigNumber(priceValue)

      if (sellAmount && price) {
        receiveAmount = sellAmount.multipliedBy(price).toString(10)
      }
    }
    setValue(receiveInputId, receiveAmount || '')
  }, [priceValue, priceInverseValue, setValue, receiveInputId, sellValue])

  const searchQuery = buildSearchQuery({
    sell: sellValue,
    price: priceValue,
    from: validFromValue,
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

  const sellTokenBalance = useMemo(
    () => getToken('symbol', sellToken.symbol, balances) || { ...sellToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, sellToken],
  )

  const receiveTokenBalance = useMemo(
    () => getToken('symbol', receiveToken.symbol, balances) || { ...receiveToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, receiveToken],
  )

  const { placeOrder, placeMultipleOrders, isSubmitting, setIsSubmitting } = usePlaceOrder()

  const swapTokens = useCallback((): void => {
    setSellToken(receiveTokenBalance)
    setReceiveToken(sellTokenBalance)
  }, [receiveTokenBalance, sellTokenBalance])

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

  const savePendingTransactions = useCallback(
    (
      txHash: string,
      { buyTokenId, sellTokenId, priceNumerator, priceDenominator, networkId, userAddress, validFrom, validUntil },
    ): void => {
      // reset form on successful order placing
      reset(DEFAULT_FORM_STATE)
      setUnlimited(false)
      // unblock form
      setIsSubmitting(false)

      // pendingTxHash = txHash
      toast.info(<TxNotification txHash={txHash} />)

      const pendingOrder: PendingTxObj = {
        id: Date.now() + '', // Uses a temporal unique id
        buyTokenId,
        sellTokenId,
        priceNumerator,
        priceDenominator,
        user: userAddress,
        remainingAmount: priceDenominator,
        sellTokenBalance: ZERO,
        validFrom,
        validUntil,
        txHash,
      }

      return dispatch(savePendingOrdersAction({ orders: pendingOrder, networkId, userAddress }))
    },
    [dispatch, reset, setIsSubmitting],
  )

  const _placeOrder = useCallback(
    async (params: {
      validFrom: number
      validUntil: number
      buyAmount: BN
      buyToken: TokenDetails
      sellAmount: BN
      sellToken: TokenDetails
      networkId: number
      userAddress: string
    }) => {
      const { validFrom, validUntil, buyAmount, buyToken, sellAmount, sellToken, networkId, userAddress } = params

      let pendingTxHash: string | undefined = undefined
      // block form
      setIsSubmitting(true)

      // TODO: Review this logic. This should be calculated in the same place where we send the tx
      const currentBatch = dateToBatchId(new Date())
      const validFromBatchId = currentBatch + validFrom
      const validUntilBatchId = currentBatch + validUntil
      let success: boolean
      // ASAP ORDER
      if (validFrom === 0) {
        // ; for destructure reassign format
        ;({ success } = await placeOrder({
          networkId,
          userAddress,
          buyAmount,
          buyToken,
          sellAmount,
          sellToken,
          validUntil,
          txOptionalParams: {
            onSentTransaction: (txHash: string): void => {
              pendingTxHash = txHash
              return savePendingTransactions(txHash, {
                buyTokenId: buyToken.id,
                sellTokenId: sellToken.id,
                priceNumerator: buyAmount,
                priceDenominator: sellAmount,
                networkId,
                userAddress,
                sellToken,
                validFrom: validFromBatchId,
                validUntil: validUntilBatchId,
              })
            },
          },
        }))
      } else {
        // ; for destructure reassign format
        ;({ success } = await placeMultipleOrders({
          networkId,
          userAddress,
          orders: [
            {
              buyAmount,
              buyToken: buyToken.id,
              sellAmount,
              sellToken: sellToken.id,
              validFrom,
              validUntil,
            },
          ],
          txOptionalParams: {
            onSentTransaction: (txHash: string): void => {
              pendingTxHash = txHash
              return savePendingTransactions(txHash, {
                buyTokenId: buyToken.id,
                sellTokenId: sellToken.id,
                priceNumerator: sellAmount,
                priceDenominator: buyAmount,
                networkId,
                userAddress,
                validFrom: validFromBatchId,
                validUntil: validUntilBatchId,
              })
            },
          },
        }))
      }
      if (success && pendingTxHash) {
        // remove pending tx
        dispatch(removePendingOrdersAction({ networkId, pendingTxHash, userAddress }))
      }
    },
    [dispatch, placeMultipleOrders, placeOrder, savePendingTransactions, setIsSubmitting],
  )

  async function onSubmit(data: FieldValues): Promise<void> {
    const buyAmount = parseAmount(data[receiveInputId], receiveToken.decimals)
    const sellAmount = parseAmount(data[sellInputId], sellToken.decimals)
    // Minutes - then divided by 5min for batch length to get validity time
    // 0 validUntil time  = unlimited order
    // TODO: review this line
    const validFrom = +data[validFromId] / 5
    const validUntil = +data[validUntilId] / 5
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)

    // Do not let potential null values through
    if (!buyAmount || !sellAmount || !cachedBuyToken || !cachedSellToken || !networkId) return

    if (isConnected && userAddress) {
      await _placeOrder({
        validFrom,
        validUntil,
        sellAmount,
        buyAmount,
        sellToken: cachedSellToken,
        buyToken: cachedBuyToken,
        networkId,
        userAddress,
      })
    } else {
      // Not connected. Prompt user to connect his wallet
      const walletInfo = await connectWallet()

      // Then place the order if connection was successful
      if (walletInfo && walletInfo.networkId && walletInfo.userAddress) {
        await _placeOrder({
          validFrom,
          validUntil,
          sellAmount,
          buyAmount,
          sellToken: cachedSellToken,
          buyToken: cachedBuyToken,
          networkId: walletInfo.networkId,
          userAddress: walletInfo.userAddress,
        })
      }
    }
  }

  const receiveTokenTooltipText = useMemo(() => _getReceiveTokenTooltipText(sellValue, receiveValue), [
    sellValue,
    receiveValue,
  ])

  return (
    <WrappedWidget className={ordersVisible ? '' : 'expanded'}>
      {/* // Toggle Class 'expanded' on WrappedWidget on click of the <OrdersPanel> <button> */}
      <FormContext {...methods}>
        <WrappedForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {sameToken && <WarningLabel>Tokens cannot be the same!</WarningLabel>}
          <TokenRow
            autoFocus
            selectedToken={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="Sell"
            onSelectChange={onSelectChangeFactory(setSellToken, receiveTokenBalance)}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
            tabIndex={1}
            readOnly={false}
            tooltipText="Maximum amount of tokens you want to sell"
          />
          <IconWrapper onClick={swapTokens}>
            <img src={switchTokenPair} />
          </IconWrapper>
          <TokenRow
            selectedToken={receiveTokenBalance}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="Receive at least"
            onSelectChange={onSelectChangeFactory(setReceiveToken, sellTokenBalance)}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={1}
            readOnly
            tooltipText={receiveTokenTooltipText}
          />
          <Price
            priceInputId={priceInputId}
            priceInverseInputId={priceInverseInputId}
            sellToken={sellToken}
            receiveToken={receiveToken}
            tabIndex={1}
          />
          <OrderValidity
            validFromInputId={validFromId}
            validUntilInputId={validUntilId}
            isDisabled={isSubmitting}
            isAsap={asap}
            isUnlimited={unlimited}
            setAsap={setAsap}
            setUnlimited={setUnlimited}
            tabIndex={1}
          />
          <p>This order might be partially filled.</p>
          <SubmitButton
            data-text="This order might be partially filled."
            type="submit"
            disabled={isSubmitting}
            tabIndex={1}
          >
            {isSubmitting && <FontAwesomeIcon icon={faSpinner} size="lg" spin={isSubmitting} />}{' '}
            {sameToken ? 'Please select different tokens' : 'Submit limit order'}
          </SubmitButton>
        </WrappedForm>
      </FormContext>
      <OrdersPanel>
        {/* Toggle panel visibility (arrow) */}
        <OrdersToggler
          type="button"
          onClick={(): void => setOrdersVisible(ordersVisible => !ordersVisible)}
          $isOpen={ordersVisible}
        />
        {/* Actual orders content */}
        <div>
          <h5>Your orders</h5>
          <OrdersWidget />
        </div>
      </OrdersPanel>
    </WrappedWidget>
  )
}

export default TradeWidget
