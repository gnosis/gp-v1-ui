import React, { useCallback } from 'react'

import { DefineSpreadWrapper } from './DefineSpread.styled'

import InputWithTooltip from '../InputWithTooltip'

import { useFormContext, FieldError } from 'react-hook-form'

function formatErrorMessage(errorString: string): string {
  const cleanedString = errorString.replace(/"/g, '')
  return cleanedString[0].toUpperCase() + cleanedString.slice(1)
}

interface DefineSpreadProps {
  isSubmitting: boolean
  spread: number
}

const DefineSpread: React.FC<DefineSpreadProps> = ({ isSubmitting }) => {
  const { errors, register } = useFormContext()

  const onKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }, [])

  const errorMessage = (errors?.spread as FieldError)?.message

  return (
    <DefineSpreadWrapper>
      <p>
        <strong>Spread %</strong> -{' '}
        <small>percentage you want to sell above $1, and buy below $1 between all selected tokens</small>
      </p>
      <InputWithTooltip
        name="spread"
        type="number"
        step={0.1}
        disabled={isSubmitting}
        ref={register}
        onKeyPress={onKeyPress}
        tooltip={(errorMessage && formatErrorMessage(errorMessage)) || 'Value between 0 and 100, not inclusive'}
        showErrorStyle={!!errorMessage}
      />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread
