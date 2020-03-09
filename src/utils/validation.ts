import { ValidationError, ObjectSchema } from '@hapi/joi'
import { ValidationResolver } from 'react-hook-form'

export const validInputPattern = new RegExp(/^\d+\.?\d*$/) // allows leading and trailing zeros

export function preventInvalidChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    !validInputPattern.test(event.currentTarget.value + event.key)
  ) {
    event.preventDefault()
  }
}

export function validatePositive(value: string, constraint = 0): true | string {
  return Number(value) > constraint || 'Invalid amount'
}

export const resolverFactory = <D, CustomContext = {}>(type: string, validationSchema: ObjectSchema<unknown>) => (
  data: D,
): ReturnType<ValidationResolver<D, CustomContext>> => {
  const castedData: D =
    type === 'number'
      ? Object.keys(data).reduce((acc, key) => {
          const oldValue = data[key]
          const castedValue = Number(oldValue)
          const castedObj: D = { ...acc, [key]: castedValue }

          return castedObj
        }, {} as D)
      : data

  const { error, value }: { value: typeof castedData | undefined; error?: ValidationError } = validationSchema.validate(
    castedData,
  )

  return {
    values: error || !value ? {} : data,
    errors: error
      ? error.details.reduce((previous, currentError) => {
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {} as ValidationError)
      : {},
  }
}
