import { DepositApi } from 'types'

import { BATCH_TIME, ZERO, TWO } from 'constants/'
import { DepositApiMock } from 'api/ExchangeApi/mock/DepositApiMock'
import * as testHelpers from '../../testHelpers'

const { USER_1, USER_2, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, AMOUNT } = testHelpers

let instance: DepositApi

beforeAll(() => {
  testHelpers.mockTimes()
})

beforeEach(() => {
  instance = new DepositApiMock({
    [USER_1]: {
      [TOKEN_1]: {
        balance: ZERO,
        pendingDeposits: { amount: ZERO, stateIndex: 0 },
        pendingWithdraws: { amount: ZERO, stateIndex: 0 },
      },
      [TOKEN_2]: {
        balance: AMOUNT,
        pendingDeposits: { amount: ZERO, stateIndex: 0 },
        pendingWithdraws: { amount: ZERO, stateIndex: 0 },
      },
      [TOKEN_4]: {
        balance: ZERO,
        pendingDeposits: { amount: AMOUNT, stateIndex: 1 },
        pendingWithdraws: { amount: AMOUNT, stateIndex: 1 },
      },
      [TOKEN_5]: {
        balance: ZERO,
        pendingDeposits: { amount: AMOUNT, stateIndex: testHelpers.BATCH_NUMBER },
        pendingWithdraws: { amount: AMOUNT, stateIndex: testHelpers.BATCH_NUMBER },
      },
    },
  })
})

describe('Basic view functions', () => {
  test('Get batch time', async () => {
    const batchTime = await instance.getBatchTime()
    expect(batchTime).toBe(BATCH_TIME)
  })

  test('Get current batch number (state index)', async () => {
    const batchNumber = await instance.getCurrentBatchNumber()
    expect(batchNumber).toBe(testHelpers.BATCH_NUMBER)
  })

  test('Get seconds remaining in batch', async () => {
    const remainingSeconds = await instance.getSecondsRemainingInBatch()
    expect(remainingSeconds).toBe(BATCH_TIME - testHelpers.BATCH_SECOND)
  })
})

describe('Get balance', () => {
  test('Unknown user address', async () => {
    // GIVEN: A user that doesn't have any deposits

    // WHEN: We get the balance
    const balance = await instance.getBalance(USER_2, TOKEN_1)

    // THEN: The balance is zero
    expect(balance).toEqual(ZERO)
  })

  test('Unknown token', async () => {
    // GIVEN: A user that has deposits for some tokens, but not for TOKEN_3

    // WHEN: We get the balance for TOKEN_3
    const balance = await instance.getBalance(USER_1, TOKEN_3)

    // THEN: The balance is zero
    expect(balance).toEqual(ZERO)
  })

  test('Token with no balance', async () => {
    // GIVEN: A user that has balance zero for TOKEN_1

    // WHEN: We get the balance for TOKEN_1
    const balance = await instance.getBalance(USER_1, TOKEN_1)

    // THEN: The balance is zero
    expect(balance).toEqual(ZERO)
  })

  test('Token with balance', async () => {
    // GIVEN: A user that has balance for TOKEN_2

    // WHEN: We get the balance for TOKEN_2
    const balance = await instance.getBalance(USER_1, TOKEN_2)

    // THEN: The balance is AMOUNT
    expect(balance).toEqual(AMOUNT)
  })
})

describe('Get pending deposit amounts', () => {
  test('Unknown user address', async () => {
    // GIVEN: An user that hasn't deposit any tokens yet
    // WHEN: -

    // THEN: there's no pending deposits
    expect(await instance.getPendingDepositAmount(USER_2, TOKEN_1)).toEqual(ZERO)

    // THEN: there's no batch number
    expect(await instance.getPendingDepositBatchNumber(USER_2, TOKEN_1)).toEqual(0)
  })

  test('Unknown token', async () => {
    // GIVEN: An user with no token balance for TOKEN_3
    // WHEN: -

    // THEN: there's no pending deposits
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_3)).toEqual(ZERO)

    // THEN: there's no batch number
    expect(await instance.getPendingDepositBatchNumber(USER_1, TOKEN_3)).toEqual(0)
  })

  test('No pending balance', async () => {
    // GIVEN: An user with no balance for TOKEN_2
    // WHEN: -

    // THEN: there's no pending deposits
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_2)).toEqual(ZERO)
  })
})

describe('Get pending withdraw amounts', () => {
  test('Unknown user address', async () => {
    // GIVEN: An user that hasn't any tokens yet
    // WHEN: -

    // THEN: there's no pending withdraws
    expect(await instance.getPendingWithdrawAmount(USER_2, TOKEN_1)).toEqual(ZERO)

    // THEN: there's no batch number
    expect(await instance.getPendingWithdrawBatchNumber(USER_2, TOKEN_1)).toEqual(0)
  })

  test('Unknown token', async () => {
    // GIVEN: An user with no token balance for TOKEN_3
    // WHEN: -

    // THEN: there's no pending withdraws
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_3)).toEqual(ZERO)

    // THEN: there's no batch number
    expect(await instance.getPendingWithdrawBatchNumber(USER_1, TOKEN_3)).toEqual(0)
  })

  test('No pending balance', async () => {
    // GIVEN: An user with no balance for TOKEN_2
    // WHEN: -

    // THEN: there's no pending withdraws
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_2)).toEqual(ZERO)
  })
})

