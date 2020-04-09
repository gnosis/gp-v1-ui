import React from 'react'
import { BarWrapper, ProgressStep, ProgressStepText, StepSeparator } from './PoolingWidget.styled'
import { LAST_STEP } from '.'

export interface ProgressBarProps {
  step: number
  stepArray: string[]
}

const stepChecker = (step: number, index: number): boolean => step >= index + 1 && step <= LAST_STEP
const ProgressBar: React.FC<ProgressBarProps> = ({ step, stepArray }) => {
  return (
    <>
      <BarWrapper>
        {stepArray.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <ProgressStep
              data-title={stepName}
              className={stepChecker(step, index) ? 'active' : ''}
              $bgColor={stepChecker(step, index) ? 'var(--color-text-active);' : 'var(--color-text-secondary)'}
            >
              <ProgressStepText>{index + 1}</ProgressStepText>
            </ProgressStep>
            {index + 1 < LAST_STEP && <StepSeparator />}
          </React.Fragment>
        ))}
      </BarWrapper>
    </>
  )
}

export default ProgressBar
