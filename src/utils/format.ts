import BN from 'bn.js'
import { TEN } from 'const'

const DEFAULT_DECIMALS = 4
const DEFAULT_PRECISION = 18

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
  return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + THOUSANDS_SYMBOL)
}

function _decomposeBn(
  amount: BN,
  amountPrecision = DEFAULT_PRECISION,
  decimals = DEFAULT_DECIMALS,
): { integerPart: BN; decimalPart: BN } {
  // Discard the decimals we don't need
  //  i.e. for WETH (precision=18, decimals=4) --> amount / 1e14
  //        16.5*1e18 ---> 165000
  const amountRaw = amount.divRound(TEN.pow(new BN(amountPrecision - decimals)))
  const integerPart = amountRaw.div(TEN.pow(new BN(decimals))) // 165000 / 10000 = 16
  const decimalPart = amountRaw.mod(TEN.pow(new BN(decimals))) // 165000 % 10000 = 5000

  // Discard the decimals we don't need
  //  i.e. for WETH (precision=18, decimals=4) --> amount / 1e14
  //        1, 18:  16.5*1e18 ---> 165000

  return { integerPart, decimalPart }
}

export function formatAmount(
  amount?: BN,
  amountPrecision = DEFAULT_PRECISION,
  decimals = DEFAULT_DECIMALS,
): string | null {
  if (!amount) {
    return null
  }

  const { integerPart, decimalPart } = _decomposeBn(amount, amountPrecision, decimals)

  if (decimalPart.isZero()) {
    // Return just the integer part
    return _formatNumber(integerPart.toString())
  } else {
    const decimalFmt = decimalPart
      .toString()
      .padStart(decimals, '0') // Pad the decimal part with leading zeros
      .replace(/0+$/, '') // Remove the right zeros

    // Return the formated integer plus the decimal
    return _formatNumber(integerPart.toString()) + DECIMALS_SYMBOL + decimalFmt
  }
}

export function formatAmountFull(amount?: BN, amountPrecision = DEFAULT_PRECISION): string | null {
  if (!amount) {
    return null
  }

  return formatAmount(amount, amountPrecision, amountPrecision)
}
