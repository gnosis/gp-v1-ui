import BigNumber from 'bignumber.js'
import { ONE_HUNDRED_BIG_NUMBER, BATCH_TIME_IN_MS, DEFAULT_DECIMAL_PLACES } from 'const'
import { batchIdToDate } from './time'

export {
  formatSmart,
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
export function sanitizeNegativeAndMakeMultipleOf(value?: string | number | null, defaultValue = '0'): string {
  return typeof value === 'number' || (typeof value === 'string' && Number(value) >= 0)
    ? makeMultipleOf(5, value).toString()
    : defaultValue
}

export function checkDateOrValidBatchTime(dateOrBatch: Date | string | number | null): string | null {
  // early null return
  if (!dateOrBatch || dateOrBatch === '0') return null

  const dateParsed = Date.parse(new Date(dateOrBatch).toString())
  // check if parsable date
  // if NaN - continue
  // if is actual number, is date
  if (!isNaN(dateParsed) && dateParsed > Date.now()) return dateParsed.toString()

  // check if passed in date = number, and/or converting to number !isNaN
  if (typeof dateOrBatch === 'number' || !isNaN(+dateOrBatch)) {
    // lower than batchId threshold, return null
    if (+dateOrBatch < Math.floor(Date.now() / BATCH_TIME_IN_MS)) return null

    // above batch threshold but below Date.now() - try as batchId
    if (+dateOrBatch < Date.now()) {
      const batchIdAsDate = batchIdToDate(+dateOrBatch).getTime()

      return batchIdAsDate > Date.now() ? batchIdAsDate.toString() : null
    }
  }

  if (isNaN(dateParsed)) return null

  return dateOrBatch.toString()
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
${(+validTime / 60).toFixed(2).replace(leadingAndTrailingZeros, '').replace(trailingZerosAfterDot, '$1')}
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

// TODO: move to dex-js
/**
 * Formats percentage values with 2 decimals of precision.
 * Adds `%` at the end
 * Adds `<` at start when smaller than 0.01
 * Adds `>` at start when greater than 99.99
 *
 * @param percentage Raw percentage value. E.g.: 50% == 0.5
 */
export function formatPercentage(percentage: BigNumber): string {
  const displayPercentage = percentage.times(ONE_HUNDRED_BIG_NUMBER)
  let result = ''
  if (!displayPercentage.gte('0.01')) {
    result = '<0.01'
  } else if (displayPercentage.gt('99.99')) {
    result = '>99.99'
  } else {
    result = displayPercentage.decimalPlaces(2, BigNumber.ROUND_FLOOR).toString(10)
  }
  return result + '%'
}

/**
 * @function formatBigNumberToPrecisionAndRoundingFactory
 *
 * @description sets decimal places on BigNumber amount using current ROUDING_MODE selected. Removes any extra right padded zeroes.
 *
 * @example
 * // 0.437300089
 * amountToPrecisionDown(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionDown(new BigNumber("0.437300089"), 2).toString(10) // => "0.43"   Note: it does NOT round to 0.44!
 *
 * @param ROUNDING_MODE BigNumber.RoundingMode
 */
export const formatBigNumberToPrecisionAndRoundingFactory = (ROUNDING_MODE: BigNumber.RoundingMode) => (
  amount: BigNumber,
  precision: number,
): BigNumber => amount.decimalPlaces(precision, ROUNDING_MODE)

/**
 * @function amountToPrecisionDown
 *
 * @description Rounds DOWN - see example below
 * @param amount BigNumber amount
 * @param precision number of decimal places to show
 *
 * @example
 * // 0.437300089
 * amountToPrecisionDown(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionDown(new BigNumber("0.437300089"), 2).toString(10) // => "0.43"   Note: it does NOT round to 0.44!
 */
export const amountToPrecisionDown = formatBigNumberToPrecisionAndRoundingFactory(BigNumber.ROUND_DOWN)

/**
 * @function amountToPrecisionUp
 *
 * @description Rounds UP - see example below
 * @param amount BigNumber amount
 * @param precision number of decimal places to show
 *
 * @example
 * // 0.437300089
 * amountToPrecisionUp(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionUp(new BigNumber("0.437300089"), 3).toString(10) // => "0.44"   Note: it DOES round to 0.44 from 0.437!
 */
export const amountToPrecisionUp = formatBigNumberToPrecisionAndRoundingFactory(BigNumber.ROUND_UP)

export function formatPriceWithFloor(price: BigNumber): string {
  const LOW_PRICE_FLOOR = new BigNumber('0.0001')
  if (!price || price.isZero()) return 'N/A'

  const displayPrice = amountToPrecisionDown(price, DEFAULT_DECIMAL_PLACES).toString(10)
  return price.gt(LOW_PRICE_FLOOR) ? displayPrice : '< ' + LOW_PRICE_FLOOR.toString(10)
}
