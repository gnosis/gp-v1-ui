import { Network, TokenList } from 'types'

import TokenListApiMock from 'api/tokenList/TokenListApiMock'
import TokenListApiImpl from 'api/tokenList/TokenListApiImpl'
import tokens from 'api/tokenList/tokenList'

let instanceMock: TokenList
let instanceReal: TokenList

beforeEach(() => {
  instanceMock = new TokenListApiMock(tokens)
  instanceReal = new TokenListApiImpl([Network.Mainnet, Network.Rinkeby])
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
