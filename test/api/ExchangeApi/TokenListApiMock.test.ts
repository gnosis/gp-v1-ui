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

const NEW_TOKEN = {
  id: 7,
  name: 'New Token',
  symbol: 'NTK',
  decimals: 18,
  addressMainnet: '0x1234...',
  image: '',
  address: '0x1234...',
}

// TODO: These tests are dumb. Either do something meaningful or remove them entirely

describe('MOCK: Basic functions', () => {
  test('Mock API Token list has length 7', () => {
    const tokens = instanceMock.getTokens(1)
    expect(tokens.length).toBe(7)
  })
  test('Mock API Token list has expected token', () => {
    const tokens = instanceMock.getTokens(1)
    expect(instanceMock.hasToken({ tokenAddress: tokens[0].address, networkId: 1 })).toBe(true)
  })
  test('Mock API Token list can add tokens', () => {
    const length = instanceMock.getTokens(1).length
    instanceMock.addToken({
      token: NEW_TOKEN,
      networkId: 1,
    })

    expect(instanceMock.hasToken({ tokenAddress: NEW_TOKEN.address, networkId: 1 })).toBe(true)
    expect(instanceMock.getTokens(1)).toHaveLength(length + 1)
  })
})

describe('REAL: Basic functions', () => {
  test('API Token list has length 12', () => {
    const tokens = instanceReal.getTokens(1)
    expect(tokens.length).toBe(12)
  })
  test('API Token list has expected token', () => {
    const tokens = instanceReal.getTokens(1)
    expect(instanceReal.hasToken({ tokenAddress: tokens[0].address, networkId: 1 })).toBe(true)
  })
  test('API Token list can add tokens', () => {
    const length = instanceReal.getTokens(1).length
    instanceReal.addToken({
      token: NEW_TOKEN,
      networkId: 1,
    })

    expect(instanceReal.hasToken({ tokenAddress: NEW_TOKEN.address, networkId: 1 })).toBe(true)
    expect(instanceReal.getTokens(1)).toHaveLength(length + 1)

    const userListStringified = localStorage.getItem('USER_TOKEN_LIST_1')
    expect(userListStringified).toBeTruthy()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userList = JSON.parse(userListStringified!)
    expect(userList).toEqual([NEW_TOKEN])
  })
})
