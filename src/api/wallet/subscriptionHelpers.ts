import Web3 from 'web3'
import { Command } from 'types'
import { BlockHeader, Syncing } from 'web3-eth'
import { LogsOptions, Log } from 'web3-core'
import { Subscription } from 'web3-core-subscriptions'

import { log } from 'utils'

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

// detects if providerr supports any given subscription
const createWeb3Subscription = <T extends SubscribeEvent>({
  web3,
  event,
  logOptions,
  callback,
}: SubscribeParams<T>): Promise<() => void> => {
  return new Promise<Subscription<Event2Data[T]>>((resolve, reject) => {
    const detectValidSubCb = (e: Error): void => {
      if (e) {
        reject(e)
        return
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: [any, any] = (logOptions && event === 'logs'
      ? [event, logOptions, detectValidSubCb]
      : [event, detectValidSubCb]) as [T, Function]
    const sub = web3.eth.subscribe(...params) as Subscription<Event2Data[T]>
    sub
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      .on('connected', id => {
        log('Subscription id for', event, id)
        resolve(sub)
      })
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

const checkIfBlockChangedFactory = (web3: Web3): (() => Promise<ChangedBlockState>) => {
  // keep block number in closure
  let currentBlockNumber: number

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
      log('Error getting block number', error)
      return { changed: false, currentBlockNumber, error }
    }
  }
}

export const subscribeToWeb3Event = <T extends SubscribeEvent>(options: SubscribeParamsAlt<T>): Command => {
  const { web3, callback, getter, interval } = options
  const subscriptionPromise = createWeb3Subscription(options).catch(error => {
    //   if subscription isn't supported
    log('Error subscribing to', options.event, 'event:', error)

    // check on interval
    return conditionalIntervalCheck({
      interval,
      // factory condition to keep internal state
      condition: checkIfBlockChangedFactory(web3),
      callback: blockNumber => {
        // only called if condition returns true
        log('polled new block', blockNumber)
        getter(web3).then(callback)
      },
    })
  })

  return (): void => {
    subscriptionPromise.then(unsubscribe => unsubscribe())
  }
}
