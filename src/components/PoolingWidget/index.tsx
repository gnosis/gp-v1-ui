/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React, { useCallback, useMemo, useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import { toast } from 'toastify'
import styled from 'styled-components'
import { TokenDetails, ZERO } from '@gnosis.pm/dex-js'
import joi from '@hapi/joi'

import ProgressBar from './ProgressBar'
import { StepDescription } from './StepDecriptors'
import SubComponents from './SubComponents'
import Widget from 'components/Layout/Widget'
import LiquidityButtons from './LiquidityButtons'
import { PoolingInterfaceWrapper } from './PoolingWidget.styled'

import useSafeState from 'hooks/useSafeState'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder, MultipleOrdersOrder } from 'hooks/usePlaceOrder'
import useGlobalState from 'hooks/useGlobalState'
import { useForm, FormContext } from 'react-hook-form'

import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'
import { tokenListApi } from 'api'

import { Network, Receipt } from 'types'

import { maxAmountsForSpread, stringOrNumberResolverFactory } from 'utils'
import { DEFAULT_PRECISION, LIQUIDITY_TOKEN_LIST, INPUT_PRECISION_SIZE } from 'const'

export const FIRST_STEP = 1
export const LAST_STEP = 2

function addRemoveMapItem(map: Map<number, TokenDetails>, newToken: TokenDetails): Map<number, TokenDetails> {
  // Cache map (no mutate)
  const copyMap = new Map(map)
  // Map item doesn't exist? Add that fool in
  if (!copyMap.get(newToken.id)) return copyMap.set(newToken.id, newToken)
  // Else remove that b
  copyMap.delete(newToken.id)
  return copyMap
}

// TODO: Decide the best place to put this. This file is too long already, but feels to specific for utils
export function createOrderParams(tokens: TokenDetails[], spread: number): MultipleOrdersOrder[] {
  // We'll create 2 orders for each pair: SELL_A -> BUY_B and SELL_B -> BUY_A

  // With 2 tokens A, B, we have 1 pair [(A, B)] == 2 orders
  // With 3 tokens A, B, C, we have 3 pairs [(A, B), (A, C), (B, C)] == 6 orders
  // With 4 tokens A, B, C, D, we have 6 pairs [(A, B), (A, C), (A, D), (B, C), (B, D), (C, D)] == 12 orders
  // And so on...
  // The number of orders is equal to num_tokens * (num_tokens -1)
  const orders: MultipleOrdersOrder[] = []

  tokens.forEach(buyToken =>
    tokens.forEach(sellToken => {
      // We don't want to pair a token with itself
      if (buyToken !== sellToken) {
        // calculating buy/sell amounts
        const { buyAmount, sellAmount } = maxAmountsForSpread({
          spread,
          buyTokenPrecision: buyToken.decimals || DEFAULT_PRECISION,
          sellTokenPrecision: sellToken.decimals || DEFAULT_PRECISION,
        })

        orders.push({
          buyToken: buyToken.id,
          sellToken: sellToken.id,
          buyAmount,
          sellAmount,
        })
      }
    }),
  )

  return orders
}

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  font-size: inherit;
  line-height: inherit;
