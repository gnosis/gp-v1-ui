import BN from 'bn.js'
import { addDays, addMinutes } from 'date-fns'

import { ALLOWANCE_MAX_VALUE, MAX_BATCH_ID } from 'const'
import { dateToBatchId } from 'utils'

import { USER_1, BATCH_ID } from './basic'

const NOW = Date.now()

export const exchangeOrders = {
  [USER_1]: [
    {
      buyTokenId: 3, // TUSD
      sellTokenId: 7, // DAI
      validFrom: BATCH_ID,
      validUntil: dateToBatchId(addMinutes(NOW, 5)),
      priceNumerator: new BN('2100000000000000000000'),
      priceDenominator: new BN('2000000000000000000000'),
      remainingAmount: new BN('1500000000000000000000'),
    },
    {
      buyTokenId: 4, // USDC
      sellTokenId: 5, // TUSD
      validFrom: BATCH_ID,
      validUntil: MAX_BATCH_ID, // as big as it gets
      priceNumerator: new BN('12').mul(new BN(10).pow(new BN(64))), // price ~1.04
      priceDenominator: ALLOWANCE_MAX_VALUE,
      remainingAmount: ALLOWANCE_MAX_VALUE, // as big as it gets
    },
    {
      buyTokenId: 7, // DAI
      sellTokenId: 5, // PAX
      validFrom: BATCH_ID,
      validUntil: dateToBatchId(addDays(NOW, 2)),
      priceNumerator: new BN('10500000000000000000000'),
      priceDenominator: new BN('10000000000000000000000'),
      remainingAmount: new BN('5876842900000000000000'),
    },
    {
      buyTokenId: 0, // FEE Token; not in our list (forcing token fetch)
      sellTokenId: 1, // WETH
      validFrom: BATCH_ID,
      validUntil: dateToBatchId(addDays(NOW, 10)),
      priceNumerator: new BN('500000000000000000000'),
      priceDenominator: new BN('1000000000000000000000'),
      remainingAmount: new BN('300000000000000000000'),
    },
  ],
}

export const pendingOrders = {
  [USER_1]: [
    {
      buyTokenId: 7, // DAI
      sellTokenId: 4, // USDC
      validFrom: BATCH_ID,
      validUntil: dateToBatchId(addDays(NOW, 1)),
      priceNumerator: new BN('1315273500000000000000'),
      priceDenominator: new BN('876849000'),
      remainingAmount: new BN('876849000'),
    },
  ],
}
