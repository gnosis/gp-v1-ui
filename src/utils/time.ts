import { addMinutes, formatDistanceToNow } from 'date-fns'

import { BATCH_TIME, MIN_UNLIMITED_SELL_ORDER_EXPIRATION_TIME } from 'const'

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

export function isBatchIdFarInTheFuture(batchId: number): boolean {
  const date = batchIdToDate(batchId)
  const farInTheFuture = addMinutes(Date.now(), MIN_UNLIMITED_SELL_ORDER_EXPIRATION_TIME)
  return date >= farInTheFuture
}

export function formatDateFromBatchId(batchId: number): string {
  const date = batchIdToDate(batchId)
  return formatDistanceToNow(date, { addSuffix: true })
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
