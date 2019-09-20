import BN from 'bn.js'
import assert from 'assert'

import { getEpoch, formatAmount, log, wait } from 'utils'
import { ZERO, BATCH_TIME } from 'const'
import { CONTRACT } from '../../../../test/data'

import { DepositApi, BalanceState } from 'types'

interface BalancesByUserAndToken {
  [userAddress: string]: { [tokenAddress: string]: BalanceState }
}

export class DepositApiMock implements DepositApi {
  private _balanceStates: BalancesByUserAndToken

  public constructor(balanceStates: BalancesByUserAndToken = {}) {
    this._balanceStates = balanceStates
  }

  public getContractAddress(): string {
    return CONTRACT
  }

  public async getBatchTime(): Promise<number> {
    return BATCH_TIME
  }

  public async getCurrentBatchNumber(): Promise<number> {
    return Math.floor(getEpoch() / BATCH_TIME)
  }

  public async getSecondsRemainingInBatch(): Promise<number> {
    return BATCH_TIME - (getEpoch() % BATCH_TIME)
  }

  public async deposit(userAddress: string, tokenAddress: string, amount: BN): Promise<void> {
    await wait()

    // Create the balance state if it's the first deposit
    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentStateIndex)

    // Update any unapplied deposit
    this._updateDepositsBalance(userAddress, tokenAddress, currentStateIndex)

    const pendingDeposits = balanceState.pendingDeposits
    pendingDeposits.amount = pendingDeposits.amount.add(amount)
    pendingDeposits.stateIndex = currentStateIndex
    log(`[DepositApiMock] Deposited ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
  }

  public async requestWithdraw(userAddress: string, tokenAddress: string, amount: BN): Promise<void> {
    await wait()

    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentStateIndex)

    balanceState.pendingWithdraws = {
      amount,
      stateIndex: currentStateIndex,
    }
    log(`[DepositApiMock] Requested withdraw of ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
  }

  public async withdraw(userAddress: string, tokenAddress: string): Promise<void> {
    await wait()

    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentStateIndex)

    const pendingWithdraws = balanceState.pendingWithdraws

    // Check that the user has balance, and the proper request
    //  The restrictions are stronger than in the smart contract
    assert(!pendingWithdraws.amount.isZero(), "There wasn't any previous pending withdraw")
    assert(!balanceState.balance.isZero(), "There user doesn't have any balance")
    assert(pendingWithdraws.stateIndex < currentStateIndex, 'The withdraw request is not settled yet')

    const amount = BN.min(pendingWithdraws.amount, balanceState.balance)
    pendingWithdraws.amount = ZERO
    balanceState.balance = balanceState.balance.sub(amount)
    log(`[DepositApiMock] Withdraw ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
  }
  public async getBalance(userAddress: string, tokenAddress: string): Promise<BN> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return ZERO
    }

    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.balance : ZERO
  }

  public async getPendingDepositAmount(userAddress: string, tokenAddress: string): Promise<BN> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return ZERO
    }
    const balanceState = userBalanceStates[tokenAddress]

    return balanceState ? balanceState.pendingDeposits.amount : ZERO
  }

  public async getPendingDepositBatchNumber(userAddress: string, tokenAddress: string): Promise<number> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return 0
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingDeposits.stateIndex : 0
  }

  public async getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return ZERO
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingWithdraws.amount : ZERO
  }

  public async getPendingWithdrawBatchNumber(userAddress: string, tokenAddress: string): Promise<number> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return 0
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingWithdraws.stateIndex : 0
  }

  /********************************    private methods   ********************************/
  private _initBalanceState(userAddress: string, tokenAddress: string, currentStateIndex: number): BalanceState {
    let userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      userBalanceStates = {}
      this._balanceStates[userAddress] = userBalanceStates
    }

    let balanceState = userBalanceStates[tokenAddress]
    if (!balanceState) {
      balanceState = {
        balance: ZERO,
        pendingDeposits: {
          stateIndex: currentStateIndex,
          amount: ZERO,
        },
        pendingWithdraws: {
          stateIndex: currentStateIndex,
          amount: ZERO,
        },
      }
      userBalanceStates[tokenAddress] = balanceState
    }

    return balanceState
  }

  private _updateDepositsBalance(userAddress: string, tokenAddress: string, currentStateIndex: number): void {
    const balanceState = this._balanceStates[userAddress][tokenAddress]
    const pendingDeposits = balanceState.pendingDeposits

    if (
      // There's a pending deposit
      !pendingDeposits.amount.isZero() &&
      // ...and, the deposit is applicable
      pendingDeposits.stateIndex < currentStateIndex
    ) {
      balanceState.balance = balanceState.balance.add(pendingDeposits.amount)
      pendingDeposits.amount = ZERO
    }
  }
}
