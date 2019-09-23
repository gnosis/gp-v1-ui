import BN from 'bn.js'
import { TEN } from 'const'

const DEFAULT_DECIMALS = 4
const DEFAULT_PRECISSION = 18

function formatNumber(num: string): string {
  return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function decomposeBn(
  amount?: BN,
  amountPrecission = DEFAULT_PRECISSION,
  decimals = DEFAULT_DECIMALS,
): { integerPart: BN; decimalPart: BN } {
  // Discard the decimals we don't need
  //  i.e. for WETH (precission=18, decimals=4) --> amount / 1e14
  //        16.5*1e18 ---> 165000
  const amountRaw = amount.divRound(TEN.pow(new BN(amountPrecission - decimals)))
  const integerPart = amountRaw.div(TEN.pow(new BN(decimals))) // 165000 / 10000 = 16
  const decimalPart = amountRaw.mod(TEN.pow(new BN(decimals))) // 165000 % 10000 = 5000

  return { integerPart, decimalPart }
}

export function formatAmount(
  amount?: BN,
  amountPrecission = DEFAULT_PRECISSION,
  decimals = DEFAULT_DECIMALS,
): string | null {
  if (!amount) {
    return null
  }

  const { integerPart, decimalPart } = decomposeBn(amount, amountPrecission, decimals)

  if (decimalPart.isZero()) {
    // Return just the integer part
    return formatNumber(integerPart.toString())
  } else {
    // Format decimal (to get rid of right padding zeros)
    const decimalFmt = (decimalPart.toNumber() / Math.pow(10, decimals)).toString()

    // Return the formated integer plus the decimal
    return formatNumber(integerPart.toString()) + '.' + decimalFmt.substring(2, decimalFmt.length)
  }
}

export function formatAmountFull(amount?: BN, amountPrecission = DEFAULT_PRECISSION): string | null {
  if (!amount) {
    return null
  }

  const { integerPart, decimalPart } = decomposeBn(amount, amountPrecission, amountPrecission)
  if (decimalPart.isZero()) {
    // Return just the integer part
    return formatNumber(integerPart.toString())
  } else {
    // Return the formated integer plus the decimal
    return formatNumber(integerPart.toString()) + '.' + decimalPart.toString().replace(/0+$/, '')
  }
}
