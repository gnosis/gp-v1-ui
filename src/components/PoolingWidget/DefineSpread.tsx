import React from 'react'

import { DefineSpreadWrapper } from './DefineSpread.styled'

import InputWithTooltip from '../InputWithTooltip'

import { useFormContext, FieldError } from 'react-hook-form'
import { FormInputError } from 'components/TradeWidget/FormMessage'

interface DefineSpreadProps {
  isSubmitting: boolean
  spread: number
}

const DefineSpread: React.FC<DefineSpreadProps> = ({ isSubmitting }) => {
  const { errors, register } = useFormContext()

  const errorMessage = (errors?.spread as FieldError)?.message

  return (
    <DefineSpreadWrapper>
      <p>
        <strong>Spread %</strong> -{' '}
        <small>percentage you want to sell above $1, and buy below $1 between all selected tokens</small>
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
