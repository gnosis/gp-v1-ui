import { DepositApi } from 'types'

import { BATCH_TIME } from 'constants/'
import { DepositApiMock } from 'api/ExchangeApi/mock/DepositApiMock'
import * as testHelpers from '../../testHelpers'

let instance: DepositApi

beforeAll(() => {
  instance = new DepositApiMock()
  testHelpers.mockTimes()
})

describe('Basic view functions', () => {
  test('Get batch time', async () => {
    const batchTime = await instance.getBatchTime()
    expect(batchTime).toBe(BATCH_TIME)
  })

  test('Get current batch number (state index)', async () => {
    const batchNumber = await instance.getCurrentBatchNumber()
    expect(batchNumber).toBe(testHelpers.BATCH_NUMBER)
  })

  test('Get seconds remaining in batch', async () => {
    const remainingSeconds = await instance.getSecondsRemainingInBatch()
    expect(remainingSeconds).toBe(BATCH_TIME - testHelpers.BATCH_SECOND)
  })
})
