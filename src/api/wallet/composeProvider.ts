/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import RpcEngine, {
  JsonRpcEngine,
  JsonRpcMiddleware,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
} from 'json-rpc-engine'
// import providerAsMiddleware from 'eth-json-rpc-middleware/providerAsMiddleware'
import providerFromEngine from 'eth-json-rpc-middleware/providerFromEngine'
import { Provider } from '@gnosis.pm/dapp-ui'
import { WebsocketProvider, TransactionConfig } from 'web3-core'
import { EventEmitter } from 'events'
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

//  EIP 1193 events (including deprecated) + 'data' + WS events + WC events
// a good idea is to include all known events
const EVENTS_TO_REEMIT = [
  'connect',
  'disconnect',
  'close',
  'chainChanged',
  'networkChanged',
  'accountsChanged',
  'message',
  'notification',
  'data',
  'open',
  'reconnect',
  'error',
]

interface ConnectToReemitParams {
  from: EventEmitter
  to: EventEmitter
  events: string[]
}

const connectToReemit = ({ from, to, events }: ConnectToReemitParams): void => {
  events.forEach(event => from.on(event, to.emit.bind(to, event)))
}

const createConditionalMiddleware = (
  condition: (req: JsonRpcRequest<any>) => boolean,
  handle: (req: JsonRpcRequest<any>, res: JsonRpcResponse<any>) => boolean | Promise<boolean>, // handled -- true, not --false
): JsonRpcMiddleware => {
  return async (req, res, next, end): Promise<void> => {
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
  const engine = new (RpcEngine as any)() as JsonRpcEngine

  engine.push(
    createConditionalMiddleware(
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
    createConditionalMiddleware(
      req => req.method === 'eth_sendTransaction',
      async (req: JsonRpcRequest<TransactionConfig[]>) => {
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

  // reemit all(likely) events from provider on composedProvider
  connectToReemit({
    from: provider,
    to: composedProvider,
    events: EVENTS_TO_REEMIT,
  })

  return composedProvider
}
