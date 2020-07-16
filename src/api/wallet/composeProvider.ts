import RpcEngine, {
  JsonRpcEngine,
  JsonRpcMiddleware,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
} from 'json-rpc-engine'
import { TransactionConfig } from 'web3-core'
import { numberToHex, hexToNumber } from 'web3-utils'
import { isWalletConnectProvider, Provider } from './providerUtils'
import { logDebug } from 'utils'
import { web3 } from 'api'
import { createLoggerMiddleware } from './loggerMiddleware'

import {
  addTxPendingApproval,
  areTxsPendingApproval,
  openWaitForTxApprovalModal,
  removeAllTxsPendingApproval,
  removeTxPendingApproval,
} from 'components/OuterModal'
import { CHAIN_CALLS_RATE_LIMIT } from 'const'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeErrorData = (jsonRpcError?: JsonRpcError<any>): void => {
  if (!jsonRpcError) return

  if (jsonRpcError.data?.originalError) {
    jsonRpcError.data = jsonRpcError.data.originalError.data
  }
}

type RpcCallBack<T extends unknown> = (error: JsonRpcError<T>, res: JsonRpcResponse<T>) => void

function providerFromEngine<T extends Provider>(engine: JsonRpcEngine): T {
  const sendAsync = engine.handle.bind(engine)

  const send = <T extends unknown>(req: JsonRpcRequest<T>, callback: RpcCallBack<T>): void => {
    if (!callback) throw new Error('Web3 Provider - must provider callback to "send" method')
    engine.handle(req, callback)
  }
  const request = <T extends unknown>(req: JsonRpcRequest<T>): Promise<JsonRpcResponse<T>> => {
    return new Promise((resolve, reject) => {
      engine.handle(req, (error: JsonRpcError<T>, res: JsonRpcResponse<T>) => {
        // console.log('CPROV::handled error:', error, 'res:', res)
        if (error) {
          reject(error)
          return
        }

        resolve(res)
      })
    })
  }

  return ({ request, send, sendAsync } as unknown) as T
}

type RequestMethod = <T extends unknown>(req: JsonRpcRequest<T>) => Promise<JsonRpcResponse<T>['result']>

const supportsRequestMethod = (provider: Provider): provider is Provider & { request: RequestMethod } => {
  return 'request' in provider
}

// custom providerAsMiddleware
function providerAsMiddleware(provider: Provider): JsonRpcMiddleware {
  // WalletConnectProvider.sendAsync is web3-provider-engine.sendAsync
  // it doesn't pass payload on to HttpConnection (WalletConnectProvider.http)
  // WalletConnectProvider.send with callback also doesn't
  // need to either strip callback and call 'send'
  // or use 'request', valid only for call requests
  // txs have to go through send(sendAsync) with callback
  if (isWalletConnectProvider(provider)) {
    const methodsToSend = new Set(['eth_sendRawTransaction', 'eth_sendTransaction', 'eth_sign'])

    return (req, res, _next, end): void => {
      // send request to provider

      if (methodsToSend.has(req.method)) {
        provider.send(req, (err: JsonRpcError<unknown>, providerRes: JsonRpcResponse<unknown>) => {
          // forward any error
          if (err) return end(err)
          // copy provider response onto original response
          Object.assign(res, providerRes)
          end()
        })

        return
      }

      provider.request(req).then(
        (providerRes) => {
          Object.assign(res, providerRes)
          sanitizeErrorData(res.error)
          end()
        },
        (error) => {
          sanitizeErrorData(error)
          end(error)
        },
      )
    }
  }

  if (supportsRequestMethod(provider)) {
    return async (req, res, _next, end): Promise<void> => {
      try {
        // send request to provider
        const providerRes = await provider.request(req)
        console.log('CPROV::providerResult', providerRes)

        // attach result from provider
        res.result = providerRes
        end()
      } catch (error) {
        // forward any error
        end(error)
      }
    }
  }

  // MMask provider uses sendAsync
  // WebSocket provider doesn't have sendAsync
  const sendFName = 'sendAsync' in provider ? 'sendAsync' : 'send'

  return (req, res, _next, end): void => {
    // send request to provider

    provider[sendFName](req, (err: JsonRpcError<unknown>, providerRes: JsonRpcResponse<unknown>) => {
      // forward any error
      if (err) {
        sanitizeErrorData(err)
        return end(err)
      }
      sanitizeErrorData(providerRes.error)
      // copy provider response onto original response
      Object.assign(res, providerRes)
      end()
    })
  }
}

