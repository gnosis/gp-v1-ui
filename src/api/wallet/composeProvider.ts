/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import RpcEngine, { JsonRpcEngine, JsonRpcMiddleware, JsonRpcResponse, JsonRpcError } from 'json-rpc-engine'
// const RpcEngine = require('json-rpc-engine')
// import providerAsMiddleware from 'eth-json-rpc-middleware/providerAsMiddleware'
import providerFromEngine from 'eth-json-rpc-middleware/providerFromEngine'
import { Provider } from '@gnosis.pm/dapp-ui'
import Web3 from 'web3'
import { WebsocketProvider } from 'web3-core'

// custom providerAsMiddleware
function providerAsMiddleware(provider: Provider | WebsocketProvider): JsonRpcMiddleware {
  return (req, res, _next, end): void => {
    // send request to provider

    // MMask provider uses sendAsync
    // WS provider doesn't have sendAsync
    const sendFName = 'sendAsync' in provider ? 'sendAsync' : 'send'

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

export const composeProvider = (provider: Provider): Provider => {
  const engine = new (RpcEngine as any)() as JsonRpcEngine
  console.log('engine', engine, engine.push)

  // Logger middleware
  engine.push((req, res, next) => {
    console.group('Logger middleware')
    console.log('req', req)
    console.log('res', res)
    console.groupEnd()

    // if (req.method === 'eth_subscribe' && req.params[0] === 'newHeads') {
    //   req.params[0] = 'newBlockHeaders'
    //   console.log('OVERRRIDE')
    // }

    next(done => {
      // triggered at the end of all middlewares
      console.log('FINAL res', res)
      done()
    })
  })

  const WSProvider = createWSProvider(WS_URL)
  // WSProvider.on('connect', () => console.log('WS connect'))
  // // @ts-ignore
  // WSProvider.on('reconnect', (attempts: number) => console.log('WS reconnect', attempts))
  // // @ts-ignore
  // WSProvider.on('close', (ev: any): void => console.log('WS close', ev))
  // // @ts-ignore
  // WSProvider.on('error', (error: Error) => console.log('WS error', error))

  const WSMware = providerAsMiddleware(WSProvider)

  const walletMware = providerAsMiddleware(provider)

  // fork middleware
  // req is handled by either MMask prov or WS prov
  engine.push((req, res, next, end) => {
    console.log('REQ', req)
    if (req.method === 'eth_subscribe' && req.params[0] === 'newHeads') {
      console.log('DELEGATING TO WS', req.params[0])
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

  const composedProvider = providerFromEngine(engine)

  // reemit all WS events
  WSProvider.on('connect', composedProvider.emit.bind(composedProvider, 'connect'))
  WSProvider.on('reconnect', composedProvider.emit.bind(composedProvider, 'reconnect'))
  WSProvider.on('close', composedProvider.emit.bind(composedProvider, 'close'))
  WSProvider.on('error', composedProvider.emit.bind(composedProvider, 'error'))
  // for subscriptions
  WSProvider.on('data', composedProvider.emit.bind(composedProvider, 'data'))

  // // @ts-ignore
  // WSProvider.on('data', (result: any) => {
  //   console.log('WS data', result)
  //   composedProvider.emit('data', result) // reemit on the final provider for subscriptions
  // })

  // another middleware could modify data for example
  // for earmarking, etc.

  return composedProvider
}
