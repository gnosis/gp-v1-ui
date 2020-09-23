import RpcEngine, {
  JsonRpcEngine,
  JsonRpcMiddleware,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
} from 'json-rpc-engine'
import { TransactionConfig } from 'web3-core'
import { numberToHex } from 'web3-utils'
import { Provider } from './providerUtils'
import { logDebug } from 'utils'
import { web3 } from 'api'
import { createLoggerMiddleware } from './loggerMiddleware'

type RpcCallBack<T extends unknown> = (error: JsonRpcError<T>, res: JsonRpcResponse<T>) => void

function providerFromEngine<T extends Provider>(engine: JsonRpcEngine): T {
  const sendAsync = engine.handle.bind(engine)

  const send = <T extends unknown>(req: JsonRpcRequest<T>, callback: RpcCallBack<T>): void => {
    if (!callback) throw new Error('Web3 Provider - must provide callback to "send" method')
    engine.handle(req, callback)
  }
  const request = <T extends unknown>(req: JsonRpcRequest<T>): Promise<JsonRpcResponse<T>['result']> => {
    return new Promise((resolve, reject) => {
      engine.handle(req, (error: JsonRpcError<T>, res: JsonRpcResponse<T>) => {
        if (error) {
          reject(error)
          return
        }

        resolve(res.result)
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
  if (supportsRequestMethod(provider)) {
    return async (req, res, _next, end): Promise<void> => {
      try {
        // send request to provider
        const providerRes = await provider.request(req)

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
      if (err) return end(err)
      // copy provider response onto original response
      Object.assign(res, providerRes)
      end()
    })
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

interface ExtraMiddlewareHandlers {
  fetchGasPrice(): Promise<string | undefined>
  earmarkTxData(data?: string): Promise<string>
}

export const composeProvider = <T extends Provider>(
  provider: T,
  { fetchGasPrice, earmarkTxData }: ExtraMiddlewareHandlers,
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

        const earmarkedData = await earmarkTxData(txConfig.data)

        txConfig.data = earmarkedData
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
          const gasLimit = await web3.eth.estimateGas(txConfig).catch((error) => {
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

  const walletMiddleware = providerAsMiddleware(provider)
  engine.push(walletMiddleware)

  const composedProvider: T = providerFromEngine(engine)

  const providerProxy = new Proxy(composedProvider, {
    get: function (target, prop, receiver): unknown {
      if (prop === 'request' || prop === 'sendAsync' || prop === 'send') {
        // composedProvider handles it
        return Reflect.get(target, prop, receiver)
      }
      // MMask or other provider handles it
      return Reflect.get(provider, prop, receiver)
    },
  })

  return providerProxy
}
