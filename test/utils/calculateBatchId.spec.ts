import * as testHelpers from '../testHelpers'
import { calculateBatchId, addTimeToDate } from 'utils'
import { BATCH_ID, DATE } from '../data'

beforeAll(() => {
  testHelpers.mockTimes()
})

describe('calculateBatchId', () => {
  it('returns current batchId when no params', () => {
    expect(calculateBatchId()).toBe(BATCH_ID)
  })
  it('returns next batch id when exact time is set for next batch', () => {
    const fiveMinutesInTheFuture = addTimeToDate(DATE, 5, 'minute')
    expect(calculateBatchId(fiveMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns next batch id when time is set for middle of next batch', () => {
    const eightMinutesInTheFuture = addTimeToDate(DATE, 8, 'minute')
    expect(calculateBatchId(eightMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns previous batch id when time is set for middle of previous batch', () => {
    const threeMinutesInThePast = addTimeToDate(DATE, -3, 'minute')
    expect(calculateBatchId(threeMinutesInThePast)).toBe(BATCH_ID - 1)
  })
})
