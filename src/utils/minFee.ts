import { BigNumber } from 'bignumber.js'

export const DEFAULT_GAS_PRICE = 40e9 // 40 Gwei
export const ETH_PRICE_IN_OWL = 240 * 1000
export const SUBSIDIZE_FACTOR = 10

// account for a 20% change in the time it takes to mine the tx, and start the batch
export const BUFFER_MULTIPLIER = 1.2

export const SETTLEMENT_FACTOR = 1.5
export const FEE_FACTOR = 1000
export const TRADE_TX_GASLIMIT = 120000

export const calcMinTradableAmountInOwl = (gasPrice: number): BigNumber => {
  const MIN_ECONOMICAL_VIABLE_FEE_IN_OWL = TRADE_TX_GASLIMIT * gasPrice * ETH_PRICE_IN_OWL

  const MIN_FEE = (BUFFER_MULTIPLIER * MIN_ECONOMICAL_VIABLE_FEE_IN_OWL) / SUBSIDIZE_FACTOR
  return new BigNumber(MIN_FEE * FEE_FACTOR * SETTLEMENT_FACTOR)
}