describe('Deposit', () => {
  test('Unknown token', async () => {
    // GIVEN: An user with no token balance for TOKEN_3 and no pending deposits
    expect(await instance.getBalance(USER_1, TOKEN_3)).toEqual(ZERO)
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_3)).toEqual(ZERO)

    // WHEN: Deposits AMOUNT
    await instance.deposit(USER_1, TOKEN_3, AMOUNT)

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_3)).toEqual(ZERO)

    // THEN: There's a pending deposit of AMOUNT
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_3)).toEqual(AMOUNT)
  })

  test('No balance', async () => {
    // GIVEN: An user with no token balance for TOKEN_1 and no pending deposits
    expect(await instance.getBalance(USER_1, TOKEN_1)).toEqual(ZERO)
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_1)).toEqual(ZERO)

    // WHEN: Deposits AMOUNT
    await instance.deposit(USER_1, TOKEN_1, AMOUNT)

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_1)).toEqual(ZERO)

    // THEN: There's a pending deposit of AMOUNT
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_1)).toEqual(AMOUNT)
  })

  test('Applicable pending balance', async () => {
    // GIVEN: An user with no balance for TOKEN_4, and applicable pending deposits
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(ZERO)
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_4)).toEqual(AMOUNT)

    // WHEN: Deposits AMOUNT
    await instance.deposit(USER_1, TOKEN_4, AMOUNT)

    // THEN: The previous pending deposit is applied
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(AMOUNT)

    // THEN: There's a pending deposit of AMOUNT
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_4)).toEqual(AMOUNT)
  })

  test('Unapplicable pending balance', async () => {
    // GIVEN: An user with no balance for TOKEN_5 and a non applicable pending deposit
    expect(await instance.getBalance(USER_1, TOKEN_5)).toEqual(ZERO)
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_5)).toEqual(AMOUNT)

    // WHEN: Deposits AMOUNT
    await instance.deposit(USER_1, TOKEN_5, AMOUNT)

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_5)).toEqual(ZERO)

    // THEN: There's a pending deposit of AMOUNT + AMOUNT
    expect(await instance.getPendingDepositAmount(USER_1, TOKEN_5)).toEqual(AMOUNT.add(AMOUNT))
  })
})

describe.only('Request withdraw', () => {
  test('Unknown token', async () => {
    // GIVEN: An user with no token balance for TOKEN_3 and no pending withdraw
    expect(await instance.getBalance(USER_1, TOKEN_3)).toEqual(ZERO)
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_3)).toEqual(ZERO)

    // WHEN: Requesting a withdraw of AMOUNT
    await instance.requestWithdraw(USER_1, TOKEN_3, AMOUNT)

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_3)).toEqual(ZERO)

    // THEN: There's a pending withdraw of AMOUNT
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_3)).toEqual(AMOUNT)
  })

  test('No balance', async () => {
    // GIVEN: An user with no token balance for TOKEN_1 and no pending withdraw
    expect(await instance.getBalance(USER_1, TOKEN_1)).toEqual(ZERO)
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_1)).toEqual(ZERO)

    // WHEN: Requesting a withdraw of AMOUNT
    await instance.requestWithdraw(USER_1, TOKEN_1, AMOUNT)

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_1)).toEqual(ZERO)

    // THEN: There's a pending deposit of AMOUNT
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_1)).toEqual(AMOUNT)
  })

  test('Increase previous withdraw request amount', async () => {
    // GIVEN: An user with no balance for TOKEN_4, and a previous pending withdraw of AMOUNT
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(ZERO)
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_4)).toEqual(AMOUNT)

    // WHEN: Requesting a withdraw of 2 * AMOUNT
    await instance.requestWithdraw(USER_1, TOKEN_4, AMOUNT.mul(TWO))

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(ZERO)

    // THEN: There's a pending deposit of 2 * AMOUNT
    expect((await instance.getPendingWithdrawAmount(USER_1, TOKEN_4)).toString()).toEqual(AMOUNT.mul(TWO).toString())
  })

  test('Decrease previous withdraw request amount', async () => {
    // GIVEN: An user with no balance for TOKEN_4, and a previous pending withdraw of AMOUNT
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(ZERO)
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_4)).toEqual(AMOUNT)

    // WHEN: Requesting a withdraw of 2 * AMOUNT
    await instance.requestWithdraw(USER_1, TOKEN_4, AMOUNT.div(TWO))

    // THEN: There's still no balance
    expect(await instance.getBalance(USER_1, TOKEN_4)).toEqual(ZERO)

    // THEN: There's a pending deposit of 2 * AMOUNT
    expect(await instance.getPendingWithdrawAmount(USER_1, TOKEN_4)).toEqual(AMOUNT.div(TWO))
  })
})
