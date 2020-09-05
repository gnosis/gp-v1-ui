import React from 'react'
import { Link } from 'react-router-dom'

// component
import { TooltipWrapper } from 'components/Tooltip'
import { Spinner } from 'components/atoms/Spinner'

// PoolingWidget
import { SubComponentProps } from 'components/PoolingWidget/SubComponents'
import { StepButtonsWrapper } from 'components/PoolingWidget/PoolingWidget.styled'

interface LiquidityButtonsProps extends Pick<SubComponentProps, 'step' | 'txReceipt' | 'nextStep' | 'isSubmitting'> {
  disableBack: boolean
  disableContinue: boolean
  disableSubmit: boolean
  showContinue: boolean
  showFinish: boolean
  showLoader: boolean
  showTooltipHover: boolean
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
  showContinue,
  showFinish,
  showLoader,
  showTooltipHover,
}) => (
  <StepButtonsWrapper>
    {/* REMOVE BACK BUTTON ON LAST STEP (TX CONFIRMATION) */}
    <button type="button" id="backButton" disabled={disableBack} onClick={(): void => prevStep()}>
      Back
    </button>
    {/* REGULAR CONTINUE BUTTON (STEP 1) */}
    {showContinue ? (
      <TooltipWrapper hover={showTooltipHover} tooltip="Please select at least 2 tokens to continue">
        <button type="button" disabled={disableContinue} onClick={(): void => nextStep()}>
          Continue
        </button>
      </TooltipWrapper>
    ) : // LAST STEP - TXRECEIPT OR NOT?
    showFinish ? (
      // TX RCEIPT SUCCESS
      <Link to="/wallet" className="finish">
        Finish and go to Balances
      </Link>
    ) : (
      // NOT YET SUBMITTED TX
      <button type="button" className="finish" onClick={handleSubmit} disabled={disableSubmit}>
        {showLoader && <Spinner />}Submit transaction
      </button>
    )}
  </StepButtonsWrapper>
)

export default LiquidityButtons
