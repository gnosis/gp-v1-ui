import { BigNumber } from 'bignumber.js'

export const DEFAULT_GAS_PRICE = 40e9 // 40 Gwei
export const SUBSIDIZE_FACTOR = 10

// account for a 20% change in the time it takes to mine the tx, and start the batch
export const BUFFER_MULTIPLIER = 1.2

export const SETTLEMENT_FACTOR = 1.5
export const FEE_FACTOR = 1000
export const TRADE_TX_GASLIMIT = 120000

const OWL_DECIMAL_UNITS = 1e18

interface CalcMinTradableAmountInOwlParams {
  gasPrice: number
  ethPriceInOwl: BigNumber
}

export const calcMinTradableAmountInOwl = ({
  gasPrice,
  ethPriceInOwl,
}: CalcMinTradableAmountInOwlParams): BigNumber => {
  const MIN_ECONOMICAL_VIABLE_FEE_IN_OWL = ethPriceInOwl
    .multipliedBy(TRADE_TX_GASLIMIT * gasPrice)
    .dividedBy(OWL_DECIMAL_UNITS)
  console.log('MIN_ECONOMICAL_VIABLE_FEE_IN_OWL', MIN_ECONOMICAL_VIABLE_FEE_IN_OWL.toString(10))

  const MIN_FEE = MIN_ECONOMICAL_VIABLE_FEE_IN_OWL.multipliedBy(BUFFER_MULTIPLIER).dividedBy(SUBSIDIZE_FACTOR)
  return MIN_FEE.multipliedBy(FEE_FACTOR * SETTLEMENT_FACTOR)
}
