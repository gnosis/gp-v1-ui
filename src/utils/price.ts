import BN from 'bn.js'
import { assert } from './miscellaneous'
import { TEN, UNLIMITED_ORDER_AMOUNT } from 'const'
import BigNumber from 'bignumber.js'

export function adjustAmountToLowerPrecision(amount: BN, higherPrecision: number, lowerPrecision: number): BN {
  if (higherPrecision === lowerPrecision) {
    // no adjustment required
    return amount
  }

  assert(higherPrecision > lowerPrecision, 'higherPrecision must be > lowerPrecision')

  const difference = new BN(higherPrecision - lowerPrecision)

  // divides amount by difference in precision, rounding. E.g:
  // 1.2345, precision 4, amount == 12345
  // 1.2345, precision 2, amount == 12345 / 10 ^ (4 - 2) => 12345 / 100 => 123
  // 1.5550, precision 1, amount == 15550 / 10 ^ (4 - 1) => 15550 / 1000 => 16
  // return amount.divRound(TEN.pow(difference))
  return amount.divRound(TEN.pow(difference))
}

interface Amounts {
  buyAmount: BN
  sellAmount: BN
}

const MAX = new BigNumber(UNLIMITED_ORDER_AMOUNT.toString())
const ONE = new BigNumber(1)

/**
 * Calculates the max amounts within given `spread` for unlimited orders
 *
 * Uses BigNumber internally to keep track of decimals
 * Returns BN for compatibility with ExchangeApi
 *
 * @param spread Value between 0 and 100, not inclusive
 * @param buyTokenPrecision Decimals of buy token
 * @param sellTokenPrecision Decimals of sell token
 */
export function maxAmountsForSpread(spread: number, buyTokenPrecision: number, sellTokenPrecision: number): Amounts {
  // Enforcing positive spreads: 0 < spread < 100
  assert(spread > 0 && spread < 100, 'Invalid spread amount')

  BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })

  const spreadPercentage = new BigNumber(spread).dividedBy(new BigNumber(100))

  if (buyTokenPrecision === sellTokenPrecision) {
    // case 1: same precision
    // buyAmount == MAX, sellAmount == buyAmount * (1 - (spread/100))
    const _buyAmount = MAX
    const _sellAmount = _buyAmount.multipliedBy(ONE.minus(spreadPercentage))

    const buyAmount = new BN(_buyAmount.integerValue().toString(10))
    const sellAmount = new BN(_sellAmount.integerValue().toString(10))

    return { buyAmount, sellAmount }
  } else if (buyTokenPrecision > sellTokenPrecision) {
    // case 2: buyTokenPrecision > sellTokenPrecision
    // buyAmount == MAX, sellAmount == buyAmount * (1 - (spread/100))
    const buyAmount = MAX
    const rawSellAmount = buyAmount.multipliedBy(ONE.minus(spreadPercentage))
    const sellAmount = adjustAmountToLowerPrecision(
      new BN(rawSellAmount.integerValue().toString(10)),
      buyTokenPrecision,
      sellTokenPrecision,
    )

    return { buyAmount: new BN(buyAmount.integerValue().toString(10)), sellAmount }
  } else {
    // case 3: buyTokenPrecision < sellTokenPrecision
    // sellAmount == MAX, buyAmount == sellAmount * (1 + (spread/100))
    const sellAmount = MAX
    const rawBuyAmount = sellAmount.multipliedBy(ONE.plus(spreadPercentage))
    const buyAmount = adjustAmountToLowerPrecision(
      new BN(rawBuyAmount.integerValue().toString(10)),
      sellTokenPrecision,
      buyTokenPrecision,
    )

    return { buyAmount, sellAmount: new BN(sellAmount.integerValue().toString(10)) }
  }
}
