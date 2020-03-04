import { ValidationResult, ValidationError, ObjectSchema } from '@hapi/joi'

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

export const resolverFactory = (type: string, validationSchema: ObjectSchema<unknown>) => (
  data: FormData,
): { values: ValidationResult; errors: ValidationError | {} } => {
  const castedData =
    type === 'number'
      ? Object.keys(data).reduce((acc, key) => {
          const oldValue = data[key]
          const castedValue = Number(oldValue)
          const castedObj = { ...acc, [key]: castedValue }

          return castedObj
        }, {})
      : data

  const { error, value: values } = validationSchema.validate(castedData)

  return {
    values: error ? {} : values,
    errors: error
      ? error.details.reduce((previous, currentError) => {
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {})
      : {},
  }
}
