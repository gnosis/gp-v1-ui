import ExchangeApiMock from 'api/exchange/ExchangeApiMock'
import Erc20ApiMock from 'api/erc20/Erc20ApiMock'
import { ZERO, ONE, FEE_DENOMINATOR } from 'const'
import { ExchangeApi, Erc20Api } from 'types'
import * as testHelpers from '../../testHelpers'

const { USER_1, USER_2, USER_3, FEE_TOKEN, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, BATCH_ID } = testHelpers

jest.mock('api/erc20/Erc20ApiMock')

let instance: ExchangeApi
let mockErc20Api: Erc20Api
const tokens = [FEE_TOKEN, TOKEN_1, TOKEN_2]

beforeAll(() => {
  testHelpers.mockTimes()
})

beforeEach(() => {
  mockErc20Api = new Erc20ApiMock()
  instance = new ExchangeApiMock({}, mockErc20Api, tokens, 4, {
    [USER_1]: [
      {
        buyTokenId: 1,
        sellTokenId: 2,
        validFrom: 0,
        validUntil: 6,
        priceNumerator: ONE,
        priceDenominator: ZERO,
        remainingAmount: ONE,
      },
    ],
  })
})

describe('Basic view functions', () => {
  test('fee denominator', async () => {
    expect(await instance.getFeeDenominator()).toBe(FEE_DENOMINATOR)
  })

  test('num tokens', async () => {
    expect(await instance.getNumTokens()).toBe(tokens.length)
  })

  describe('get orders', () => {
    it('returns empty when no orders placed by user', async () => {
      expect(await instance.getOrders(USER_2)).toHaveLength(0)
    })

    it('returns all placed orders', async () => {
      expect(await instance.getOrders(USER_1)).toHaveLength(1)
    })
  })
})

describe('Token view methods', () => {
  describe('get token id by address', () => {
    it('returns correct id when found', async () => {
      expect(await instance.getTokenIdByAddress(tokens[1])).toBe(1)
    })

    it('throws when id not found', async () => {
      try {
        await instance.getTokenIdByAddress(TOKEN_4)
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/^Must have Address to get ID$/)
      }
    })
  })

  describe('get token address by id', () => {
    it('returns correct address when found', async () => {
      expect(await instance.getTokenAddressById(0)).toBe(tokens[0])
    })

    it('throws when address not found', async () => {
      try {
        await instance.getTokenAddressById(10)
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/^Must have ID to get Address$/)
      }
    })
  })
})

describe('addToken', () => {
  it('adds token not registered', async () => {
    const tokenCount = await instance.getNumTokens()

    await instance.addToken(TOKEN_3)

    expect(await instance.getNumTokens()).toBe(tokenCount + 1)
    expect(await instance.getTokenIdByAddress(TOKEN_3)).toBe(tokenCount)
    expect(await instance.getTokenAddressById(tokenCount)).toBe(TOKEN_3)
  })

  it('throws when token already registered', async () => {
    try {
      await instance.addToken(tokens[0])
      fail('Should not reach')
    } catch (e) {
      expect(e.message).toMatch(/^Token already registered$/)
    }
  })
  it('throws when MAX_TOKENS reached', async () => {
    try {
      await instance.addToken(TOKEN_4)
      fail('Should not reach')
    } catch (e) {
      expect(e.message).toMatch(/^Max tokens reached$/)
    }
  })
})

describe('placeOrder', () => {
  const expected = {
    buyTokenId: 1,
    sellTokenId: 2,
    validFrom: BATCH_ID,
    validUntil: BATCH_ID + 6,
    priceNumerator: ONE,
    priceDenominator: ONE,
    remainingAmount: ONE,
  }

  const params = {
    userAddress: '',
    buyTokenId: expected.buyTokenId,
    sellTokenId: expected.sellTokenId,
    validUntil: expected.validUntil,
    buyAmount: expected.priceNumerator,
    sellAmount: expected.priceDenominator,
  }

  test('place order not first', async () => {
    const ordersCount = (await instance.getOrders(USER_1)).length

    params.userAddress = USER_1
    expect(await instance.placeOrder(params)).toBe(ordersCount)
    const actual = (await instance.getOrders(USER_1)).pop()
    expect(actual).toEqual(expected)
  })

  test('place first order', async () => {
    expect((await instance.getOrders(USER_3)).length).toBe(0)
    params.userAddress = USER_2

    expect(await instance.placeOrder(params)).toBe(0)
    const actual = (await instance.getOrders(USER_2)).pop()
    expect(actual).toEqual(expected)
  })
})
describe('cancelOrder', () => {
  test('cancel existing order', async () => {
    const orderId = (await instance.getOrders(USER_1)).length - 1

    await instance.cancelOrder(USER_1, orderId)

    const actual = (await instance.getOrders(USER_1))[orderId]
    expect(actual.validUntil).toBe(BATCH_ID - 1)
  })

  test('cancel non existing order does nothing', async () => {
    const expected = await instance.getOrders(USER_1)

    await instance.cancelOrder(USER_1, expected.length + 1)

    const actual = await instance.getOrders(USER_1)
    expect(actual).toEqual(expected)
  })

  test('cancel non existing order, user with no orders does nothing', async () => {
    const expected = await instance.getOrders(USER_2)

    await instance.cancelOrder(USER_2, expected.length + 1)

    const actual = await instance.getOrders(USER_2)
    expect(actual).toEqual(expected)
  })
})
