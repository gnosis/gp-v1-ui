import { useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { adjustPrecision, formatPartialNumber, preventInvalidChars } from 'utils'
import { TradeFormData } from '.'

interface Params {
  inputId: string
  precision: number
}

interface Result {
  removeExcessZeros: (event: React.SyntheticEvent<HTMLInputElement, Event>) => void
  enforcePrecision: () => void
  onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export function useNumberInput(params: Params): Result {
  const { inputId, precision } = params
  const { setValue, watch } = useFormContext<TradeFormData>()
  const inputValue = watch(inputId) as string

  const enforcePrecision = useCallback(() => {
    const newValue = adjustPrecision(inputValue, precision)
    if (inputValue !== newValue) {
      setValue(inputId, newValue, true)
    }
  }, [inputId, inputValue, precision, setValue])

  useEffect(enforcePrecision, [enforcePrecision])

  const removeExcessZeros = useCallback(
    (event: React.SyntheticEvent<HTMLInputElement>): void => {
      // Q: Why do we need this function instead of relying on `preventInvalidChars` or `enforcePrecision`?
      // A: Because on those functions we still want the user to be able to input partial values. E.g.:
      //    0 -> 0. -> 0.1 -> 0.10 -> 0.105
      //    When losing focus though (`onBlur`), we remove everything that's redundant, such as leading zeros,
      //    trailing dots and/or zeros
      // Q: Why not use formatAmount/parseAmount that already take care of this?
      // A: Too many steps (convert to and from BN) and binds the function to selectedToken.decimals

      const { value } = event.currentTarget
      const newValue = formatPartialNumber(value)

      if (value != newValue) {
        setValue(inputId, newValue, true)
      }
    },
    [inputId, setValue],
  )

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void =>
      event.key === 'Enter' ? removeExcessZeros(event) : preventInvalidChars(event),
    [removeExcessZeros],
  )

  return { onKeyPress, enforcePrecision, removeExcessZeros }
}
