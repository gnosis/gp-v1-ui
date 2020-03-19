import React from 'react'

import { DefineSpreadWrapper } from './DefineSpread.styled'

import InputWithTooltip from '../InputWithTooltip'

import { useFormContext, FieldError } from 'react-hook-form'
import { FormInputError } from 'components/TradeWidget/FormMessage'
import { TooltipWrapper, LongTooltipContainer } from 'components/Tooltip'

interface DefineSpreadProps {
  isSubmitting: boolean
  spread: number
}

const SpreadTooltip = (
  <LongTooltipContainer>
    If, for example, you select DAI and USDC with a spread of 1%, everytime the price of DAI is 1% above USDC you might
    sell your DAI for USDC. If USDC is 1% above DAI (i.e. 1.01), you might sell your USDC for DAI.
  </LongTooltipContainer>
)

const DefineSpread: React.FC<DefineSpreadProps> = ({ isSubmitting }) => {
  const { errors, register } = useFormContext()

  const errorMessage = (errors?.spread as FieldError)?.message

  return (
    <DefineSpreadWrapper>
      <TooltipWrapper as="p" tooltip={SpreadTooltip} offset={0}>
        <strong>Spread %</strong> -{' '}
        <small>percentage you want to sell above $1, and buy below $1 between all selected tokens</small>
      </TooltipWrapper>
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
