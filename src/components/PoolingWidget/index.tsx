import React, { useCallback, useMemo } from 'react'

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

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import useSafeState from 'hooks/useSafeState'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { tokenListApi } from 'api'

import { TokenDetails } from '@gnosis.pm/dex-js'
import { Network } from 'types'

interface ProgressBarProps {
  step: number
  stepArray: string[]
}

const stepChecker = (step: number, index: number): boolean => step >= index + 1 && step <= 4

const ProgressBar: React.FC<ProgressBarProps> = ({ step, stepArray }) => {
  return (
    <>
      <BarWrapper>
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStep $bgColor={stepChecker(step, index) ? 'var(--color-background-progressBar)' : 'lightgrey'}>
              <ProgressStepText $bold={stepChecker(step, index) ? 'bolder' : 'normal'}>{index + 1}</ProgressStepText>
            </ProgressStep>
            {index + 1 < 4 && (
              <StepSeparator
                $bgColor={stepChecker(step, index) ? 'var(--color-background-progressBar)' : 'lightgrey'}
              />
            )}
          </React.Fragment>
        ))}
      </BarWrapper>
      <BarWrapper $minHeight="auto">
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStepText $bold={stepChecker(step, index) ? 'bolder' : 'normal'}>{stepName}</ProgressStepText>
            {index + 1 < 4 && <p />}
          </React.Fragment>
        ))}
      </BarWrapper>
    </>
  )
}

const StepDescription: React.FC = () => (
  <StepDescriptionWrapper>
    <p>Setup your strategy once and allow your funds to be traded on your behalf.</p>
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
    <a href="#">Learn more about strategies</a>
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
        return { title: '2. Define your spread', subtext: '' }
      case 3:
        return { title: '3. Create strategy', subtext: '' }
      case 4:
        return { title: '4. Add funding', subtext: '' }
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

function addRemoveItem(arr: number[], newItem: number): number[] {
  if (!arr.includes(newItem)) return arr.concat(newItem)

  return arr.reduce((acc: number[], item) => {
    if (item === newItem) return acc

    const newAcc = acc.concat(item)
    return newAcc
  }, [])
}

const PoolingInterface: React.FC = () => {
  const [step, setStep] = useSafeState(1)
  const [selectedTokens, setSelectedTokens] = useSafeState<number[]>([])

  const { networkId } = useWalletConnection()
  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet
  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId).filter(({ symbol }) => symbol !== 'WETH'), [
    fallBackNetworkId,
  ])

  const prevStep = (): void => {
    if (step == 1) return

    return setStep(step - 1)
  }
  const nextStep = (): void => {
    if (step == 4) return

    return setStep(step + 1)
  }

  const handleTokenSelect = useCallback(
    ({ id }: Pick<TokenDetails, 'id'>): void => {
      const state = addRemoveItem(selectedTokens, id)
      return setSelectedTokens(state)
    },
    [selectedTokens, setSelectedTokens],
  )

  const restProps = useMemo(
    () => ({
      handleTokenSelect,
      tokens,
      selectedTokens,
    }),
    [handleTokenSelect, selectedTokens, tokens],
  )

  return (
    <Widget>
      <PoolingInterfaceWrapper $width="75vw">
        <h2>New Strategy</h2>
        <ProgressBar step={step} stepArray={['Select Token', 'Define Spread', 'Create Strategy', 'Add Funding']} />
        <StepDescription />
        <StepTitle step={step} />

        {/* Main Components here */}
        <SubComponents step={step} {...restProps} />

        <StepButtonsWrapper>
          <GreySubText>
            Please select at least two tokens to continue{' '}
            {selectedTokens.length >= 2 && <FontAwesomeIcon icon={faCheckCircle} color="green" />}
          </GreySubText>
          <button disabled={step < 2 || selectedTokens.length < 2} onClick={(): void => prevStep()}>
            Back
          </button>
          <button disabled={step >= 4 || selectedTokens.length < 2} onClick={(): void => nextStep()}>
            Continue
          </button>
        </StepButtonsWrapper>
      </PoolingInterfaceWrapper>
    </Widget>
  )
}

export default PoolingInterface
