import BigNumber from 'bignumber.js'

export {
  formatAmount,
  formatAmountFull,
  adjustPrecision,
  parseAmount,
  abbreviateString,
  safeTokenName,
  safeFilledToken,
  formatPrice,
} from '@gnosis.pm/dex-js'

// TODO: Move utils to dex-utils

export function makeMultipleOf(mult = 5, value?: number | string | null): number {
  const cache = {}
  const numValue = Number(value)

  if (numValue === 0 || !value || isNaN(numValue)) return 0
  if (!(numValue % mult) || cache[numValue]) return numValue

  const remainder = numValue % mult

  let finalVal
  if (remainder > mult / 2) {
    cache[numValue] = numValue
    finalVal = numValue - remainder + mult
  } else {
    cache[numValue] = numValue
    finalVal = numValue - remainder
  }

  return finalVal
}

/**
 * Prevents invalid numbers from being inserted by hand in the URL
 *
 * @param value Input from URL
 */
export function sanitizeInput(value?: string | null, defaultValue = '0'): string {
  return value && Number(value) ? value : defaultValue
}

/**
 * Prevents invalid NEGATIVE numbers from being inserted by hand in the URL
 * Pushes number to nearest multiple of 5 (batch time)
 *
 * @param value Input from URL
 */
export function sanitizeNegativeAndMakeMultipleOf(value?: string | null, defaultValue = '0'): string {
  return typeof value === 'number' || (typeof value === 'string' && Number(value) >= 0)
    ? makeMultipleOf(5, value).toString()
    : defaultValue
}

export function validatePositiveConstructor(message: string) {
  return (value: string, constraint = 0): true | string => Number(value) > constraint || message
}
export const validInputPattern = /^\d+\.?\d*$/ // allows leading and trailing zeros
export const leadingAndTrailingZeros = /(^0*(?=\d)|\.0*$)/g // removes leading zeros and trailing '.' followed by zeros
export const trailingZerosAfterDot = /(.*\.\d+?)0*$/ // selects valid input without leading zeros after '.'

/**
 * Removes extra leading and trailing zeros, while allowing for partial numbers, so users can input decimals manually
 * //    0 -> 0. -> 0.1 -> 0.10 -> 0.105
 *
 * @param value The input value to parse
 */
export function formatPartialNumber(value: string): string {
  return value.replace(leadingAndTrailingZeros, '').replace(trailingZerosAfterDot, '$1')
}

export const formatTimeInHours = (
  validTime: string | number,
  matchedConstraintText: string,
  errorText = 'Invalid time - time cannot be negative',
): string =>
  +validTime == 0
    ? matchedConstraintText
    : +validTime < 0
    ? errorText
    : `in ~
${(+validTime / 60)
  .toFixed(2)
  .replace(leadingAndTrailingZeros, '')
  .replace(trailingZerosAfterDot, '$1')}
hours`

export function parseBigNumber(value: string): BigNumber | null {
  const bigNumber = new BigNumber(value)
  return bigNumber.isNaN() ? null : bigNumber
}

export const formatTimeToFromBatch = (
  value: string | number,
  returnType: 'TIME' | 'BATCH' = 'TIME',
  batchLength = 5,
): number => (returnType === 'TIME' ? Number(value) * batchLength : Number(value) / batchLength)
