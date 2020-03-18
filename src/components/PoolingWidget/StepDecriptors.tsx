import React, { useMemo } from 'react'
import { StepDescriptionWrapper, ProgressStepText } from './PoolingWidget.styled'
import { ProgressBarProps } from './ProgressBar'

import checkIcon from 'assets/img/li-check.svg'

export const StepDescription: React.FC<Pick<ProgressBarProps, 'step'>> = ({ step }) => (
  <StepDescriptionWrapper>
    <StepTitle step={step} />
  </StepDescriptionWrapper>
)

export const StepTitle: React.FC<Pick<ProgressBarProps, 'step'>> = ({ step }) => {
  const { title, subtext }: { title: string; subtext?: string } = useMemo(() => {
    switch (step) {
      case 1:
        // TODO: Add Link
        // https://github.com/gnosis/dex-react/issues/615
        return {
          title: '1. Select at least two of your trusted stablecoins',
          subtext: `<p>Select two or more stablecoins you want to include in your liquidity provision and you believe are worth $1</p>
            <p>Set your liquidity provision strategy once and allow your funds to market make.</p>
            <ul>
              <li><img src=${checkIcon} />No maintenance needed</li>
              <li><img src=${checkIcon} />No gas costs for trades</li>
              <li><img src=${checkIcon} />Cancellation possible at any time</li>
            </ul>
            <p class="not-implemented">            
              <a href="#" target="_blank" rel="noopener">Learn more about liquidity provision.</a>
            </p>`,
        }
      case 2:
        // TODO: Add Link
        // https://github.com/gnosis/dex-react/issues/615
        return {
          title: '2. Define your spread and review:',
          subtext: `
            <p>While you can create orders for tokens without having an exchange balance, <u>these orders can only be executed</u> if any deposited balance is available in the <b>exchange wallet</b>.</p>
            <p>Once the transaction is mined, please review the balances for your selected liquidity order tokens.</p>
            <p>Unlock and deposit any amount for these tokens so the liquidity order trades can be executed.</p>
            <p><b>Only orders that have a deposited balance in the Exchange Wallet will be matched.</b></p>
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
