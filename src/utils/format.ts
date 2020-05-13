import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { formatAmount } from '@gnosis.pm/dex-js'
import { DEFAULT_SMALL_LIMIT } from 'const'

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

// TODO: move
// Locale is an empty array because we want it to use user's locale
const ltFractionFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 18 })
const lt1kFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 5 })
const lt10kFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 4 })
const lt100kFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 3 })
const lt1mFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 2 })
const lt10mFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 1 })
const lt100mFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 0 })
// same format for billions and trillions
const lt1000tFormatter = new Intl.NumberFormat([], { maximumFractionDigits: 3, notation: 'compact' })

interface FormatAmountParams<T> {
  amount: T
  precision: number
  decimals?: number
  thousandSeparator?: boolean
  isLocaleAware?: boolean
}

interface SmartFormatParams<T> extends Exclude<FormatAmountParams<T>, 'thousandSeparator' | 'isLocaleAware'> {
  smallLimit: number
}

export const formatAmountForDisplay = (
  number: string,
  { smallLimit }: Pick<SmartFormatParams<BN>, 'smallLimit'>,
): string => {
  let numberFloat: number | string = parseFloat(number)

  if (numberFloat === 0) {
    numberFloat = '0.000'
  } else if (numberFloat < smallLimit) {
    numberFloat = `< ${smallLimit}`
  } else if (numberFloat < 1) {
    numberFloat = ltFractionFormatter.format(numberFloat)
  } else if (numberFloat < 1000) {
    numberFloat = lt1kFormatter.format(numberFloat)
  } else if (numberFloat < 10000) {
    numberFloat = lt10kFormatter.format(numberFloat)
  } else if (numberFloat < 100000) {
    numberFloat = lt100kFormatter.format(numberFloat)
  } else if (numberFloat < 1000000) {
    numberFloat = lt1mFormatter.format(numberFloat)
  } else if (numberFloat < 10000000) {
    numberFloat = lt10mFormatter.format(numberFloat)
  } else if (numberFloat < 100000000) {
    numberFloat = lt100mFormatter.format(numberFloat)
  } else if (numberFloat < 10 ** 15) {
    numberFloat = lt1000tFormatter.format(numberFloat)
  } else {
    numberFloat = '> 1000T'
  }

  return numberFloat
}

/**
 * smartFormat
 * @description prettier formatting based on Gnosis Safe - uses same signature as formatAmount
 * @param amount
 * @param amountPrecision
 */
export function smartFormat(amount: BN, amountPrecision: number): string
export function smartFormat(amount: null | undefined, amountPrecision: number): null
export function smartFormat(params: SmartFormatParams<BN>): string
export function smartFormat(params: SmartFormatParams<null | undefined>): null
export function smartFormat(
  params: SmartFormatParams<BN | null | undefined> | BN | null | undefined,
  _amountPrecision?: number,
): string | null {
  let amount: BN
  let precision: number
  // TODO: set defaults
  // decimals default should come from @gnosis.pm
  let decimals = 4
  let smallLimit = DEFAULT_SMALL_LIMIT

  if (!params || ('amount' in params && !params.amount)) {
    return null
  } else if (BN.isBN(params)) {
    amount = params
    precision = _amountPrecision as number
  } else {
    amount = params.amount as BN
    precision = params.precision
    decimals = params.decimals ?? decimals
    smallLimit = params.smallLimit ?? smallLimit
  }

  const stringAmount = formatAmount({
    amount,
    precision,
    decimals,
    isLocaleAware: false,
    thousandSeparator: false,
  })

  return formatAmountForDisplay(stringAmount, { smallLimit })
}

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parseAmount, toBN } = require('@gnosis.pm/dex-js')

  window['parseAmount'] = parseAmount
  window['smartFormat'] = smartFormat
  window['toBN'] = toBN
}
