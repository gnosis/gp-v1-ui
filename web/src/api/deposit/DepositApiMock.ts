/* eslint-disable @typescript-eslint/no-unused-vars */
import BN from 'bn.js'
import assert from 'assert'

import { getEpoch, logDebug } from 'utils'
import { ZERO, BATCH_TIME } from 'const'
import { CONTRACT, RECEIPT, createFlux } from '../../../test/data'

import { Receipt } from 'types'
import { waitAndSendReceipt } from 'utils/mock'
import {
  DepositApi,
  PendingFlux,
  GetBalanceParams,
  GetPendingDepositParams,
  GetPendingWithdrawParams,
  RequestWithdrawParams,
  WithdrawParams,
  DepositParams,
} from './DepositApi'
import { Erc20Api } from 'api/erc20/Erc20Api'

export interface BalanceState {
  balance: BN
  pendingDeposits: PendingFlux
  pendingWithdraws: PendingFlux
}

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

  public getContractAddress(_networkId = 0): string {
    return CONTRACT
  }

  public async getBatchTime(_networkId = 0): Promise<number> {
    return BATCH_TIME
  }

  public async getCurrentBatchId(_networkId = 0): Promise<number> {
    return Math.floor(getEpoch() / BATCH_TIME)
  }

  public async getSecondsRemainingInBatch(_networkId = 0): Promise<number> {
    return BATCH_TIME - (getEpoch() % BATCH_TIME)
  }

  public async getBalance({ userAddress, tokenAddress }: GetBalanceParams): Promise<BN> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return ZERO
    }

    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.balance : ZERO
  }

  public async getPendingDeposit({ userAddress, tokenAddress }: GetPendingDepositParams): Promise<PendingFlux> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return createFlux()
    }
    const balanceState = userBalanceStates[tokenAddress]

    return balanceState ? balanceState.pendingDeposits : createFlux()
  }

  public async getPendingWithdraw({ userAddress, tokenAddress }: GetPendingWithdrawParams): Promise<PendingFlux> {
    const userBalanceStates = this._balanceStates[userAddress]
    if (!userBalanceStates) {
      return createFlux()
    }
    const balanceState = userBalanceStates[tokenAddress]
    return balanceState ? balanceState.pendingWithdraws : createFlux()
  }

  public async deposit({
    userAddress,
    tokenAddress,
    amount,
    networkId,
    txOptionalParams,
  }: DepositParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    // Create the balance state if it's the first deposit
    const currentBatchId = await this.getCurrentBatchId()
    const balanceState = this._initBalanceState({ userAddress, tokenAddress, currentBatchId })

    // Update any unapplied deposit
    this._updateDepositsBalance({ userAddress, tokenAddress, currentBatchId })

    const pendingDeposits = balanceState.pendingDeposits
    pendingDeposits.amount = pendingDeposits.amount.add(amount)
    pendingDeposits.batchId = currentBatchId

    // mock transfer tokens from user's mock `wallet`
    await this._erc20Api.transferFrom({
      userAddress: this.getContractAddress(),
      tokenAddress,
      fromAddress: userAddress,
      toAddress: this.getContractAddress(),
      amount,
      networkId,
    })

    logDebug(`[DepositApiMock] Deposited ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`)
    return RECEIPT
  }

  public async requestWithdraw({
    userAddress,
    tokenAddress,
    amount,
    txOptionalParams,
  }: RequestWithdrawParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    const currentBatchId = await this.getCurrentBatchId()
    const balanceState = this._initBalanceState({ userAddress, tokenAddress, currentBatchId })

    balanceState.pendingWithdraws = {
      amount,
      batchId: currentBatchId,
    }

    logDebug(
      `[DepositApiMock] Requested withdraw of ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`,
    )
    return RECEIPT
  }

  public async withdraw({ userAddress, tokenAddress, networkId, txOptionalParams }: WithdrawParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    const currentBatchId = await this.getCurrentBatchId()
    const balanceState = this._initBalanceState({ userAddress, tokenAddress, currentBatchId })

    const pendingWithdraws = balanceState.pendingWithdraws

    // Check that the user has balance, and the proper request
    //  The restrictions are stronger than in the smart contract
    assert(!pendingWithdraws.amount.isZero(), "There wasn't any previous pending withdraw")
    assert(!balanceState.balance.isZero(), "There user doesn't have any balance")
    assert(pendingWithdraws.batchId < currentBatchId, 'The withdraw request is not settled yet')

    const amount = BN.min(pendingWithdraws.amount, balanceState.balance)
    pendingWithdraws.amount = ZERO
    balanceState.balance = balanceState.balance.sub(amount)

    // mock transfer tokens to user's mock `wallet`
    await this._erc20Api.transfer({
      userAddress: this.getContractAddress(),
      tokenAddress,
      toAddress: userAddress,
      amount,
      networkId,
    })

    logDebug(`[DepositApiMock] Withdraw ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`)
    return RECEIPT
  }

  /********************************    private methods   ********************************/
  private _initBalanceState({
    userAddress,
    tokenAddress,
    currentBatchId,
  }: {
    userAddress: string
    tokenAddress: string
    currentBatchId: number
  }): BalanceState {
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

  private _updateDepositsBalance({
    userAddress,
    tokenAddress,
    currentBatchId,
  }: {
    userAddress: string
    tokenAddress: string
    currentBatchId: number
  }): void {
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
