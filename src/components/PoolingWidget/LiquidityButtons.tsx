import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import { SubComponentProps } from './SubComponents'
import { StepButtonsWrapper } from './PoolingWidget.styled'

interface LiquidityButtonsProps extends Pick<SubComponentProps, 'step' | 'txReceipt' | 'nextStep' | 'isSubmitting'> {
  disableBack: boolean
  disableContinue: boolean
  disableSubmit: boolean
  showBack: boolean
  showContinue: boolean
  showFinish: boolean
  showLoader: boolean
  prevStep: () => void
  handleSubmit: () => Promise<void>
}

const LiquidityButtons: React.FC<LiquidityButtonsProps> = ({
  nextStep,
  prevStep,
  handleSubmit,
  disableBack,
  disableContinue,
  disableSubmit,
  showBack,
  showContinue,
  showFinish,
  showLoader,
}) => (
  <StepButtonsWrapper>
    {/* REMOVE BACK BUTTON ON LAST STEP (TX CONFIRMATION) */}
    {showBack && (
      <button type="button" id="backButton" disabled={disableBack} onClick={(): void => prevStep()}>
        Back
      </button>
    )}
    {/* REGULAR CONTINUE BUTTON (STEP 1) */}
    {showContinue ? (
      <button type="button" disabled={disableContinue} onClick={(): void => nextStep()}>
        Continue
      </button>
    ) : // LAST STEP - TXRECEIPT OR NOT?
    showFinish ? (
      // TX RCEIPT SUCCESS
      <Link to="/wallet" className="finish">
        Finish and go to Balances
      </Link>
    ) : (
      // NOT YET SUBMITTED TX
      <button type="button" className="finish" onClick={handleSubmit} disabled={disableSubmit}>
        {showLoader && <FontAwesomeIcon icon={faSpinner} spin />}Submit transaction
      </button>
    )}
  </StepButtonsWrapper>
)

export default LiquidityButtons
