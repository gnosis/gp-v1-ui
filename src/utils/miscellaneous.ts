import { TokenDetails } from 'types'
import { AssertionError } from 'assert'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { batchIdToDate } from './time'
import { ORDER_FILLED_FACTOR } from 'const'

export function assertNonNull<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError({ message })
  }
}

// eslint-disable-next-line
function noop(..._args: any[]): void {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logInfo = process.env.NODE_ENV === 'test' ? noop : (...args: any[]): void => console.log(...args)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let debugEnabled = process.env.NODE_ENV === 'development'

declare global {
  interface Window {
    toggleDebug: () => void
  }
}

window.toggleDebug = (): boolean => {
  debugEnabled = !debugEnabled
  return debugEnabled
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logDebug = (...args: any[]): void => {
  if (debugEnabled) {
    console.log(...args)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = process.env.NODE_ENV === 'development' ? noop : (...args: any[]): void => console.log(...args)

export function getToken<T extends TokenDetails, K extends keyof T>(
  key: K,
  value: string | number | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  return (tokens || []).find((token: T): boolean => {
    const tokenKeyValue = token[key]
    if (tokenKeyValue) {
      switch (typeof tokenKeyValue) {
        case 'string':
          return tokenKeyValue.toUpperCase() === (value as string).toUpperCase()
        case 'number':
          return tokenKeyValue === value
        default:
          return false
      }
    } else {
      return false
    }
  })
}

export const delay = <T>(ms = 100, result?: T): Promise<T> => new Promise(resolve => setTimeout(resolve, ms, result))

/**
 * Uses images from https://github.com/trustwallet/tokens
 */
export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
}

export function isOrderFilled(order: AuctionElement): boolean {
  // consider an oder filled when less than `negligibleAmount` is left
  const negligibleAmount = order.priceDenominator.divRound(ORDER_FILLED_FACTOR)
  return !order.remainingAmount.gte(negligibleAmount)
}

export const isOrderActive = (order: AuctionElement, now: Date): boolean =>
  batchIdToDate(order.validUntil) >= now && !isOrderFilled(order)

export const isPendingOrderActive = (order: AuctionElement, now: Date): boolean =>
  batchIdToDate(order.validUntil) >= now || order.validUntil === 0

export async function silentPromise<T>(promise: Promise<T>, customMessage?: string): Promise<T | undefined> {
  try {
    return await promise
  } catch (e) {
    logDebug(customMessage || 'Failed to fetch promise', e.message)
    return
  }
}

interface RetryFnParams<T> {
  fn: (...fnParams: unknown[]) => Promise<T>
  fnParams?: unknown[]
}

interface RetryOptions {
  retriesLeft?: number
  delay?: number
  exponentialBackOff?: boolean
}

/**
 * Retry function with delay.
 *
 * Inspired by: https://gitlab.com/snippets/1775781
 *
 * @param fn Function to retry
 * @param fnParams Optional parameters list to pass to function
 * @param retriesLeft How many retries. Defaults to 3
 * @param delay How long to wait between retries. Defaults to 1s
 * @param exponentialBackOff Whether to use exponential back off, doubling wait interval. Defaults to true
 */
export async function retry<T>(params: RetryFnParams<T>, options?: RetryOptions): Promise<T> {
  const { fn, fnParams } = params
  const { retriesLeft = 3, delay = 1000, exponentialBackOff = true } = options || {}

  try {
    return fn(...fnParams)
  } catch (error) {
    if (retriesLeft) {
      await new Promise(r => setTimeout(r, delay))

      return retry(params, {
        retriesLeft: retriesLeft - 1,
        delay: exponentialBackOff ? delay * 2 : delay,
        exponentialBackOff,
      })
    } else {
      throw new Error(`Max retries reached for function ${fn.name}`)
    }
  }
}
