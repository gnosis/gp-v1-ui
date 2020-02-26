import React, { useCallback, useMemo } from 'react'
import { toast } from 'toastify'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

import styled from 'styled-components'

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
} from './PoolingWidget.styled'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import checkIcon from 'assets/img/li-check.svg'

import useSafeState from 'hooks/useSafeState'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder, MultipleOrdersOrder } from 'hooks/usePlaceOrder'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'

import { tokenListApi } from 'api'

import { TokenDetails, ZERO } from '@gnosis.pm/dex-js'
import { Network, Receipt } from 'types'

import { maxAmountsForSpread } from 'utils'
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
              data-title={stepName}
              className={stepChecker(step, index) ? 'active' : ''}
              $bgColor={stepChecker(step, index) ? '#218DFF;' : '#9FB4C9'}
            >
              <ProgressStepText>{index + 1}</ProgressStepText>
            </ProgressStep>
            {index + 1 < 3 && <StepSeparator />}
          </React.Fragment>
        ))}
      </BarWrapper>
    </>
  )
}

const StepDescription: React.FC<Pick<ProgressBarProps, 'step'>> = ({ step }) => (
  <StepDescriptionWrapper>
    <StepTitle step={step} />
  </StepDescriptionWrapper>
)

const StepTitle: React.FC<Pick<ProgressBarProps, 'step'>> = ({ step }) => {
  const { title, subtext }: { title: string; subtext?: string } = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: '1. Select at least two of your trusted stablecoins',
          subtext: `<p>Select two or more stablecoins you want to include in your liquidity provision and you believe are worth $1</p>
          <p>Setup your liquidity provision once and allow your funds to be traded on your behalf.</p>
          <ul>
            <li><img src=${checkIcon} />No maintenance needed</li>
            <li><img src=${checkIcon} />No gas costs for trades</li>
            <li><img src=${checkIcon} />Cancellation possible at any time</li>
          </ul>
          <p>
            <a href="#" target="_blank" rel="noopener">Learn more about liquidity provision.</a>
          </p>`,
        }
      case 2:
        return {
          title: '2. Define your spread',
          subtext: `<p>The spread defines the percentage you want to sell above $1, and buy below $1 between all selected tokens</p>
          <p><a href="#" target="_blank" rel="noopener">Learn more about the spread.</a></p>
          `,
        }
      case 3:
        return {
          title: '3. New liquidity summary:',
          subtext: `
            <p>While you can create orders for tokens without having an exchange balance, <u>these orders can only be executed</u> if any deposited balance is available in the <b>exchange wallet</b>, to be found under menu option 'Balances'.</p>
            <p>Once the transaction is mined, please review the balances for your selected liquidity order tokens.</p>
            <p>Unlock and deposit any amount for these tokens so the liquidity order trades can be executed.</p>
            <p><b>The exchange only uses your fully available exchange balance to execute trades.</b></p>
          `,
        }
      default:
        return { title: 'An error occurred, please try again' }
    }
  }, [step])

  return (
    <div>
      <ProgressStepText as="h2">{title}</ProgressStepText>
      {subtext && <div className="liqContent" dangerouslySetInnerHTML={{ __html: subtext }} />}
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

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row wrap;
`

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

  const { isSubmitting, setIsSubmitting, placeMultipleOrders } = usePlaceOrder()

  const sendTransaction = useCallback(async () => {
    if (!networkId || !userAddress) return
    const orders = createOrderParams(Array.from(selectedTokensMap.values()), spread)
    let pendingTxHash: string | undefined
    try {
      setIsSubmitting(true)
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

                setIsSubmitting(false)
                dispatch(savePendingOrdersAction({ orders: newTxState, networkId, userAddress }))
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
    }),
    [handleTokenSelect, selectedTokensMap, setSpread, spread, tokens, txError, txHash, txReceipt],
  )

  return (
    <Widget>
      <PoolingInterfaceWrapper $width="100%">
        <h2>New Liquidity Order</h2>
        <ProgressBar step={step} stepArray={['Select Tokens', 'Define Spread', 'Create Liquidity']} />

        <ContentWrapper>
          <StepDescription step={step} />
          {/* Main Components here */}
          <SubComponents step={step} {...restProps} />
        </ContentWrapper>
        <StepButtonsWrapper>
          {/* REMOVE BACK BUTTON ON TXRECEIPT */}
          {!txReceipt && (
            <button
              type="button"
              disabled={step < 2 || selectedTokensMap.size < 2 || isSubmitting}
              onClick={(): void => prevStep()}
            >
              Back
            </button>
          )}
          {/* // REGULAR CONTINUE BUTTONS (STEPS 1 & 2) */}
          {step !== 3 ? (
            <button type="button" disabled={selectedTokensMap.size < 2} onClick={(): void => nextStep()}>
              Continue
            </button>
          ) : // STEP 3 - TXRECEIPT OR NOT?
          txReceipt ? (
            // TX RCEIPT SUCCESS
            <Link to="/wallet" className="finish">
              Finish and go to Balances
            </Link>
          ) : (
            // NOT YET SUBMITTED TX
            <button type="button" className="finish" onClick={sendTransaction} disabled={!!txReceipt || isSubmitting}>
              {isSubmitting && <FontAwesomeIcon icon={faSpinner} spin={isSubmitting} />}Submit transaction
            </button>
          )}
        </StepButtonsWrapper>
      </PoolingInterfaceWrapper>
    </Widget>
  )
}

export default PoolingInterface
