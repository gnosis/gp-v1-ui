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
import Web3 from 'web3'
import { WebsocketProvider } from 'web3-core'
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

const WS_URL = 'wss://rinkeby.infura.io/ws/v3/607a7dfcb1ad4a0b83152e30ce20cfc5'
const createWSProvider = (url: string): WebsocketProvider => new Web3.providers.WebsocketProvider(url)

export const composeProviderWithWS = (provider: Provider): Provider => {
  const engine = new (RpcEngine as any)() as JsonRpcEngine
  console.log('CPROV::engine', engine)

  // Logger middleware
  engine.push((req, res, next) => {
    console.log('CPROV::Logger middleware')
    console.log('CPROV::req', req)
    console.log('CPROV::res', res)

    next(done => {
      // triggered at the end of all middlewares
      console.log('CPROV::FINAL res', res)
      done()
    })
  })

  const WSProvider = createWSProvider(WS_URL)
  // WSProvider.on('connect', () => console.log('CPROV::WS connect'))
  // // @ts-ignore
  // WSProvider.on('reconnect', (attempts: number) => console.log('CPROV::WS reconnect', attempts))
  // // @ts-ignore
  // WSProvider.on('close', (ev: any): void => console.log('CPROV::WS close', ev))
  // // @ts-ignore
  // WSProvider.on('error', (error: Error) => console.log('CPROV::WS error', error))

  const WSMware = providerAsMiddleware(WSProvider)

  const walletMware = providerAsMiddleware(provider)

  // fork middleware
  // req is handled by either MMask prov or WS prov
  engine.push((req, res, next, end) => {
    console.log('CPROV::REQ', req)
    if (req.method === 'eth_subscribe' && req.params[0] === 'newHeads') {
      console.log('CPROV::DELEGATING TO WS', req.params[0])
      // an interesting idea would be to use MMask for eth_sign|sendTransaction
      // ans WS for everything else
      WSMware(req, res, next, end)
    } else {
      // MMask provider can't handle eth_subscribe
      walletMware(req, res, next, end)
      // without handling eth_subscribe we can't know when tx is mined
      // => tx promise never resolves

      // while web3 handles subscriprion by polling internally
      // when we create a composed provider like this, that doesn't work

      // MMask likely does something clever with async tx receipt or something
      //  here maybe https://github.com/MetaMask/metamask-extension/blob/master/app/scripts/controllers/network/createMetamaskMiddleware.js
    }
  })

  const composedProvider: Provider = providerFromEngine(engine)

  // reemit all WS events
  WSProvider.on('connect', composedProvider.emit.bind(composedProvider, 'connect'))
  WSProvider.on('reconnect', composedProvider.emit.bind(composedProvider, 'reconnect'))
  WSProvider.on('close', composedProvider.emit.bind(composedProvider, 'close'))
  WSProvider.on('error', composedProvider.emit.bind(composedProvider, 'error'))
  // for subscriptions
  WSProvider.on('data', composedProvider.emit.bind(composedProvider, 'data'))

  // // @ts-ignore
  // WSProvider.on('data', (result: any) => {
  //   console.log('CPROV::WS data', result)
  //   composedProvider.emit('data', result) // reemit on the final provider for subscriptions
  // })

  // another middleware could modify data for example
  // for earmarking, etc.

  return composedProvider
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
}

export const composeProvider = (provider: Provider, { fetchGasPrice }: ExtraMiddlewareHandlers): Provider => {
  const engine = new (RpcEngine as any)() as JsonRpcEngine
  console.log('CPROV::engine', engine, engine.push)

  // Logger middleware
  engine.push((req, res, next) => {
    console.log('CPROV::Logger middleware')
    console.log('CPROV::req', { ...req })
    console.log('CPROV::res', { ...res })

    if (req.method === 'eth_gasPrice') {
      console.log('CPROV::ETH_GASPRICE')
    }

    next(done => {
      // triggered at the end of all middlewares
      console.log('CPROV::FINAL res', { ...res })
      done()
    })
  })

  engine.push(
    createConditionalMiddleware(
      req => req.method === 'eth_gasPrice',
      async (_req, res) => {
        const fetchedPrice = await fetchGasPrice()
        console.log('fetchedPrice', fetchedPrice, numberToHex(fetchedPrice!))

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

  const walletMware = providerAsMiddleware(provider)

  engine.push(walletMware)

  const composedProvider: Provider = providerFromEngine(engine)

  provider.on('data', (...params: any[]) => {
    console.log('CPROV::DATA FROM MMASK', ...params)
    // composedProvider.emit('data', ...params)
  })
  provider.on('message', (...params: any[]) => {
    console.log('CPROV::MESSAGE FROM MMASK', ...params)
  })
  provider.on('notification', (...params: any[]) => {
    console.log('CPROV::NOTIFICATION FROM MMASK', ...params)
    // composedProvider.emit('notification', ...params)
  })
  composedProvider.on('data', (...params: any[]) => {
    console.log('CPROV::DATA FROM COMPOSED', ...params)
  })
  composedProvider.on('message', (...params: any[]) => {
    console.log('CPROV::MESSAGE FROM COMPOSED', ...params)
  })
  composedProvider.on('notification', (...params: any[]) => {
    console.log('CPROV::NOTIFICATION FROM COMPOSED', ...params)
  })

  // NOTHING EVER TRIGGERS on engine, NONE OF THEM
  // @ts-ignore
  engine.on('data', message => {
    console.log('CPROV::DATA', message)
  })
  // @ts-ignore
  engine.on('message', message => {
    console.log('CPROV::MESSAGE', message)
  })
  // @ts-ignore
  engine.on('notification', message => {
    console.log('CPROV::NOTIFICATION', message)
  })

  // reemit all(likely) events from provider on composedProvider
  connectToReemit({
    from: provider,
    to: composedProvider,
    events: EVENTS_TO_REEMIT,
  })

  // // @ts-ignore
  // WSProvider.on('data', (result: any) => {
  //   console.log('CPROV::WS data', result)
  //   composedProvider.emit('data', result) // reemit on the final provider for subscriptions
  // })

  // another middleware could modify data for example
  // for earmarking, etc.

  return composedProvider
}
