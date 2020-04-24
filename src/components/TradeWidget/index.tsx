import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { unstable_batchedUpdates as batchUpdateState } from 'react-dom'

import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { SwitcherSVG } from 'assets/img/SVG'
import arrow from 'assets/img/arrow.svg'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'toastify'
import BN from 'bn.js'
import Modali from 'modali'
import { isAddress } from 'web3-utils'

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
import { useDebounce } from 'hooks/useDebounce'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'

import { MEDIA, PRICE_ESTIMATION_PRECISION, PRICE_ESTIMATION_DEBOUNCE_TIME } from 'const'

import { TokenDetails, Network } from 'types'

import {
  getToken,
  parseAmount,
  parseBigNumber,
  dateToBatchId,
  logDebug,
  resolverFactory,
  formatTimeToFromBatch,
} from 'utils'

import { ZERO } from 'const'

import Price, { invertPriceFromString } from './Price'
import { useConnectWallet } from 'hooks/useConnectWallet'
import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import { updateTradeState } from 'reducers-actions/trade'
import { tokenListApi } from 'api'

import validationSchema from './validationSchema'
import { useBetterAddTokenModal } from 'hooks/useBetterAddTokenModal'
import { encodeTokenSymbol, decodeSymbol } from '@gnosis.pm/dex-js'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;
  margin: 0 auto;
  max-width: 160rem;
  height: 63rem;
  width: auto;
  flex-flow: row nowrap;
  display: flex;
  background: var(--color-background-pageWrapper);
  box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
    rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
    rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
    rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 63rem;
  font-size: 1.6rem;
  line-height: 1;

  @media ${MEDIA.tablet}, ${MEDIA.mobile} {
    flex-flow: column wrap;
    max-height: initial;
    min-height: initial;
    width: 100%;
    height: initial;
  }

  @media ${MEDIA.tablet} {
    width: 96%;
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

  @media ${MEDIA.tablet} {
    max-width: initial;
    flex: 1 1 50%;
    padding: 1.6rem 1.6rem 3.2rem;
  }

  @media ${MEDIA.mobile} {
    width: 100%;
    flex: 1 1 100%;
    max-width: 100%;
  }

  > div {
    @media ${MEDIA.mobile} {
      width: 100%;
    }
  }

  > p {
    font-size: 1.3rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
    text-align: center;
    margin: 1.6rem 0 0;
  }

  ${FormMessage} {
    font-size: 1.3rem;
    margin: 0.5rem 0 0;
    flex-flow: row wrap;
    justify-content: flex-start;

    @media ${MEDIA.mediumUp} {
      max-height: 11rem;
    }

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
      word-break: break-word;
    }
  }
