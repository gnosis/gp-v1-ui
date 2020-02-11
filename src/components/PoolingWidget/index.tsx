import React, { useCallback, useMemo } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'
import { toast } from 'react-toastify'

import SubComponents from './SubComponents'
import Widget from 'components/Layout/Widget'
import {
  BarWrapper,
  StepSeparator,
  PoolingInterfaceWrapper,
  ProgressStep,
  ProgressStepText,
  StepDescriptionWrapper,
  StepButtonsWrapper,
  GreySubText,
} from './PoolingWidget.styled'

import { faCheckCircle, faSpinner, faPaperPlane, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import useSafeState from 'hooks/useSafeState'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder, MultipleOrdersOrder } from 'hooks/usePlaceOrder'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'

import { tokenListApi } from 'api'

import { TokenDetails, ZERO } from '@gnosis.pm/dex-js'
import { Network, Receipt } from 'types'

import { maxAmountsForSpread, log } from 'utils'
import { DEFAULT_PRECISION } from 'const'
import { Link } from 'react-router-dom'

const LIQUIDITY_TOKEN_LIST = new Set(['USDT', 'TUSD', 'USDC', 'PAX', 'GUSD', 'DAI', 'sUSD'])

interface ProgressBarProps {
  step: number
  stepArray: string[]
}

const stepChecker = (step: number, index: number): boolean => step >= index + 1 && step <= 3

const ProgressBar: React.FC<ProgressBarProps> = ({ step, stepArray }) => {
  return (
    <>
      <BarWrapper>
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStep
              $bgColor={stepChecker(step, index) ? 'var(--color-background-progressBar)' : 'var(--color-background)'}
            >
              <ProgressStepText $bold={stepChecker(step, index) ? 'bolder' : 'normal'}>{index + 1}</ProgressStepText>
            </ProgressStep>
            {index + 1 < 3 && (
              <StepSeparator
                $bgColor={stepChecker(step, index) ? 'var(--color-background-progressBar)' : 'var(--color-background)'}
              />
            )}
          </React.Fragment>
        ))}
      </BarWrapper>
      <BarWrapper $minHeight="auto">
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStepText $bold={stepChecker(step, index) ? 'bolder' : 'normal'}>{stepName}</ProgressStepText>
            {index + 1 < 3 && <p />}
          </React.Fragment>
        ))}
      </BarWrapper>
    </>
  )
}

const StepDescription: React.FC = () => (
  <StepDescriptionWrapper>
    <p>Setup your liquidity provision once and allow your funds to be traded on your behalf.</p>
    <ul>
      <li>
        <FontAwesomeIcon icon={faCheckCircle} />
        No maintenance needed
      </li>
      <li>
        <FontAwesomeIcon icon={faCheckCircle} />
        No gas costs for trades
      </li>
      <li>
        <FontAwesomeIcon icon={faCheckCircle} />
        Cancellation possible at any time
      </li>
    </ul>
    {/*
    TODO: add URL 
    <a href="#">Learn more about liquidity provision</a>
    */}
  </StepDescriptionWrapper>
)

const StepTitle: React.FC<Pick<ProgressBarProps, 'step'>> = ({ step }) => {
  const { title, subtext }: { title: string; subtext?: string } = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: '1. Select your trusted stablecoins',
          subtext:
            'Select two or more stablecoins you want to include in your liquidity provision and you believe are worth $1',
        }
      case 2:
        return {
          title: '2. Define your spread',
          subtext:
            'The spread defines the percentage you want to sell above $1, and buy below $1 between all selected tokens',
        }
      case 3:
        return { title: '3. Create liquidity', subtext: '' }
      default:
        return { title: 'An error occurred, please try again' }
    }
  }, [step])

  return (
    <div>
      <ProgressStepText as="h2" $bold="bolder">
        {title}
      </ProgressStepText>
      {subtext && <GreySubText $justify="flex-start">{subtext}</GreySubText>}
    </div>
  )
}

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

  const tokens = useMemo(() => {
    return (
      // Get all the tokens for the current network
      tokenListApi
        .getTokens(fallBackNetworkId)
        // Filter out the tokens not in the list
        .filter(({ symbol }) => symbol && LIQUIDITY_TOKEN_LIST.has(symbol))
    )
  }, [fallBackNetworkId])

  const prevStep = useCallback((): void => {
    if (step == 1) return

    return setStep(step - 1)
  }, [setStep, step])
  const nextStep = useCallback((): void => {
    if (step == 3) return

    return setStep(step + 1)
  }, [setStep, step])

  const { isSubmitting, placeMultipleOrders } = usePlaceOrder()

  const sendTransaction = useCallback(async () => {
    if (!networkId || !userAddress) return
    const orders = createOrderParams(Array.from(selectedTokensMap.values()), spread)
    let pendingTxHash: string | undefined
    try {
      setTxReceipt(undefined)

      const { receipt } = await placeMultipleOrders({
        orders,
        txOptionalParams: {
          onSentTransaction: (txHash: string): void => {
            pendingTxHash = txHash
            setTxHash(txHash)

            unstable_batchedUpdates(() => {
              orders.forEach(({ buyToken: buyTokenId, sellToken: sellTokenId, buyAmount, sellAmount }) => {
                const newTxState = {
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

                dispatch(savePendingOrdersAction({ orders: newTxState, networkId, userAddress }))
              })
            })
          },
        },
      })

      setTxReceipt(receipt)
    } catch (e) {
      log('Failed to place orders for strategy', e)
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
    }),
    [handleTokenSelect, selectedTokensMap, setSpread, spread, tokens, txError, txHash, txReceipt],
  )

  return (
    <Widget>
      <PoolingInterfaceWrapper $width="75vw">
        <h2>New Liquidity</h2>
        <ProgressBar step={step} stepArray={['Select Tokens', 'Define Spread', 'Create Liquidity']} />
        <StepDescription />
        <StepTitle step={step} />

        {/* Main Components here */}
        <SubComponents step={step} {...restProps} />

        <StepButtonsWrapper>
          {/* REMOVE BACK BUTTON ON TXRECEIPT */}
          {!txReceipt && (
            <button disabled={step < 2 || selectedTokensMap.size < 2 || isSubmitting} onClick={(): void => prevStep()}>
              Back
            </button>
          )}
          {/* // REGULAR CONTINUE BUTTONS (STEPS 1 & 2) */}
          {step !== 3 ? (
            <button disabled={selectedTokensMap.size < 2} onClick={(): void => nextStep()}>
              Continue
            </button>
          ) : // STEP 3 - TXRECEIPT OR NOT?
          txReceipt ? (
            // TX RCEIPT SUCCESS
            <Link to="/wallet">
              <button className="success">
                <FontAwesomeIcon icon={faFlagCheckered} /> Finish and go to Wallet
              </button>
            </Link>
          ) : (
            // NOT YET SUBMITTED TX
            <button className="success" onClick={sendTransaction} disabled={!!txReceipt || isSubmitting}>
              <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPaperPlane} spin={isSubmitting} /> Send transaction
            </button>
          )}
        </StepButtonsWrapper>
      </PoolingInterfaceWrapper>
    </Widget>
  )
}

export default PoolingInterface
