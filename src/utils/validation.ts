import { ValidationError, ObjectSchema } from '@hapi/joi'
import { ValidationResolver } from 'react-hook-form'
import { validInputPattern } from 'utils'

export function preventInvalidChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    !validInputPattern.test(event.currentTarget.value + event.key) &&
    validInputPattern.test(event.currentTarget.value)
  ) {
    event.preventDefault()
  }
}

export function validatePositive(value: string, constraint = 0): true | string {
  return Number(value) > constraint || 'Invalid amount'
}

interface FormDataAsNumbers {
  [key: string]: number
}

/**
 * @name stringOrNumberResolverFactory
 * @description Factory function for form resolver using JOI validation
 * @param validationSchema joi.ObjectSchema<unknown> - Joi schema to check data
 * @param type [OPTIONAL] 'number' | undefined - sets casting use or straight FormData use
 */
export const stringOrNumberResolverFactory = <FormData, CustomContext = {}>(
  validationSchema: ObjectSchema<unknown>,
  type?: 'number',
) => (data: FormData): ReturnType<ValidationResolver<FormData, CustomContext>> => {
  const castedData: FormDataAsNumbers | FormData =
    type === 'number'
      ? Object.keys(data).reduce<FormDataAsNumbers>((acc, key) => {
          const oldValue = data[key]
          const castedValue = Number(oldValue)
          const castedObj = { ...acc, [key]: castedValue }

          return castedObj
        }, {})
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
        }, {})
      : {},
  }
}

export function formatSchemaErrorMessage(errorString?: string): string | undefined {
  if (!errorString) return undefined
  const cleanedString = errorString.replace(/"/g, '')
  return cleanedString[0].toUpperCase() + cleanedString.slice(1)
}
