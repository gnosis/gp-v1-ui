import { Network, TokenList, ExchangeApi, Erc20Api } from 'types'

import TokenListApiMock from 'api/tokenList/TokenListApiMock'
import TokenListApiImpl from 'api/tokenList/TokenListApiImpl'
import ExchangeApiMock from 'api/exchange/ExchangeApiMock'
import Erc20ApiMock from 'api/erc20/Erc20ApiMock'
import tokens from 'api/tokenList/tokenList'

jest.mock('api/exchange/ExchangeApiMock')
jest.mock('api/erc20/Erc20ApiMock')

let instanceMock: TokenList
let instanceReal: TokenList
let erc20apiMock: Erc20Api
let exchangeApiMock: ExchangeApi

beforeEach(() => {
  instanceMock = new TokenListApiMock(tokens)

  erc20apiMock = new Erc20ApiMock()
  exchangeApiMock = new ExchangeApiMock({ erc20Api: erc20apiMock })
  instanceReal = new TokenListApiImpl([Network.Mainnet, Network.Rinkeby], exchangeApiMock)
})

describe('MOCK: Basic view functions', () => {
  test('Mock API Token list has length 7', () => {
    const tokens = instanceMock.getTokens(1)
    expect(tokens.length).toBe(7)
  })
})

describe('REAL: Basic view functions', () => {
  test('API Token list has length 7', () => {
    const tokens = instanceReal.getTokens(1)
    expect(tokens.length).toBe(7)
  })
})
