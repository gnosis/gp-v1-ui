import { Network, TokenDetails } from 'types'

import TokenListApiMock from 'api/tokenList/TokenListApiMock'
import { TokenListApiImpl, TokenList } from 'api/tokenList/TokenListApi'
import { tokenList } from '@gnosis.pm/dex-js'

let instanceMock: TokenList
let instanceReal: TokenList

beforeEach(() => {
  instanceMock = new TokenListApiMock(tokenList as TokenDetails[])
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