`

interface PoolingFormData<T = string> {
  spread: T
}

const validationSchema = joi.object({
  spread: joi
    .number()
    .positive()
    .precision(INPUT_PRECISION_SIZE)
    .greater(0.0)
    .less(100.0)
    // dont autocast numbers
    // to their required precision, throw instead
    .strict()
    .required(),
})

const numberResolver = stringOrNumberResolverFactory<PoolingFormData>(validationSchema, 'number')

const PoolingInterface: React.FC = () => {
  const [, dispatch] = useGlobalState()
  const [selectedTokensMap, setSelectedTokensMap] = useSafeState<Map<number, TokenDetails>>(new Map())
  const [spread, setSpread] = useSafeState(0.2)
  const [step, setStep] = useSafeState(1)

  const [txHash, setTxHash] = useSafeState('')
  const [txReceipt, setTxReceipt] = useSafeState<Receipt | undefined>(undefined)
  const [txError, setTxError] = useSafeState(undefined)

  const { networkId, userAddress } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const methods = useForm<PoolingFormData>({
    defaultValues: {
      spread: spread.toString(),
    },
    mode: 'onChange',
    validationResolver: numberResolver,
  })
  const { handleSubmit, watch } = methods
  // Watch input and set defaultValue to state spread
  const spreadValue = watch('spread')

  useEffect(() => {
    // only update spread on step 2
    if (step === 2) setSpread(Number(spreadValue))
  }, [setSpread, spreadValue, step])

  const tokens = useMemo(() => {
    return (
      // Get all the tokens for the current network
      tokenListApi
        .getTokens(fallBackNetworkId)
        // Filter out the tokens not in the list
        .filter(({ symbol }) => symbol && LIQUIDITY_TOKEN_LIST.has(symbol))
    )
  }, [fallBackNetworkId])

  const prevStep = useCallback((): void => setStep(step => (step === FIRST_STEP ? step : step - 1)), [setStep])
  const nextStep = useCallback((): void => setStep(step => (step === LAST_STEP ? step : step + 1)), [setStep])

  const { isSubmitting, setIsSubmitting, placeMultipleOrders } = usePlaceOrder()

  const sendTransaction = useCallback(async () => {
    if (!networkId || !userAddress) return
    const orders = createOrderParams(Array.from(selectedTokensMap.values()), spread)
    let pendingTxHash: string | undefined
    try {
      setIsSubmitting(true)
      setTxReceipt(undefined)

      const { receipt } = await placeMultipleOrders({
        networkId,
        userAddress,
        orders,
        txOptionalParams: {
          onSentTransaction: (txHash: string): void => {
            pendingTxHash = txHash

            setTxHash(txHash)

            batchedUpdates(() => {
              orders.forEach(({ buyToken: buyTokenId, sellToken: sellTokenId, buyAmount, sellAmount }) => {
                const pendingOrder = {
                  txHash,
                  id: 'PENDING ORDER',
                  buyTokenId,
                  sellTokenId,
                  priceNumerator: buyAmount,
                  priceDenominator: sellAmount,
                  user: userAddress,
                  remainingAmount: ZERO,
                  sellTokenBalance: ZERO,
                  validFrom: 0,
                  validUntil: 0,
                }

                setIsSubmitting(false)
                dispatch(savePendingOrdersAction({ orders: pendingOrder, networkId, userAddress }))
              })
            })
          },
        },
      })

      setTxReceipt(receipt)
    } catch (e) {
      console.error('[PoolingWidget] Failed to place orders for strategy', e)
      toast.error('Not able to create your orders, please try again')

      // Error handle
      setTxError(e)
    } finally {
      pendingTxHash && dispatch(removePendingOrdersAction({ networkId, pendingTxHash, userAddress }))
    }
  }, [
    dispatch,
    networkId,
    placeMultipleOrders,
    selectedTokensMap,
    setIsSubmitting,
    setTxError,
    setTxHash,
    setTxReceipt,
    spread,
    userAddress,
  ])

  const handleTokenSelect = useCallback(
    (token: TokenDetails): void => {
      const state = addRemoveMapItem(selectedTokensMap, token)
      return setSelectedTokensMap(state)
    },
    [selectedTokensMap, setSelectedTokensMap],
  )

  const restProps = useMemo(
    () => ({
      handleTokenSelect,
      tokens,
      selectedTokensMap,
      spread,
      setSpread,
      txHash,
      txReceipt,
      txError,
      step,
      prevStep,
      nextStep,
      isSubmitting,
    }),
    [
      handleTokenSelect,
      isSubmitting,
      nextStep,
      prevStep,
      selectedTokensMap,
      setSpread,
      spread,
      step,
      tokens,
      txError,
      txHash,
      txReceipt,
    ],
  )
  return (
    <Widget>
      <PoolingInterfaceWrapper $width="100%">
        <FormContext {...methods}>
          <form onSubmit={handleSubmit(sendTransaction)} noValidate>
            <h2>New Liquidity Order</h2>
            <ProgressBar step={step} stepArray={['Select Tokens', 'Define Spread & Review']} />

            <ContentWrapper>
              <StepDescription step={step} />
              {/* Main Components here */}
              <SubComponents step={step} {...restProps} />
            </ContentWrapper>

            {/* BUTTONS */}
            <LiquidityButtons
              handleSubmit={handleSubmit(sendTransaction)}
              disableBack={step < FIRST_STEP + 1 || selectedTokensMap.size < 2 || isSubmitting || !!txHash}
              disableContinue={(step > FIRST_STEP && !methods.formState.isValid) || selectedTokensMap.size < 2}
              disableSubmit={!!txHash || isSubmitting}
              showContinue={step !== LAST_STEP}
              showFinish={!!txReceipt}
              showLoader={isSubmitting || !!(txHash && !txReceipt)}
              showTooltipHover={selectedTokensMap.size < 2}
              {...restProps}
            />
          </form>
        </FormContext>
      </PoolingInterfaceWrapper>
    </Widget>
  )
}

export default PoolingInterface