// wait 1 minute
const DEFAULT_TX_APPROVAL_TIMEOUT = 60000

const wrapInTimeout = (middleware: JsonRpcMiddleware, timeout = DEFAULT_TX_APPROVAL_TIMEOUT): JsonRpcMiddleware => {
  let timeoutId: NodeJS.Timeout | null = null
  // keep track of pending txs in closure
  const txsPendingApproval = new Map<string | number, () => void>()
  return (req, res, next, end): void => {
    if (req.method !== 'eth_sendTransaction') {
      return middleware(req, res, next, end)
    }

    // restart waiting before modal opening on new txs
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    // new tx pending approval fired
    addTxPendingApproval(req.id)
    if (req.id !== undefined) {
      // code 106 -- Timeout
      // https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal#possible-future-error-codes
      txsPendingApproval.set(req.id, () =>
        end({ message: 'User opted out of waiting for transaction response', code: 106 }),
      )
    }

    timeoutId = setTimeout(async function askOnTimeout() {
      if (await openWaitForTxApprovalModal()) {
        // if user chose to wait more in Modal
        // or rejected/approved txs in the wallet
        // don't retrigger modal
        if (!areTxsPendingApproval()) return
        // wait some more
        timeoutId = setTimeout(askOnTimeout, timeout)
      } else {
        // modal closed with `No, stop waiting`
        // all pending txs were cancelled
        removeAllTxsPendingApproval()
        txsPendingApproval.forEach((endCb) => endCb())
        txsPendingApproval.clear()
      }
      // if modal closed
      // either new one will be reopened
      // or txs were rejected/approved in the wallet already
      // or user chose not to wait anymore
    }, timeout)

    const endWithTimeout = (error?: JsonRpcError<unknown>): void => {
      // if tx wasn't already rejected through the modal
      // remove it from pending here
      removeTxPendingApproval(req.id)
      if (req.id !== undefined) txsPendingApproval.delete(req.id)

      // if no more txs left
      // no need for modal
      if (timeoutId && txsPendingApproval.size === 0) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      end(error)
    }

    return middleware(req, res, next, endWithTimeout)
  }
}

const createConditionalMiddleware = <T extends unknown>(
  condition: (req: JsonRpcRequest<T>) => boolean,
  handle: (req: JsonRpcRequest<T>, res: JsonRpcResponse<T>) => boolean | Promise<boolean>, // handled -- true, not --false
): JsonRpcMiddleware => {
  return async (req: JsonRpcRequest<T>, res: JsonRpcResponse<T>, next, end): Promise<void> => {
    // if not condition, skip and got to next middleware
    if (!condition(req)) return next()

    try {
      const isHandled = await handle(req, res)

      // If handled fully, end here
      if (isHandled) return end()

      // Otherwise continue to next middleware
      next()
    } catch (error) {
      end(error)
    }
  }
}

export interface Earmark {
  data: string
  extraGas: number
}

interface ExtraMiddlewareHandlers {
  fetchGasPrice(): Promise<string | undefined>
  earmarkTx(data?: string): Promise<Earmark>
}

