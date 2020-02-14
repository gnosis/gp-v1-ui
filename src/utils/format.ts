import BN from 'bn.js'
import { TEN, DEFAULT_PRECISION } from 'const'
import { TokenDetails } from 'types'
import BigNumber from 'bignumber.js'

const DEFAULT_DECIMALS = 4
const ELLIPSIS = '...'

function _getLocaleSymbols(): { thousands: string; decimals: string } {
  // Check number representation in default locale
  const formattedNumber = new Intl.NumberFormat(undefined).format(1000.1)
  return {
    thousands: formattedNumber[1],
    decimals: formattedNumber[5],
  }
}
const { thousands: THOUSANDS_SYMBOL, decimals: DECIMALS_SYMBOL } = _getLocaleSymbols()

function _formatNumber(num: string): string {
  return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1' + THOUSANDS_SYMBOL)
}

function _decomposeBn(amount: BN, amountPrecision: number, decimals: number): { integerPart: BN; decimalPart: BN } {
  // Discard the decimals we don't need
  //  i.e. for WETH (precision=18, decimals=4) --> amount / 1e14
  //        16.5*1e18 ---> 165000
  if (decimals > amountPrecision) {
    throw new Error('The decimals cannot be bigger than the precision')
  }
  const amountRaw = amount.divRound(TEN.pow(new BN(amountPrecision - decimals)))
  const integerPart = amountRaw.div(TEN.pow(new BN(decimals))) // 165000 / 10000 = 16
  const decimalPart = amountRaw.mod(TEN.pow(new BN(decimals))) // 165000 % 10000 = 5000

  // Discard the decimals we don't need
  //  i.e. for WETH (precision=18, decimals=4) --> amount / 1e14
  //        1, 18:  16.5*1e18 ---> 165000

  return { integerPart, decimalPart }
}

export function formatAmount(
  amount: BN,
  amountPrecision: number,
  decimals?: number,
  thousandSeparator?: boolean,
): string
export function formatAmount(
  amount: null | undefined,
  amountPrecision: number,
  decimals?: number,
  thousandSeparator?: boolean,
): null
export function formatAmount(
  amount: BN | null | undefined,
  amountPrecision: number,
  decimals = DEFAULT_DECIMALS,
  thousandSeparator = true,
): string | null {
  if (!amount) {
    return null
  }
  const actualDecimals = Math.min(amountPrecision, decimals)
  const { integerPart, decimalPart } = _decomposeBn(amount, amountPrecision, actualDecimals)

  const integerPartFmt = thousandSeparator ? _formatNumber(integerPart.toString()) : integerPart.toString()

  if (decimalPart.isZero()) {
    // Return just the integer part
    return integerPartFmt
  } else {
    const decimalFmt = decimalPart
      .toString()
      .padStart(actualDecimals, '0') // Pad the decimal part with leading zeros
      .replace(/0+$/, '') // Remove the right zeros

    // Return the formated integer plus the decimal
    return integerPartFmt + DECIMALS_SYMBOL + decimalFmt
  }
}

export function formatAmountFull(amount: BN, amountPrecision?: number, thousandSeparator?: boolean): string
export function formatAmountFull(amount?: undefined): null
export function formatAmountFull(
  amount?: BN,
  amountPrecision = DEFAULT_PRECISION,
  thousandSeparator = true,
): string | null {
  if (!amount) {
    return null
  }

  return formatAmount(amount, amountPrecision, amountPrecision, thousandSeparator)
}

/**
 * Adjust the decimal precision of the given decimal value, without converting to/from BN or Number
 * Takes in a string and returns a string
 *
 * E.g.:
 * adjustPrecision('1.2657', 3) === '1.265'
 *
 * @param value The decimal value to be adjusted as a string
 * @param precision How many decimals should be kept
 */
export function adjustPrecision(value: string | undefined | null, precision: number): string {
  if (!value) {
    return ''
  }

  const regexp = new RegExp(`(\\.\\d{${precision}})\\d+$`)
  return value.replace(regexp, '$1')
}

export function parseAmount(amountFmt: string, amountPrecision: number): BN | null {
  if (!amountFmt) {
    return null
  }

  const adjustedAmount = adjustPrecision(amountFmt, amountPrecision)
  const groups = /^(\d+)(?:\.(\d+))?$/.exec(adjustedAmount)
  if (groups) {
    const [, integerPart, decimalPart = ''] = groups

    const decimalBN = new BN(decimalPart.padEnd(amountPrecision, '0'))
    const factor = TEN.pow(new BN(amountPrecision))
    return new BN(integerPart).mul(factor).add(decimalBN)
  } else {
    return null
  }
}

export function abbreviateString(inputString: string, prefixLength: number, suffixLength = 0): string {
  // abbreviate only if it makes sense, and make sure ellipsis fits into word
  // 1. always add ellipsis
  // 2. do not shorten words in case ellipsis will make the word longer
  // 3. min prefix == 1
  // 4. add suffix if requested
  const _prefixLength = Math.max(1, prefixLength)
  if (inputString.length < _prefixLength + ELLIPSIS.length + suffixLength) {
    return inputString
  }
  const prefix = inputString.slice(0, _prefixLength)
  const suffix = suffixLength > 0 ? inputString.slice(-suffixLength) : ''
  return prefix + ELLIPSIS + suffix
}

export function safeTokenName(token: TokenDetails): string {
  return token.symbol || token.name || abbreviateString(token.address, 6, 4)
}

export function safeFilledToken<T extends TokenDetails>(token: T): T {
  return {
    ...token,
    name: token.name || token.symbol || abbreviateString(token.address, 6, 4),
    symbol: token.symbol || token.name || abbreviateString(token.address, 6, 4),
  }
}

export function calculatePriceBigNumber(numerator?: BigNumber, denominator?: BigNumber): BigNumber | null {
  if (!numerator || !denominator || denominator.isZero()) {
    return null
  }

  return numerator.dividedBy(denominator)
}

export function formatPrice(
  numerator?: BigNumber,
  denominator?: BigNumber,
  decimals = DEFAULT_DECIMALS,
): string | null {
  const price = calculatePriceBigNumber(numerator, denominator)

  return price ? price.toFixed(decimals) : null
}

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
  return Number(value) >= 0 ? makeMultipleOf(5, value).toString() : defaultValue
}

export function validatePositive(value: string): true | string {
  return Number(value) > 0 || 'Invalid amount'
}
export const validInputPattern = new RegExp(/^\d+\.?\d*$/) // allows leading and trailing zeros
export const leadingAndTrailingZeros = new RegExp(/(^0*(?=\d)|\.0*$)/, 'g') // removes leading zeros and trailing '.' followed by zeros
export const trailingZerosAfterDot = new RegExp(/(.*\.\d+?)0*$/) // selects valid input without leading zeros after '.'

export const formatValidity = (validTime: string | number): string =>
  +validTime == 0
    ? 'Unlimited'
    : +validTime < 0
    ? 'Invalid time - time cannot be negative'
    : `~
${(+validTime / 60)
  .toFixed(2)
  .replace(leadingAndTrailingZeros, '')
  .replace(trailingZerosAfterDot, '$1')}
hours`
