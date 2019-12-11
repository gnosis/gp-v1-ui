import { addMinutes } from 'date-fns'

import * as testHelpers from '../testHelpers'
import { calculateBatchId } from 'utils'
import { BATCH_ID, DATE } from '../data'

beforeAll(() => {
  testHelpers.mockTimes()
})

describe('calculateBatchId', () => {
  it('returns current batchId when no params', () => {
    expect(calculateBatchId()).toBe(BATCH_ID)
  })
  it('returns next batch id when exact time is set for next batch', () => {
    const fiveMinutesInTheFuture = addMinutes(DATE, 5)
    expect(calculateBatchId(fiveMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns next batch id when time is set for middle of next batch', () => {
    const eightMinutesInTheFuture = addMinutes(DATE, 8)
    expect(calculateBatchId(eightMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns previous batch id when time is set for middle of previous batch', () => {
    const threeMinutesInThePast = addMinutes(DATE, -3)
    expect(calculateBatchId(threeMinutesInThePast)).toBe(BATCH_ID - 1)
  })
})