export const composeProvider = <T extends Provider>(
  provider: T,
  { fetchGasPrice, earmarkTx }: ExtraMiddlewareHandlers,
): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const engine = new (RpcEngine as any)() as JsonRpcEngine

  if (process.env.NODE_ENV === 'development') {
    // Logger middleware
    engine.push(createLoggerMiddleware())
  }

  engine.push(
    createConditionalMiddleware<[]>(
      (req) => req.method === 'eth_gasPrice',
      async (_req, res) => {
        const fetchedPrice = await fetchGasPrice()

        // got price
        if (fetchedPrice) {
          res.result = numberToHex(fetchedPrice)
          // handled
          return true
        }

        // not handled
        return false
      },
    ),
  )

  if (process.env.NODE_ENV === 'development') {
    // hack to be able to use interface as if from a different account
    // read-only of course
    // account will update on the next eth_accounts call
    // normally on new block in a few seconds

    let substituteAccount = ''

    engine.push(
      createConditionalMiddleware(
        (req) => req.method === 'eth_accounts',
        (_req, res) => {
          if (substituteAccount) {
            res.result = [substituteAccount]
            return true
          }

          return false
        },
      ),
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).loginAs = (address: string): void => {
      substituteAccount = address
    }
  }

  engine.push(
    createConditionalMiddleware<TransactionConfig[]>(
      (req) => req.method === 'eth_sendTransaction',
      async (req) => {
        const txConfig = req.params?.[0]
        // no parameters, which shouldn't happen
        if (!txConfig) return false

        // tx.data += decode*
        const { data, extraGas } = await earmarkTx(txConfig.data)
        txConfig.data = data

        // if gas is specified tx.gas += cost of decode*
        if (txConfig.gas) {
          const newGas = hexToNumber(txConfig.gas) + extraGas
          txConfig.gas = numberToHex(newGas)
        }

        // don't mark as handled
        // pass modified tx on
        return false
      },
    ),
  )

  engine.push(
    createConditionalMiddleware<TransactionConfig[]>(
      (req) => req.method === 'eth_sendTransaction',
      async (req) => {
        const txConfig = req.params?.[0]
        // no parameters, which shouldn't happen
        if (!txConfig) return false

        if (!txConfig.gas) {
          // Remove gasPrice from the estimation props, since they broke after last hardfork
          //  https://github.com/gnosis/gp-v1-ui/pull/1618
          const { gasPrice, ...txConfigEstimation } = txConfig
          const gasLimit = await web3.eth.estimateGas(txConfigEstimation).catch((error) => {
            console.error('[composeProvider] Error estimating gas, probably failing transaction', txConfig)
            throw error
          })
          logDebug('[composeProvider] No gas Limit. Using estimation ' + gasLimit)
          txConfig.gas = numberToHex(gasLimit)
        } else {
          logDebug('[composeProvider] Gas Limit: ' + txConfig.gas)
        }

        logDebug('[composeProvider] Sending transaction', txConfig)

        // don't mark as handled
        // pass modified tx on
        return false
      },
    ),
  )

  // rate limit a function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function rateLimit<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
    const queue: Parameters<T>[] = []
    let timer: NodeJS.Timeout | null = null

    // escape hatch to monitor the queue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).callsQueue = queue

    function processQueue(): void {
      const params = queue.shift()
      if (params) fn(...params)
      if (queue.length === 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }

    return function limited(...args: Parameters<T>): void {
      queue.push(args)
      if (!timer) {
        processQueue() // start immediately on the first invocation
        timer = setInterval(processQueue, delay)
      }
    }
  }

  if (CHAIN_CALLS_RATE_LIMIT > 0) {
    const passThroughMware: JsonRpcMiddleware = (_req, _res, next) => next()
    // consecutive calls with CHAIN_CALLS_RATE_LIMIT in between
    const rateLimitedPassThrough = rateLimit(passThroughMware, CHAIN_CALLS_RATE_LIMIT)

    engine.push((req, res, next, error) => {
      // tx signing is wallet-dependent
      if (req.method === 'eth_sendTransaction') {
        return next()
      }

      // execute only once in CHAIN_CALLS_RATE_LIMIT ms
      rateLimitedPassThrough(req, res, next, error)
    })
  }

  const walletMiddleware = providerAsMiddleware(provider)
  engine.push(wrapInTimeout(walletMiddleware))

  const composedProvider: T = providerFromEngine(engine)

  const providerProxy = new Proxy(composedProvider, {
    get: function (target, prop, receiver): unknown {
      // console.log('CPROV::Proxy, target, prop', target, prop)
      if (prop === 'request' || prop === 'sendAsync' || prop === 'send') {
        // composedProvider handles it
        return Reflect.get(target, prop, receiver)
      }
      // pretend we don't support provider.request yet
      if (prop === 'request') {
        return undefined
      }
      // MMask or other provider handles it
      return Reflect.get(provider, prop, receiver)
    },
  })

  return providerProxy
}
