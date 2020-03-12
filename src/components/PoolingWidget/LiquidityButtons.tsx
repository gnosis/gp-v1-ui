import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import { SubComponentProps } from './SubComponents'
import { StepButtonsWrapper } from './PoolingWidget.styled'
import { LAST_STEP } from '.'

interface LiquidityButtonsProps extends Pick<SubComponentProps, 'step' | 'txReceipt' | 'nextStep' | 'isSubmitting'> {
  disableBack: boolean
  disableContinue: boolean
  disableSubmit: boolean
  prevStep: () => void
  handleSubmit: () => Promise<void>
}

const LiquidityButtons: React.FC<LiquidityButtonsProps> = ({
  isSubmitting,
  nextStep,
  prevStep,
  step,
  disableBack,
  disableContinue,
  disableSubmit,
  handleSubmit,
  txReceipt,
}) => (
  <StepButtonsWrapper>
    {/* REMOVE BACK BUTTON ON LAST STEP (TX CONFIRMATION) */}
    {step !== LAST_STEP && (
      <button type="button" disabled={disableBack} onClick={(): void => prevStep()}>
        Back
      </button>
    )}
    {/* REGULAR CONTINUE BUTTON (STEP 1) */}
    {step !== LAST_STEP ? (
      <button type="button" disabled={disableContinue} onClick={(): void => nextStep()}>
        Continue
      </button>
    ) : // LAST STEP - TXRECEIPT OR NOT?
    txReceipt ? (
      // TX RCEIPT SUCCESS
      <Link to="/wallet" className="finish">
        Finish and go to Balances
      </Link>
    ) : (
      // NOT YET SUBMITTED TX
      <button type="button" className="finish" onClick={handleSubmit} disabled={disableSubmit}>
        {isSubmitting && <FontAwesomeIcon icon={faSpinner} spin={isSubmitting} />}Submit transaction
      </button>
    )}
  </StepButtonsWrapper>
)

export default LiquidityButtons
