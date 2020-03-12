import { Network } from 'types'

import TokenListApiMock from 'api/tokenList/TokenListApiMock'
import { TokenListApiImpl, TokenList } from 'api/tokenList/TokenListApi'
import { tokenList as testTokenList } from '../../data'

let instanceMock: TokenList
let instanceReal: TokenList

beforeEach(() => {
  instanceMock = new TokenListApiMock(testTokenList)
  instanceReal = new TokenListApiImpl([Network.Mainnet, Network.Rinkeby])
})

// TODO: These tests are dumb. Either do something meaningful or remove them entirely

describe('MOCK: Basic view functions', () => {
  test('Mock API Token list has length 7', () => {
    const tokens = instanceMock.getTokens(1)
    expect(tokens.length).toBe(7)
  })
})

describe('REAL: Basic view functions', () => {
  test('API Token list has length 12', () => {
    const tokens = instanceReal.getTokens(1)
    expect(tokens.length).toBe(12)
  })
})
