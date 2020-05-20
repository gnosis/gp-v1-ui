import RpcEngine, {
  JsonRpcEngine,
  JsonRpcMiddleware,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
} from 'json-rpc-engine'
import providerFromEngine from 'eth-json-rpc-middleware/providerFromEngine'
import { Provider } from '@gnosis.pm/dapp-ui'
import { WebsocketProvider, TransactionConfig } from 'web3-core'
import { numberToHex } from 'web3-utils'

// custom providerAsMiddleware
function providerAsMiddleware(provider: Provider | WebsocketProvider): JsonRpcMiddleware {
  // MMask provider uses sendAsync
  // WS provider doesn't have sendAsync
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

export const composeProvider = (
  provider: Provider,
  { fetchGasPrice, earmarkTxData }: ExtraMiddlewareHandlers,
): Provider => {
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

  const composedProvider: Provider = providerFromEngine(engine)

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
