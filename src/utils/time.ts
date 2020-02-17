import { formatDistanceToNow } from 'date-fns'

import { BATCH_TIME } from 'const'

/**
 * Epoch in seconds
 */
export function getEpoch(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Calculates the batchId. Either current batchId based on current Epoch
 * or calculated if given a date
 *
 * Keep in mind this is used mainly for generating test data.
 * The contract's `getBatchId` should be the source of truth.
 *
 * @param date? Optional Date object to calculate the batchId from.
 *  Defaults to Date.now()
 */
export function dateToBatchId(date?: Date): number {
  const timestamp = date ? date.getTime() : Date.now()
  const timestampInSeconds = Math.floor(timestamp / 1000)
  return Math.floor(timestampInSeconds / BATCH_TIME)
}

export function batchIdToDate(batchId: number): Date {
  const timestamp = batchId * BATCH_TIME * 1000
  return new Date(timestamp)
}

export function formatDateFromBatchId(batchId: number): string {
  const date = batchIdToDate(batchId)
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Calculates seconds remaining in current batch
 * Assumes local time is accurate and can be used as source of truth
 */
export function getSecondsRemainingInBatch(): number {
  return BATCH_TIME - (getEpoch() % BATCH_TIME)
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainderSeconds = seconds % 60
  let s = ''

  if (minutes > 0) {
    s += `${minutes}m `
  }
  if (remainderSeconds > 0) {
    s += `${remainderSeconds}s`
  }
  if (minutes === 0 && remainderSeconds === 0) {
    s = '0s'
  }

  return s
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
async function noop(_milliseconds = 0): Promise<void> {}

export async function waitImpl(milliseconds = 2500): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout((): void => {
      resolve()
    }, milliseconds)
  })
}

export const wait = process.env.NODE_ENV === 'test' ? noop : waitImpl
