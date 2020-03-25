import React from 'react'

import { DefineSpreadWrapper } from './DefineSpread.styled'

import InputWithTooltip from '../InputWithTooltip'

import { useFormContext, FieldError } from 'react-hook-form'
import { FormInputError } from 'components/TradeWidget/FormMessage'
import { HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'

interface DefineSpreadProps {
  isSubmitting: boolean
  spread: number
}

const SpreadTooltip = (
  <HelpTooltipContainer>
    <p>If, for example, you select DAI and USDC with a spread of 1%</p>
    <p>Everytime the price of DAI is 1% above USDC (i.e. 1.01), you might sell DAI for USDC.</p>
    <p>Everytime the price of DAI is 1% below USDC (i.e. 0.99), you might buy DAI for USDC.</p>
  </HelpTooltipContainer>
)

const DefineSpread: React.FC<DefineSpreadProps> = ({ isSubmitting }) => {
  const { errors, register } = useFormContext()

  const errorMessage = (errors?.spread as FieldError)?.message

  return (
    <DefineSpreadWrapper>
      <p>
        <strong>Spread %</strong> -{' '}
        <small>percentage you want to sell above $1, and buy below $1 between all selected tokens</small>{' '}
        <HelpTooltip tooltip={SpreadTooltip} />
      </p>
      <InputWithTooltip
        className={errorMessage ? 'error' : ''}
        name="spread"
        type="number"
        step="0.1"
        disabled={isSubmitting}
        ref={register}
        tooltip="Value between 0 and 100, not inclusive"
      />
      <FormInputError errorMessage={errorMessage} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread
