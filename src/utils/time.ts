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
export function calculateBatchId(date?: Date): number {
  const timestamp = date ? date.getTime() : Date.now()
  const timestampInSeconds = Math.floor(timestamp / 1000)
  return Math.floor(timestampInSeconds / BATCH_TIME)
}

export function dateFromBatchId(batchId: number): Date {
  const timestamp = batchId * BATCH_TIME * 1000
  return new Date(timestamp)
}

function adjustRollover(date: Date, newDate: Date): Date {
  if (newDate.getDate() != date.getDate()) {
    newDate.setDate(0)
  }
  return newDate
}

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 30, 'minute')  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 *
 * Adapted from https://stackoverflow.com/a/1214753/1272513
 *
 * @param date  Date to start with
 * @param time  How much of given time unit to add to date.
 * @param unit  One of: year, month, week, day, hour, minute, second
 */
export function addTimeToDate(
  date: Date | number,
  time: number,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second',
): Date {
  // Date.now() returns a timestamp in number rather than a Date object
  const originalDate = typeof date === 'number' ? new Date(date) : date
  let newDate = new Date(date) //don't change original date

  switch (unit) {
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + time)
      newDate = adjustRollover(originalDate, newDate)
      break
    case 'month':
      newDate.setMonth(newDate.getMonth() + time)
      newDate = adjustRollover(originalDate, newDate)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + 7 * time)
      break
    case 'day':
      newDate.setDate(newDate.getDate() + time)
      break
    case 'hour':
      newDate.setTime(newDate.getTime() + time * 3600000)
      break
    case 'minute':
      newDate.setTime(newDate.getTime() + time * 60000)
      break
    case 'second':
      newDate.setTime(newDate.getTime() + time * 1000)
      break
  }
  return newDate
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
