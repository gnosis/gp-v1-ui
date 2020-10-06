import { Network } from 'types'

import TokenListApiMock from 'api/tokenList/TokenListApiMock'
import { TokenListApiImpl, TokenList } from 'api/tokenList/TokenListApi'
import { tokenList as testTokenList } from '../../data'
import SubscriptionBase from 'api/tokenList/Subscriptions'
import { tokenList as initialTokenList } from '@gnosis.pm/dex-js'

class GenericSubscriptions<T> extends SubscriptionBase<T> {
  // expose triggerSubscriptions for testing
  public triggerSubscriptions(newState: T): void {
    super.triggerSubscriptions(newState)
  }
}

let instanceMock: TokenList
let instanceReal: TokenList

beforeEach(() => {
  instanceMock = new TokenListApiMock(testTokenList)
  instanceReal = new TokenListApiImpl({ networkIds: [Network.Mainnet, Network.Rinkeby], initialTokenList })
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
  test('Mock API Token list has length 9', () => {
    const tokens = instanceMock.getTokens(1)
    expect(tokens.length).toBe(9)
  })
  test('Mock API Token list has expected token', () => {
    const tokens = instanceMock.getTokens(1)
    expect(instanceMock.hasToken({ tokenAddress: tokens[0].address, networkId: 1 })).toBe(true)
  })
  test('Mock API Token list can add tokens', () => {
    const tokens = instanceMock.getTokens(1)
    instanceMock.addToken({
      token: NEW_TOKEN,
      networkId: 1,
    })

    expect(instanceMock.hasToken({ tokenAddress: NEW_TOKEN.address, networkId: 1 })).toBe(true)
    expect(instanceMock.getTokens(1)).toHaveLength(tokens.length + 1)
    expect(instanceMock.getTokens(1)).toEqual(tokens.concat(NEW_TOKEN))
  })
})

describe('REAL: Basic functions', () => {
  test('API Token list has length 17', () => {
    const tokens = instanceReal.getTokens(1)
    expect(tokens.length).toBe(17)
  })
  test('API Token list has expected token', () => {
    const tokens = instanceReal.getTokens(1)
    expect(instanceReal.hasToken({ tokenAddress: tokens[0].address, networkId: 1 })).toBe(true)
  })
  test('API Token list can add tokens', () => {
    const tokens = instanceReal.getTokens(1)
    instanceReal.addToken({
      token: NEW_TOKEN,
      networkId: 1,
    })

    expect(instanceReal.hasToken({ tokenAddress: NEW_TOKEN.address, networkId: 1 })).toBe(true)
    expect(instanceReal.getTokens(1)).toHaveLength(tokens.length + 1)
    expect(instanceReal.getTokens(1)).toEqual(tokens.concat(NEW_TOKEN))

    const userListStringified = localStorage.getItem('USER_TOKEN_LIST_1')
    expect(userListStringified).toBeTruthy()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userList = JSON.parse(userListStringified!)
    expect(userList).toEqual([NEW_TOKEN])
  })
})

describe('GenericSubscription functions', () => {
  test('can add subscriptions', () => {
    const Subscriptions = new GenericSubscriptions<number>()
    const callback = jest.fn()

    Subscriptions.subscribe(callback)
  })
  test('can trigger subscriptions', () => {
    const Subscriptions = new GenericSubscriptions<number>()
    const callback = jest.fn()

    Subscriptions.subscribe(callback)

    Subscriptions.triggerSubscriptions(0)
    expect(callback).toHaveBeenCalledWith(0)
  })
  test('can remove subscriptions with ::unsubscribe', () => {
    const Subscriptions = new GenericSubscriptions<number>()
    const callback = jest.fn()

    Subscriptions.subscribe(callback)

    Subscriptions.triggerSubscriptions(0)
    expect(callback).toHaveBeenCalledWith(0)
    expect(callback).toHaveBeenCalledTimes(1)

    Subscriptions.unsubscribe(callback)

    Subscriptions.triggerSubscriptions(1)
    expect(callback).toHaveBeenCalledTimes(1)
  })
  test('can remove subscriptions with returned function', () => {
    const Subscriptions = new GenericSubscriptions<number>()
    const callback = jest.fn()

    const unsubscribe = Subscriptions.subscribe(callback)

    expect(unsubscribe).toBeInstanceOf(Function)

    Subscriptions.triggerSubscriptions(0)
    expect(callback).toHaveBeenCalledWith(0)
    expect(callback).toHaveBeenCalledTimes(1)

    unsubscribe()

    Subscriptions.triggerSubscriptions(1)
    expect(callback).toHaveBeenCalledTimes(1)
  })
  test('can remove all subscriptions with ::unsubscribeAll', () => {
    const Subscriptions = new GenericSubscriptions<number>()
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    Subscriptions.subscribe(callback1)
    Subscriptions.subscribe(callback2)

    Subscriptions.triggerSubscriptions(0)
    expect(callback1).toHaveBeenCalledWith(0)
    expect(callback1).toHaveBeenCalledTimes(1)

    expect(callback2).toHaveBeenCalledWith(0)
    expect(callback2).toHaveBeenCalledTimes(1)

    Subscriptions.unsubscribeAll()

    Subscriptions.triggerSubscriptions(1)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })
})
