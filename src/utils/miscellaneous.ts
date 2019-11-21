import { TokenDetails } from 'types'
import { AssertionError } from 'assert'

export function assert<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (!val) {
    throw new AssertionError({ message })
  }
}

export function assertNonNull<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError({ message })
  }
}

// eslint-disable-next-line
function noop(..._args: any[]): void {}

export const log = process.env.NODE_ENV === 'test' ? noop : console.log

export function getToken<T extends TokenDetails, K extends keyof T>(
  key: K,
  value: string | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  const valueUppercase = value.toUpperCase()
  return (tokens || []).find((token: T): boolean => {
    const tokenKeyValue = token[key]
    if (tokenKeyValue) {
      return tokenKeyValue?.['toString']().toUpperCase() === valueUppercase
    } else {
      return false
    }
  })
}