`
// Switcharoo arrows
const IconWrapper = styled.a`
  margin: 1rem auto;

  > svg {
    fill: var(--color-svg-switcher);
    transition: opacity 0.2s ease-in-out;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`

const WarningLabel = styled.code`
  background: var(--color-error);
  border-radius: var(--border-radius);
  font-weight: bolder;
  margin: 0 auto 0.9375rem;
  padding: 6;
  text-align: center;
  width: 75%;
`

const SubmitButton = styled.button`
  background-color: var(--color-background-CTA);
  color: var(--color-text-CTA);
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
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
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  flex: 1;
  min-width: 48rem;
  max-width: 100%;
  background: var(--color-background) none repeat scroll 0% 0%; // var(--color-background-pageWrapper);
  border-radius: 0 0.6rem 0.6rem 0;
  box-sizing: border-box;
  transition: flex 0.2s ease-in-out;
  align-items: flex-start;
  align-content: flex-start;

  .expanded & {
    flex: 1 1 100%;
    min-width: 85rem;
  }

  @media ${MEDIA.tablet} {
    flex: 1 1 50%;
    min-width: initial;
    border-radius: 0;
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

    @media ${MEDIA.tablet} {
      width: 100%;
      border-radius: 0;
      margin: 2.4rem auto 0;
    }

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
    color: var(--color-text-primary);
    letter-spacing: 0.03rem;
    text-align: center;
    box-sizing: border-box;
    text-align: center;
  }

  > div > h5 > a {
    font-size: 1.3rem;
    font-weight: var(--font-weight-normal);
    color: var(--color-text-active);
    text-decoration: underline;
  }

  > div > h5 > a {
    font-size: 1.3rem;
    font-weight: var(--font-weight-normal);
    color: var(--color-text-active);
    text-decoration: underline;
  }
`

const OrdersToggler = styled.button<{ $isOpen?: boolean }>`
  width: 1.6rem;
  height: 100%;
  border-right: 0.1rem solid rgba(159, 180, 201, 0.5);
  background: var(--color-background);
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

    @media ${MEDIA.tablet} {
      display: none;
    }
  }

  &:hover {
    background-color: var(--color-background-banner);
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

const validationResolver = resolverFactory<TradeFormData>(validationSchema)

export const DEFAULT_FORM_STATE = {
  sellToken: '0',
  receiveToken: '0',
  price: '0',
  // ASAP
  validFrom: undefined,
  // 2 days
  validUntil: '2880',
}

function calculateReceiveAmount(priceValue: string, sellValue: string): string {
  let receiveAmount = ''
  if (priceValue && sellValue) {
    const sellAmount = parseBigNumber(sellValue)
    const price = parseBigNumber(priceValue)

    if (sellAmount && price) {
      const receiveBigNumber = sellAmount.multipliedBy(price)
      receiveAmount = receiveBigNumber.isNaN() || !receiveBigNumber.isFinite() ? '0' : receiveBigNumber.toString(10)
    }
  }

  return receiveAmount
}

interface TokensAdderProps {
  tokenAddresses: string[]
  networkId: number
  onTokensAdded: (newTokens: TokenDetails[]) => void
}

const TokensAdder: React.FC<TokensAdderProps> = ({ tokenAddresses, networkId, onTokensAdded }) => {
  const { addTokensToList, modalProps } = useBetterAddTokenModal({ focused: true })

  useEffect(() => {
    if (tokenAddresses.length === 0) return

    addTokensToList({ tokenAddresses, networkId }).then(newTokens => {
      if (newTokens.length > 0) {
        onTokensAdded(newTokens)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // no deps, so that we only open modal once on mount

  return tokenAddresses.length > 0 ? <Modali.Modal {...modalProps} /> : null
}

const preprocessTokenAddressesToAdd = (addresses: (string | undefined)[], networkId: number): string[] => {
  const tokenAddresses: string[] = []
  const addedSet = new Set()

  addresses.forEach(address => {
    if (
      address &&
      !addedSet.has(address) &&
      !tokenListApi.hasToken({ tokenAddress: address, networkId }) &&
      isAddress(address.toLowerCase())
    ) {
      tokenAddresses.push(address)
      addedSet.add(address)
    }
  })

  return tokenAddresses
}

interface ChooseTokenInput {
  tokens: TokenDetails[]
  token: TokenDetails | null
  tokenSymbolFromUrl?: string
  defaultTokenSymbol: 'DAI' | 'USDC'
}

const chooseTokenWithFallback = ({
  tokens,
  token,
  tokenSymbolFromUrl,
  defaultTokenSymbol,
}: ChooseTokenInput): TokenDetails => {
  return (
    token ||
    (tokenSymbolFromUrl && isAddress(tokenSymbolFromUrl?.toLowerCase())
      ? getToken('address', tokenSymbolFromUrl, tokens)
      : getToken('symbol', tokenSymbolFromUrl, tokens)) ||
    (getToken('symbol', defaultTokenSymbol, tokens) as Required<TokenDetails>)
  )
}

function buildUrl(params: {
  sell: string
  price: string
  from: string
  expires: string
  sellToken: TokenDetails
  buyToken: TokenDetails
}): string {
  const { sell, price, from, expires, sellToken, buyToken } = params

  const searchQuery = buildSearchQuery({
    sell,
    price,
    from,
    expires,
  })

  return `/trade/${encodeTokenSymbol(sellToken)}-${encodeTokenSymbol(buyToken)}?${searchQuery}`
}

const TradeWidget: React.FC = () => {
  const { networkId, networkIdOrDefault, isConnected, userAddress } = useWalletConnection()
  const { connectWallet } = useConnectWallet()
  const [{ trade }, dispatch] = useGlobalState()

  const sellInputId = TradeFormTokenId.sellToken
  const receiveInputId = TradeFormTokenId.receiveToken
  const priceInputId = TradeFormTokenId.price
  const priceInverseInputId = TradeFormTokenId.priceInverse
  const validFromId = TradeFormTokenId.validFrom
  const validUntilId = TradeFormTokenId.validUntil
  const { balances, tokens: tokenList } = useTokenBalances()

  // If user is connected, use balances, otherwise get the default list
  const tokens =
    isConnected && balances.length > 0
      ? balances
      : tokenList.length > 0
      ? tokenList
      : tokenListApi.getTokens(networkIdOrDefault)

  // Listen on manual changes to URL search query
  const { sell: encodedSellTokenSymbol, buy: decodeReceiveTokenSymbol } = useParams()
  const sellTokenSymbol = decodeSymbol(encodedSellTokenSymbol || '')
  const receiveTokenSymbol = decodeSymbol(decodeReceiveTokenSymbol || '')
  const {
    sellAmount: sellParam,
    price: priceParam,
    validFrom: validFromParam,
    validUntil: validUntilParam,
  } = useQuery()

  // Combining global state with query params
  const defaultPrice = trade.price || priceParam
  const defaultSellAmount = trade.sellAmount || sellParam
  const defaultValidFrom = trade.validFrom || validFromParam
  const defaultValidUntil = trade.validUntil || validUntilParam

  const [sellToken, setSellToken] = useState(() =>
    chooseTokenWithFallback({
      token: trade.sellToken,
      tokens,
      tokenSymbolFromUrl: sellTokenSymbol,
      defaultTokenSymbol: 'DAI',
    }),
  )
  const [receiveToken, setReceiveToken] = useState(() =>
    chooseTokenWithFallback({
      token: trade.buyToken,
      tokens,
      tokenSymbolFromUrl: receiveTokenSymbol,
      defaultTokenSymbol: 'USDC',
    }),
  )

  useEffect(() => {
    //  when switching networks
    // trade stays filled with last tokens
    // which may not be available on the new network
    if (trade.sellToken) {
      // check if it should be different
      const sellTokenOrFallback = chooseTokenWithFallback({
        // don't consider token from trade from wrong network valid
        token: tokenListApi.hasToken({ tokenAddress: trade.sellToken.address, networkId: networkIdOrDefault })
          ? trade.sellToken
          : null,
        tokens: tokenListApi.getTokens(networkIdOrDefault), // get immediate new tokens
        tokenSymbolFromUrl: sellTokenSymbol, // from url params
        defaultTokenSymbol: 'DAI', // default sellToken
      })
      setSellToken(sellTokenOrFallback)
    }

    if (trade.buyToken) {
      const buyTokenOrFallback = chooseTokenWithFallback({
        token: tokenListApi.hasToken({ tokenAddress: trade.buyToken.address, networkId: networkIdOrDefault })
          ? trade.buyToken
          : null,
        tokens: tokenListApi.getTokens(networkIdOrDefault),
        tokenSymbolFromUrl: receiveTokenSymbol,
        defaultTokenSymbol: 'USDC', // default buyToken
      })
      setReceiveToken(buyTokenOrFallback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkIdOrDefault])
  // don't need to depend on more than network as everything else updates together
  // also avoids excessive setStates

  const [unlimited, setUnlimited] = useState(!defaultValidUntil || !Number(defaultValidUntil))
  const [asap, setAsap] = useState(!defaultValidFrom || !Number(defaultValidFrom))

  const [ordersVisible, setOrdersVisible] = useState(true)

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: {
      [sellInputId]: defaultSellAmount,
      [receiveInputId]: '',
      [validFromId]: defaultValidFrom,
      [validUntilId]: defaultValidUntil,
      [priceInputId]: defaultPrice,
      [priceInverseInputId]: invertPriceFromString(defaultPrice),
    },
    validationResolver,
  })
  const { handleSubmit, reset, watch, setValue } = methods

  const priceValue = watch(priceInputId)
  const priceInverseValue = watch(priceInverseInputId)
  const sellValue = watch(sellInputId)
  const validFromValue = watch(validFromId)
  const validUntilValue = watch(validUntilId)

  // Avoid querying for a new price at every input change
  const { value: debouncedSellValue } = useDebounce(sellValue, PRICE_ESTIMATION_DEBOUNCE_TIME)

  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId: networkIdOrDefault,
    baseTokenId: receiveToken.id,
    baseTokenDecimals: receiveToken.decimals,
    quoteTokenId: sellToken.id,
    quoteTokenDecimals: sellToken.decimals,
    amount: debouncedSellValue,
  })

  // Updating global trade state on change
  useEffect(() => {
    dispatch(
      updateTradeState({
        price: priceValue,
        sellAmount: sellValue,
        sellToken: sellToken as Required<TokenDetails>,
        buyToken: receiveToken as Required<TokenDetails>,
        validFrom: validFromValue,
        validUntil: validUntilValue,
      }),
    )
  }, [dispatch, priceValue, sellValue, sellToken, receiveToken, validFromValue, validUntilValue])

  const initialPrice = useRef(defaultPrice)

  useEffect(() => {
    // We DON'T want to use the price estimation when the page is being loaded with a price in the URL.
    // For example when sharing the URL or when filling in from Telegram bot suggestions
    // We DO want to use price estimation when there's no price coming from the URL
    const shouldUsePriceEstimation = !initialPrice.current || +initialPrice.current === 0

    // Only try to update price estimation when not loading
    if (!isPriceLoading) {
      // If there was a price set coming from the URL, reset it
      // It was supposed to be used only once. Initial price doesn't matter anymore
      if (initialPrice.current) {
        initialPrice.current = ''
      }

      logDebug(`[TradeWidget] priceEstimation ${priceEstimation}`)

      if (shouldUsePriceEstimation) {
        // Price estimation can be null. In that case, set the input to 0
        const newPrice = priceEstimation ? priceEstimation.toFixed(PRICE_ESTIMATION_PRECISION) : '0'

        setValue(priceInputId, newPrice)
        setValue(priceInverseInputId, invertPriceFromString(newPrice))

        setValue(receiveInputId, calculateReceiveAmount(priceValue, sellValue))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceEstimation, isPriceLoading])

  // Update receive amount
  useEffect(() => {
    setValue(receiveInputId, calculateReceiveAmount(priceValue, sellValue))
  }, [priceValue, priceInverseValue, setValue, receiveInputId, sellValue])

  const url = buildUrl({
    sell: sellValue,
    price: priceValue,
    from: validFromValue,
    expires: validUntilValue,
    sellToken: sellToken,
    buyToken: receiveToken,
  })
  // Updates page URL with parameters from context
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
  const savePendingTransactionsAndResetForm = useCallback(
    (
      txHash: string,
      {
        buyTokenId,
        sellTokenId,
        priceNumerator,
        priceDenominator,
        networkId,
        userAddress,
        validFromWithBatchID,
        validUntilWithBatchID,
      },
      resetStateOptions: Partial<TradeFormData> = DEFAULT_FORM_STATE,
    ): void => {
      batchUpdateState(() => {
        // reset form on successful order placing
        reset(resetStateOptions)
        setUnlimited(false)
        // unblock form
        setIsSubmitting(false)
      })

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
        validFrom: validFromWithBatchID,
        validUntil: validUntilWithBatchID,
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
      price: string
    }) => {
      const {
        price,
        validFrom,
        validUntil,
        buyAmount,
        buyToken,
        sellAmount,
        sellToken,
        networkId,
        userAddress,
      } = params

      let pendingTxHash: string | undefined = undefined
      // block form
      setIsSubmitting(true)

      // TODO: Review this logic. This should be calculated in the same place where we send the tx
      const currentBatch = dateToBatchId(new Date())
      const validFromWithBatchID = currentBatch + validFrom
      const validUntilWithBatchID = currentBatch + validUntil

      const isASAP = validFrom === 0
      const isNever = validUntil === 0

      let success: boolean
      // ASAP ORDER
      if (isASAP) {
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
              return savePendingTransactionsAndResetForm(
                txHash,
                {
                  buyTokenId: buyToken.id,
                  sellTokenId: sellToken.id,
                  priceNumerator: buyAmount,
                  priceDenominator: sellAmount,
                  networkId,
                  userAddress,
                  sellToken,
                  validFromWithBatchID,
                  validUntilWithBatchID,
                },
                {
                  ...DEFAULT_FORM_STATE,
                  price,
                  priceInverse: invertPriceFromString(price),
                  validFrom: undefined,
                  validUntil: isNever ? undefined : formatTimeToFromBatch(validUntil, 'TIME').toString(),
                },
              )
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
              return savePendingTransactionsAndResetForm(
                txHash,
                {
                  buyTokenId: buyToken.id,
                  sellTokenId: sellToken.id,
                  priceNumerator: buyAmount,
                  priceDenominator: sellAmount,
                  networkId,
                  userAddress,
                  validFromWithBatchID,
                  validUntilWithBatchID,
                },
                {
                  ...DEFAULT_FORM_STATE,
                  price,
                  priceInverse: invertPriceFromString(price),
                  validFrom: formatTimeToFromBatch(validFrom, 'TIME').toString(),
                  validUntil: isNever ? undefined : formatTimeToFromBatch(validUntil, 'TIME').toString(),
                },
              )
            },
          },
        }))
      }
      if (success && pendingTxHash) {
        // remove pending tx
        dispatch(removePendingOrdersAction({ networkId, pendingTxHash, userAddress }))
      }
    },
    [dispatch, placeMultipleOrders, placeOrder, savePendingTransactionsAndResetForm, setIsSubmitting],
  )

  async function onSubmit(data: FieldValues): Promise<void> {
    const buyAmount = parseAmount(data[receiveInputId], receiveToken.decimals)
    const sellAmount = parseAmount(data[sellInputId], sellToken.decimals)
    const price = data[priceInputId]
    // Minutes - then divided by 5min for batch length to get validity time
    // 0 validUntil time  = unlimited order
    // TODO: review this line
    const validFromAsBatch = formatTimeToFromBatch(data[validFromId], 'BATCH')
    const validUntilAsBatch = formatTimeToFromBatch(data[validUntilId], 'BATCH')
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)

    // Do not let potential null values through
    if (!buyAmount || !sellAmount || !cachedBuyToken || !cachedSellToken || !networkId) return
    const orderParams = {
      price,
      validFrom: validFromAsBatch,
      validUntil: validUntilAsBatch,
      sellAmount,
      buyAmount,
      sellToken: cachedSellToken,
      buyToken: cachedBuyToken,
    }
    if (isConnected && userAddress) {
      await _placeOrder({
        ...orderParams,
        networkId,
        userAddress,
      })
    } else {
      // Not connected. Prompt user to connect his wallet
      const walletInfo = await connectWallet()

      // Then place the order if connection was successful
      if (walletInfo && walletInfo.networkId === Network.Mainnet && walletInfo.userAddress) {
        await _placeOrder({
          ...orderParams,
          networkId: walletInfo.networkId,
          userAddress: walletInfo.userAddress,
        })
      }
    }
  }

  const onSelectChangeSellToken = onSelectChangeFactory(setSellToken, receiveTokenBalance)
  const onSelectChangeReceiveToken = onSelectChangeFactory(setReceiveToken, sellTokenBalance)

  const tokenAddressesToAdd: string[] = useMemo(
    () => preprocessTokenAddressesToAdd([sellTokenSymbol, receiveTokenSymbol], networkIdOrDefault),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  ) // no deps, so that we only calc once on mount

  const onTokensAdded = (newTokens: TokenDetails[]): void => {
    const [firstToken, secondToken] = tokenAddressesToAdd
    const sellToken = firstToken && newTokens.find(({ address }) => firstToken.toLowerCase() === address.toLowerCase())
    const receiveToken =
      secondToken && newTokens.find(({ address }) => secondToken.toLowerCase() === address.toLowerCase())

    batchUpdateState(() => {
      if (sellToken) onSelectChangeSellToken(sellToken)
      if (receiveToken) onSelectChangeReceiveToken(receiveToken)
    })
  }

  return (
    <WrappedWidget className={ordersVisible ? '' : 'expanded'}>
      <TokensAdder tokenAddresses={tokenAddressesToAdd} networkId={networkIdOrDefault} onTokensAdded={onTokensAdded} />
      {/* // Toggle Class 'expanded' on WrappedWidget on click of the <OrdersPanel> <button> */}
      <FormContext {...methods}>
        <WrappedForm onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
          {sameToken && <WarningLabel>Tokens cannot be the same!</WarningLabel>}
          <TokenRow
            autoFocus
            selectedToken={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="Sell"
            onSelectChange={onSelectChangeSellToken}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
            tabIndex={1}
            readOnly={false}
          />
          <IconWrapper onClick={swapTokens}>
            <SwitcherSVG />
          </IconWrapper>
          <TokenRow
            selectedToken={receiveTokenBalance}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="Receive at least"
            onSelectChange={onSelectChangeReceiveToken}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={1}
            readOnly
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
      {/* React Forms DevTool debugger */}
      {process.env.NODE_ENV === 'development' &&
        React.createElement(require('react-hook-form-devtools').DevTool, { control: methods.control })}
    </WrappedWidget>
  )
}

export default TradeWidget
