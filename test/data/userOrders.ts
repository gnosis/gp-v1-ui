import BN from 'bn.js'

import { ALLOWANCE_MAX_VALUE } from 'const'
import { calculateBatchId, addTimeToDate } from 'utils'

import { USER_1, BATCH_ID } from './basic'

export const exchangeOrders = {
  [USER_1]: [
    {
      buyTokenId: 3, // TUSD
      sellTokenId: 7, // DAI
      validFrom: BATCH_ID,
      validUntil: BATCH_ID + 1,
      priceNumerator: new BN('2100000000000000000000'),
      priceDenominator: new BN('2000000000000000000000'),
      remainingAmount: new BN('1500000000000000000000'),
    },
    {
      buyTokenId: 4, // USDC
      sellTokenId: 5, // TUSD
      validFrom: BATCH_ID,
      validUntil: calculateBatchId(addTimeToDate(new Date(), 10, 'year')), // not infinite but high enough
      priceNumerator: new BN('12').mul(new BN(10).pow(new BN(64))), // price ~1.04
      priceDenominator: ALLOWANCE_MAX_VALUE,
      remainingAmount: ALLOWANCE_MAX_VALUE, // as big as it gets
    },
    {
      buyTokenId: 7, // DAI
      sellTokenId: 5, // PAX
      validFrom: BATCH_ID,
      validUntil: calculateBatchId(addTimeToDate(Date.now(), 2, 'day')),
      priceNumerator: new BN('10500000000000000000000'),
      priceDenominator: new BN('10000000000000000000000'),
      remainingAmount: new BN('5876842900000000000000'),
    },
  ],
}

export const pendingOrders = {
  [USER_1]: [
    {
      buyTokenId: 7, // DAI
      sellTokenId: 4, // USDC
      validFrom: BATCH_ID,
      validUntil: calculateBatchId(addTimeToDate(Date.now(), 1, 'day')),
      priceNumerator: new BN('1315273500000000000000'),
      priceDenominator: new BN('876849000'),
      remainingAmount: new BN('876849000'),
    },
  ],
}
