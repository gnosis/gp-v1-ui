import ExchangeApiMock from 'api/exchange/ExchangeApiMock'
import Erc20ApiMock from 'api/erc20/Erc20ApiMock'
import { BATCH_TIME, ZERO, ONE } from 'const'
import { ExchangeApi, Erc20Api } from 'types'
import * as testHelpers from '../../testHelpers'

const { USER_1, FEE_TOKEN, TOKEN_1, TOKEN_2, TOKEN_4, TOKEN_5, TOKEN_6, AMOUNT, AMOUNT_SMALL } = testHelpers

jest.mock('api/erc20/Erc20ApiMock')

let instance: ExchangeApi
let mockErc20Api: Erc20Api

beforeAll(() => {
  testHelpers.mockTimes()
})

beforeEach(() => {
  mockErc20Api = new Erc20ApiMock()
  const tokens = [FEE_TOKEN, TOKEN_1, TOKEN_2]
  instance = new ExchangeApiMock(
    {
      [USER_1]: {
        [TOKEN_1]: {
          balance: ZERO,
          pendingDeposits: { amount: ZERO, batchId: 0 },
          pendingWithdraws: { amount: ZERO, batchId: 0 },
        },
        [TOKEN_2]: {
          balance: AMOUNT,
          pendingDeposits: { amount: ZERO, batchId: 0 },
          pendingWithdraws: { amount: ZERO, batchId: 0 },
        },
        [TOKEN_4]: {
          balance: ZERO,
          pendingDeposits: { amount: AMOUNT, batchId: 1 },
          pendingWithdraws: { amount: AMOUNT, batchId: 1 },
        },
        [TOKEN_5]: {
          balance: AMOUNT,
          pendingDeposits: { amount: AMOUNT, batchId: testHelpers.BATCH_ID },
          pendingWithdraws: { amount: AMOUNT, batchId: testHelpers.BATCH_ID },
        },
        [TOKEN_6]: {
          balance: AMOUNT,
          pendingDeposits: { amount: AMOUNT_SMALL, batchId: 1 },
          pendingWithdraws: { amount: AMOUNT_SMALL, batchId: 1 },
        },
      },
    },
    mockErc20Api,
    tokens,
    {
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
    },
  )
})

describe('Basic view functions', () => {
  test('batch time', async () => {
    expect(await instance.getBatchTime()).toBe(BATCH_TIME)
  })
})
