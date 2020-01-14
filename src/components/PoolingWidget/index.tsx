import React from 'react'
import styled from 'styled-components'

import Widget from 'components/Layout/Widget'
import PageWrapper from 'components/Layout/PageWrapper'
import { RESPONSIVE_SIZES } from 'const'
import useSafeState from 'hooks/useSafeState'

const PoolingInterfaceWrapper = styled(PageWrapper)`
  display: flex;
  flex-flow: column nowrap;

  align-items: center;

  > h2:first-child {
    margin-right: auto;
  }
`

const ProgressStep = styled.div<{ $bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100%;
  font-size: xx-large;
  font-weight: bolder;

  background: ${({ $bgColor = 'lightgrey' }): string => $bgColor};
`

const StepSeparator = styled.div<{ $bgColor?: string }>`
  align-self: center;
  height: 1rem;

  background: ${({ $bgColor = 'lightgrey' }): string => $bgColor};
`

const BarWrapper = styled.div<{ $bgColor?: string; $minHeight?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: space-evenly;

  margin: 0.7rem auto;
  min-height: ${({ $minHeight = '5vw' }): string => $minHeight};
  min-width: 35vw;

  > * {
    display: flex;
    flex: 1;

    text-align: center;
  }

  > p,
  ${StepSeparator} {
    margin: 0 -0.1rem;
    white-space: nowrap;
  }

  > ${ProgressStep}, ${StepSeparator} {
    transition: all 0.7s ease-in-out;
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.WEB}em) {
    min-height: 7.143vw;
    min-width: 50vw;

    > p {
      white-space: normal;
    }
  }
`

interface ProgressBarProps {
  step: number
}

const stepArray = ['Select Token', 'Define Spread', 'Create Strategy', 'Add Funding']

const ProgressBar: React.FC<ProgressBarProps> = ({ step }) => {
  return (
    <>
      <BarWrapper>
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStep $bgColor={step >= index + 1 && step <= 4 ? 'lightskyblue' : 'lightgrey'}>
              {index + 1}
            </ProgressStep>
            {index + 1 < 4 && (
              <StepSeparator $bgColor={step >= index + 1 && step <= 4 ? 'lightskyblue' : 'lightgrey'} />
            )}
          </React.Fragment>
        ))}
      </BarWrapper>
      <BarWrapper $minHeight="auto">
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <p>{stepName}</p>
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
