import BN from 'bn.js'
import assert from 'assert'

import { getEpoch } from 'utils'
import { ZERO, BATCH_TIME } from 'constants/'

import { DepositApi, BalanceState } from 'types'

export class DepositApiMock implements DepositApi {
  private _balanceStates: { [userAddress: string]: { [tokenAddress: string]: BalanceState } } = {}

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
    // Create the balance state if it's the first deposit
    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._balanceStates[userAddress][tokenAddress]
    if (!balanceState) {
      balanceState = this._initBalanceState(userAddress, tokenAddress, currentStateIndex)
    }

    // Update any unapplied deposit
    this._updateDepositsBalance(userAddress, tokenAddress, currentStateIndex)

    balanceState.pendingDeposits.amount.add(amount)
    balanceState.pendingDeposits.stateIndex = currentStateIndex
  }

  public async requestWithdraw(userAddress: string, tokenAddress: string, amount: BN): Promise<void> {
    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._balanceStates[userAddress][tokenAddress]
    if (!balanceState) {
      balanceState = this._initBalanceState(userAddress, tokenAddress, currentStateIndex)
    }
    balanceState.pendingDeposits = {
      amount,
      stateIndex: currentStateIndex,
    }
  }

  public async withdraw(userAddress: string, tokenAddress: string): Promise<void> {
    const currentStateIndex = await this.getCurrentBatchNumber()
    let balanceState = this._balanceStates[userAddress][tokenAddress]
    const pendingWithdraws = balanceState.pendingWithdraws
    const amount = pendingWithdraws.amount

    assert(!amount.isZero, "There wasn't any previous pending withdraw")
    assert(pendingWithdraws.stateIndex < currentStateIndex, 'The withdraw request is not settled yet')

    pendingWithdraws.amount = ZERO
    balanceState.balance = balanceState.balance.sub(amount)
  }
  public async getBalance(userAddress: string, tokenAddress: string): Promise<BN> {
    let balanceState = this._balanceStates[userAddress][tokenAddress]

    return balanceState.balance
  }

  public async getPendingDepositAmount(userAddress: string, tokenAddress: string): Promise<BN> {
    let balanceState = this._balanceStates[userAddress][tokenAddress]

    return balanceState.pendingDeposits.amount
  }

  public async getPendingDepositBatchNumber(userAddress: string, tokenAddress: string): Promise<number> {
    let balanceState = this._balanceStates[userAddress][tokenAddress]

    return balanceState.pendingDeposits.stateIndex
  }

  public async getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN> {
    let balanceState = this._balanceStates[userAddress][tokenAddress]

    return balanceState.pendingWithdraws.amount
  }

  public async getPendingWithdrawBatchNumber(userAddress: string, tokenAddress: string): Promise<number> {
    let balanceState = this._balanceStates[userAddress][tokenAddress]

    return balanceState.pendingWithdraws.stateIndex
  }

  /********************************    private methods   ********************************/
  private _initBalanceState(userAddress: string, tokenAddress: string, currentStateIndex: number): BalanceState {
    const balanceState: BalanceState = {
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

    this._balanceStates[userAddress][tokenAddress] = balanceState
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
