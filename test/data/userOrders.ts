import { USER_1, BATCH_ID } from './basic'
import BN from 'bn.js'
import { calculateBatchId, addTimeToDate } from 'utils'

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
      sellTokenId: 3, // TUSD
      validFrom: BATCH_ID,
      validUntil: BATCH_ID + 1, // TODO: how to represent a date that never expires?
      priceNumerator: new BN('103000000'),
      priceDenominator: new BN('100000000000000000000'),
      remainingAmount: new BN('0'), // TODO: how to represent unlimited amount?
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
