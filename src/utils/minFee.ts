import { BigNumber } from 'bignumber.js'
import { logDebug } from './miscellaneous'

export const DEFAULT_GAS_PRICE = 40e9 // 40 Gwei

// account for a 20% change in the time it takes to mine the tx, and start the batch
export const BUFFER_MULTIPLIER = 1.2

export const SETTLEMENT_FACTOR = 1.5
export const FEE_FACTOR = 1000
export const TRADE_TX_GASLIMIT = 120000

const OWL_DECIMAL_UNITS = 1e18

interface CalcMinTradableAmountInOwlParams {
  gasPrice: number
  ethPriceInOwl: BigNumber
  subsidizeFactor: number
}

export const calcMinTradableAmountInOwl = ({
  gasPrice,
  ethPriceInOwl,
  subsidizeFactor,
}: CalcMinTradableAmountInOwlParams): BigNumber => {
  const minEconomicalViableFeeInOwl = ethPriceInOwl
    .multipliedBy(TRADE_TX_GASLIMIT * gasPrice)
    .dividedBy(OWL_DECIMAL_UNITS)
  logDebug('MIN_ECONOMICAL_VIABLE_FEE_IN_OWL', minEconomicalViableFeeInOwl.toString(10))

  const minFee = minEconomicalViableFeeInOwl.multipliedBy(BUFFER_MULTIPLIER).dividedBy(subsidizeFactor)
  return minFee.multipliedBy(FEE_FACTOR * SETTLEMENT_FACTOR)
}

export const ROUND_TO_NUMBER = 100 // 1234 -> 1300$

export const roundToNext = (amount: BigNumber | number, roundTo: number = ROUND_TO_NUMBER): BigNumber => {
  const amountBN = BigNumber.isBigNumber(amount) ? amount : new BigNumber(amount)

  const remainder = amountBN.modulo(roundTo)

  if (remainder.isZero()) return amountBN

  const wholePart = amountBN.minus(remainder)

  return wholePart.plus(roundTo)
}
