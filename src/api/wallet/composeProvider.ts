import RpcEngine, {
  JsonRpcEngine,
  JsonRpcMiddleware,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
} from 'json-rpc-engine'
import providerFromEngine from 'eth-json-rpc-middleware/providerFromEngine'
import { TransactionConfig } from 'web3-core'
import { numberToHex } from 'web3-utils'
import { isWalletConnectProvider, Provider } from './providerUtils'

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

      provider.request(req).then(providerRes => {
        Object.assign(res, providerRes)
        end()
      }, end)
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

    // if handled fully, end here
    if (await handle(req, res)) return end()
    // otherwise continue to next middleware
    next()
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

  engine.push(
    createConditionalMiddleware<[]>(
      req => req.method === 'eth_gasPrice',
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

  engine.push(
    createConditionalMiddleware<TransactionConfig[]>(
      req => req.method === 'eth_sendTransaction',
      async req => {
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

  const walletMiddleware = providerAsMiddleware(provider)

  engine.push(walletMiddleware)

  const composedProvider: T = providerFromEngine(engine)

  const providerProxy = new Proxy(composedProvider, {
    get: function(target, prop, receiver): unknown {
      if (prop === 'sendAsync' || prop === 'send') {
        // composedProvider handles it
        return Reflect.get(target, prop, receiver)
      }
      // MMask or other provider handles it
      return Reflect.get(provider, prop, receiver)
    },
  })

  return providerProxy
}
