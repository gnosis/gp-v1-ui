import BN from 'bn.js'

import { TokenDetails, Unpromise } from 'types'
import { AssertionError } from 'assert'
import { AuctionElement, Trade, Order } from 'api/exchange/ExchangeApi'
import { batchIdToDate } from './time'
import { ORDER_FILLED_FACTOR } from 'const'
import { ZERO } from '@gnosis.pm/dex-js'

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

function isAmountDifferenceGreaterThanNegligibleAmount(amount1: BN, amount2: BN): boolean {
  // consider an oder filled when less than `negligibleAmount` is left
  const negligibleAmount = amount1.divRound(ORDER_FILLED_FACTOR)
  return !amount2.gte(negligibleAmount)
}

/**
 * When orders are `deleted` from the contract, they are still returned, but with all fields set to zero.
 * We will not display such orders.
 *
 * This function checks whether the order has been zeroed out.
 * @param order The order object to check
 */
export function isOrderDeleted(order: Order): boolean {
  return (
    order.buyTokenId === 0 &&
    order.sellTokenId === 0 &&
    order.priceDenominator.eq(ZERO) &&
    order.priceNumerator.eq(ZERO) &&
    order.validFrom === 0 &&
    order.validUntil === 0
  )
}

export function isOrderFilled(order: AuctionElement): boolean {
  return isAmountDifferenceGreaterThanNegligibleAmount(order.priceDenominator, order.remainingAmount)
}

export function isTradeFilled(trade: Trade): boolean {
  return (
    !!trade.remainingAmount && isAmountDifferenceGreaterThanNegligibleAmount(trade.sellAmount, trade.remainingAmount)
  )
}

export function isTradeSettled(trade: Trade): boolean {
  return trade.settlingTimestamp <= Date.now()
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

interface RetryOptions {
  retriesLeft?: number
  interval?: number
  exponentialBackOff?: boolean
}

/**
 * Retry function with delay.
 *
 * Inspired by: https://gitlab.com/snippets/1775781
 *
 * @param fn Parameterless function to retry
 * @param retriesLeft How many retries. Defaults to 3
 * @param interval How long to wait between retries. Defaults to 1s
 * @param exponentialBackOff Whether to use exponential back off, doubling wait interval. Defaults to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retry<T extends () => any>(fn: T, options?: RetryOptions): Promise<Unpromise<ReturnType<T>>> {
  const { retriesLeft = 3, interval = 1000, exponentialBackOff = true } = options || {}

  try {
    return await fn()
  } catch (error) {
    if (retriesLeft) {
      await delay(interval)

      return retry(fn, {
        retriesLeft: retriesLeft - 1,
        interval: exponentialBackOff ? interval * 2 : interval,
        exponentialBackOff,
      })
    } else {
      throw new Error(`Max retries reached`)
    }
  }
}

export function flattenMapOfLists<K, T>(map: Map<K, T[]>): T[] {
  return Array.from(map.values()).reduce<T[]>((acc, list) => acc.concat(list), [])
}
