import React from 'react'

import Widget from 'components/Layout/Widget'
import useSafeState from 'hooks/useSafeState'
import {
  BarWrapper,
  StepSeparator,
  PoolingInterfaceWrapper,
  ProgressStep,
  ProgressStepText,
} from './PoolingWidget.styled'

interface ProgressBarProps {
  step: number
}

const stepArray = ['Select Token', 'Define Spread', 'Create Strategy', 'Add Funding']
const stepChecker = (step: number, index: number): boolean => step >= index + 1 && step <= 4

const ProgressBar: React.FC<ProgressBarProps> = ({ step }) => {
  return (
    <>
      <BarWrapper>
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStep $bgColor={stepChecker(step, index) ? 'lightskyblue' : 'lightgrey'}>
              <ProgressStepText $bold={stepChecker(step, index) ? 'bolder' : 'normal'}>{index + 1}</ProgressStepText>
            </ProgressStep>
            {index + 1 < 4 && <StepSeparator $bgColor={stepChecker(step, index) ? 'lightskyblue' : 'lightgrey'} />}
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

const PoolingInterface: React.FC = () => {
  const [step, setStep] = useSafeState(1)

  const prevStep = (): void => {
    if (step == 1) return

    return setStep(step - 1)
  }
  const nextStep = (): void => {
    if (step == 4) return

    return setStep(step + 1)
  }

  return (
    <Widget>
      <PoolingInterfaceWrapper $width="75vw">
        <h2>New Strategy</h2>
        <ProgressBar step={step} />
        {/* Main Components here */}
        <div>
          <button disabled={step < 2} onClick={(): void => prevStep()}>
            Back
          </button>
          <button disabled={step >= 4} onClick={(): void => nextStep()}>
            Continue
          </button>
        </div>
      </PoolingInterfaceWrapper>
    </Widget>
  )
}

export default PoolingInterface
