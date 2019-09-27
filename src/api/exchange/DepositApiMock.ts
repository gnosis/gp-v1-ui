import BN from 'bn.js'
import assert from 'assert'

import { getEpoch, formatAmount, log } from 'utils'
import { ZERO, BATCH_TIME } from 'const'
import { CONTRACT, RECEIPT } from '../../../test/data'

import { DepositApi, BalanceState, TxResult, TxOptionalParams, Erc20Api } from 'types'
import { waitAndSendReceipt } from 'utils/mock'

export interface BalancesByUserAndToken {
  [userAddress: string]: { [tokenAddress: string]: BalanceState }
}

export class DepositApiMock implements DepositApi {
  private _balanceStates: BalancesByUserAndToken
  private _erc20Api: Erc20Api

  public constructor(balanceStates: BalancesByUserAndToken, erc20Api: Erc20Api) {
    this._balanceStates = balanceStates
    this._erc20Api = erc20Api
  }

  public getContractAddress(): string {
    return CONTRACT
  }

  public async getBatchTime(): Promise<number> {
    return BATCH_TIME
  }

  public async getCurrentBatchId(): Promise<number> {
    return Math.floor(getEpoch() / BATCH_TIME)
  }

  public async getSecondsRemainingInBatch(): Promise<number> {
    return BATCH_TIME - (getEpoch() % BATCH_TIME)
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

  public async getPendingDepositBatchId(userAddress: string, tokenAddress: string): Promise<number> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return 0
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingDeposits.batchId : 0
  }

  public async getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return ZERO
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingWithdraws.amount : ZERO
  }

  public async getPendingWithdrawBatchId(userAddress: string, tokenAddress: string): Promise<number> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return 0
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingWithdraws.batchId : 0
  }

  public async deposit(
    userAddress: string,
    tokenAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>> {
    await waitAndSendReceipt({ txOptionalParams })

    // Create the balance state if it's the first deposit
    const currentBatchId = await this.getCurrentBatchId()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentBatchId)

    // Update any unapplied deposit
    this._updateDepositsBalance(userAddress, tokenAddress, currentBatchId)

    const pendingDeposits = balanceState.pendingDeposits
    pendingDeposits.amount = pendingDeposits.amount.add(amount)
    pendingDeposits.batchId = currentBatchId
    log(`[DepositApiMock] Deposited ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
    return { data: undefined, receipt: RECEIPT }
  }

  public async requestWithdraw(
    userAddress: string,
    tokenAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>> {
    await waitAndSendReceipt({ txOptionalParams })

    const currentBatchId = await this.getCurrentBatchId()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentBatchId)

    balanceState.pendingWithdraws = {
      amount,
      batchId: currentBatchId,
    }

    log(`[DepositApiMock] Requested withdraw of ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
    return { data: undefined, receipt: RECEIPT }
  }

  public async withdraw(
    userAddress: string,
    tokenAddress: string,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>> {
    await waitAndSendReceipt({ txOptionalParams })

    const currentBatchId = await this.getCurrentBatchId()
    let balanceState = this._initBalanceState(userAddress, tokenAddress, currentBatchId)

    const pendingWithdraws = balanceState.pendingWithdraws

    // Check that the user has balance, and the proper request
    //  The restrictions are stronger than in the smart contract
    assert(!pendingWithdraws.amount.isZero(), "There wasn't any previous pending withdraw")
    assert(!balanceState.balance.isZero(), "There user doesn't have any balance")
    assert(pendingWithdraws.batchId < currentBatchId, 'The withdraw request is not settled yet')

    const amount = BN.min(pendingWithdraws.amount, balanceState.balance)
    pendingWithdraws.amount = ZERO
    balanceState.balance = balanceState.balance.sub(amount)

    log(`[DepositApiMock] Withdraw ${formatAmount(amount)} for token ${tokenAddress}. User ${userAddress}`)
    return { data: undefined, receipt: RECEIPT }
  }

  /********************************    private methods   ********************************/
  private _initBalanceState(userAddress: string, tokenAddress: string, currentBatchId: number): BalanceState {
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
          batchId: currentBatchId,
          amount: ZERO,
        },
        pendingWithdraws: {
          batchId: currentBatchId,
          amount: ZERO,
        },
      }
      userBalanceStates[tokenAddress] = balanceState
    }

    return balanceState
  }

  private _updateDepositsBalance(userAddress: string, tokenAddress: string, currentBatchId: number): void {
    const balanceState = this._balanceStates[userAddress][tokenAddress]
    const pendingDeposits = balanceState.pendingDeposits

    if (
      // There's a pending deposit
      !pendingDeposits.amount.isZero() &&
      // ...and, the deposit is applicable
      pendingDeposits.batchId < currentBatchId
    ) {
      balanceState.balance = balanceState.balance.add(pendingDeposits.amount)
      pendingDeposits.amount = ZERO
    }
  }
}
