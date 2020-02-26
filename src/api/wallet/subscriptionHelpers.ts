import Web3 from 'web3'
import { Command } from 'types'
import { BlockHeader, Syncing } from 'web3-eth'
import { LogsOptions, Log } from 'web3-core'
import { Subscription } from 'web3-core-subscriptions'

import { logDebug } from 'utils'

const DEFAULT_BLOCK_INTERVAL = 10000 //ms

type SubscribeEvent = 'pendingTransactions' | 'syncing' | 'newBlockHeaders' | 'logs'

interface SubscribeParams<T extends SubscribeEvent> {
  web3: Web3
  event: T
  logOptions?: T extends 'logs' ? LogsOptions : void
  callback: (data: Event2Data[T]) => void
}

interface Event2Data {
  pendingTransactions: string
  syncing: Syncing
  newBlockHeaders: BlockHeader
  logs: Log
}

// detects if provider supports any given subscription
// returns subscription or rejects
const createWeb3Subscription = <T extends SubscribeEvent>({
  web3,
  event,
  logOptions,
  callback,
}: SubscribeParams<T>): Promise<() => void> => {
  return new Promise<Subscription<Event2Data[T]>>((resolve, reject) => {
    // callback normally used as complition of on('error') and on('data') together
    // but needed here because not all providers will call on('error')
    const detectValidSubCb = (e: Error): void => {
      if (e) {
        reject(e)
      }
    }

    const sub = (logOptions && event === 'logs'
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        web3.eth.subscribe(event as any, logOptions as any, detectValidSubCb)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        web3.eth.subscribe(event as any, detectValidSubCb)) as Subscription<Event2Data[T]>

    sub
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      .on('connected', id => {
        // called with subscription id
        // if subscribtion was created successfully
        logDebug('[subscriptionHelpers] Subscription id for', event, id)
        resolve(sub)
      })
      // immediate reject on error
      // some providers don't trigger it, only trigger error in callback
      .on('error', reject)
  }).then(sub => {
    sub.on('data', callback)
    return (): void => {
      sub.unsubscribe()
    }
  })
}

interface SubscribeParamsAlt<T extends SubscribeEvent> extends SubscribeParams<T> {
  getter(web3: Web3): Promise<Event2Data[T]>
  interval?: number
}

interface ConditionalIntervalCheck {
  interval?: number
  condition(): Promise<ChangedBlockState>
  callback: (blockNumber: number) => void
}

// calls callback inly when condition is true
// conditionis checked on interval
const conditionalIntervalCheck = ({
  interval = DEFAULT_BLOCK_INTERVAL,
  condition,
  callback,
}: ConditionalIntervalCheck): Command => {
  const checkAndCall = async (): Promise<void> => {
    const changedBlockState = await condition()
    if (changedBlockState.changed) callback(changedBlockState.currentBlockNumber)
  }
  const intervalId = setInterval(checkAndCall, interval)
  // initial call before interval triggers
  checkAndCall()

  return (): void => clearInterval(intervalId)
}

interface ChangedBlockState {
  changed: boolean
  currentBlockNumber: number
  error?: Error
}

// check based on current block number
// intended to be used in polling interval
const checkIfBlockChangedFactory = (web3: Web3): (() => Promise<ChangedBlockState>) => {
  // keep block number in closure
  let currentBlockNumber: number

  // actual checking function
  // comparison is with currentBlockNumber from parent scope
  return async (): Promise<ChangedBlockState> => {
    try {
      // quick check if new block was mined
      const blockN = await web3.eth.getBlockNumber()
      if (blockN !== currentBlockNumber) {
        currentBlockNumber = blockN
        return { changed: true, currentBlockNumber }
      }
      return { changed: false, currentBlockNumber }
    } catch (error) {
      console.error('[subscriptionHelpers] Error getting block number', error)
      return { changed: false, currentBlockNumber, error }
    }
  }
}

// subscribes to 'pendingTransactions' | 'syncing' | 'newBlockHeaders' | 'logs' event on web3.eth.seubscribe
export const subscribeToWeb3Event = <T extends SubscribeEvent>(options: SubscribeParamsAlt<T>): Command => {
  const { web3, callback, getter, interval } = options
  // first checks if possible to get native subscribtion (provider supports the event)
  const subscriptionPromise = createWeb3Subscription(options).catch(error => {
    // if subscription isn't supported
    logDebug('[subscriptionHelpers] Error subscribing to', options.event, 'event:', error)

    // check on interval
    // substituted in place of web3 subscription
    return conditionalIntervalCheck({
      interval,
      // factory condition to keep internal state
      condition: checkIfBlockChangedFactory(web3),
      callback: blockNumber => {
        // only called if condition returns true
        logDebug('[subscriptionHelpers] polled new block', blockNumber)
        getter(web3).then(callback)
      },
    })
  })

  return (): void => {
    subscriptionPromise.then(unsubscribe => unsubscribe())
  }
}
