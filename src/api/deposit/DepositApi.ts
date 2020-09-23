import BN from 'bn.js'
import { assert } from '@gnosis.pm/dex-js'

import { logDebug, toBN } from 'utils'
import { ZERO } from 'const'

import { BatchExchangeContract, batchExchangeAbi } from '@gnosis.pm/dex-js'
import { getAddressForNetwork } from './batchExchangeAddresses'
import { Receipt, TxOptionalParams } from 'types'

import Web3 from 'web3'

interface ReadOnlyParams {
  userAddress: string
  tokenAddress: string
  networkId: number
}

export type GetBalanceParams = ReadOnlyParams
export type GetPendingDepositParams = ReadOnlyParams
export type GetPendingWithdrawParams = ReadOnlyParams

interface WithTxOptionalParams {
  txOptionalParams?: TxOptionalParams
}

export interface DepositParams extends ReadOnlyParams, WithTxOptionalParams {
  amount: BN
}

export type RequestWithdrawParams = DepositParams

export type WithdrawParams = Omit<RequestWithdrawParams, 'amount'>

export interface DepositApi {
  getContractAddress(networkId: number): string | null
  getBatchTime(networkId: number): Promise<number>
  getCurrentBatchId(networkId: number): Promise<number>
  getSecondsRemainingInBatch(networkId: number): Promise<number>

  getBalance(params: GetBalanceParams): Promise<BN>
  getPendingDeposit(params: GetPendingDepositParams): Promise<PendingFlux>
  getPendingWithdraw(params: GetPendingWithdrawParams): Promise<PendingFlux>
  getLastCreditBatchId(params: GetPendingDepositParams): Promise<number>

  deposit(params: DepositParams): Promise<Receipt>
  requestWithdraw(params: RequestWithdrawParams): Promise<Receipt>
  withdraw(params: WithdrawParams): Promise<Receipt>
}

export interface PendingFlux {
  amount: BN
  batchId: number
}

export interface DepositApiDependencies {
  web3: Web3
}

export class DepositApiImpl implements DepositApi {
  protected _contractPrototype: BatchExchangeContract
  protected web3: Web3
  protected static _contractsCache: { [network: number]: BatchExchangeContract } = {}

  public constructor(injectedDependencies: DepositApiDependencies) {
    Object.assign(this, injectedDependencies)

    this._contractPrototype = (new this.web3.eth.Contract(batchExchangeAbi) as unknown) as BatchExchangeContract

    // TODO remove later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).epoch = this._contractPrototype
  }

  public getContractAddress(networkId: number): string | null {
    return getAddressForNetwork(networkId)
  }

  public async getBatchTime(networkId: number): Promise<number> {
    const contract = await this._getContract(networkId)
    const BATCH_TIME = await contract.methods.BATCH_TIME().call()
    return +BATCH_TIME
  }

  public async getCurrentBatchId(networkId: number): Promise<number> {
    const contract = await this._getContract(networkId)
    const batchId = await contract.methods.getCurrentBatchId().call()
    return +batchId
  }

  public async getLastCreditBatchId({
    userAddress,
    tokenAddress,
    networkId,
  }: GetPendingDepositParams): Promise<number> {
    const contract = await this._getContract(networkId)
    const lastCreditBatchId = await contract.methods.lastCreditBatchId(userAddress, tokenAddress).call()
    return +lastCreditBatchId
  }

  public async getSecondsRemainingInBatch(networkId: number): Promise<number> {
    const contract = await this._getContract(networkId)
    const secondsRemainingInBatch = await contract.methods.getSecondsRemainingInBatch().call()
    return +secondsRemainingInBatch
  }

  public async getBalance({ userAddress, tokenAddress, networkId }: GetBalanceParams): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const contract = await this._getContract(networkId)
    const balance = await contract.methods.getBalance(userAddress, tokenAddress).call()

    return toBN(balance)
  }

  public async getPendingDeposit({
    userAddress,
    tokenAddress,
    networkId,
  }: GetPendingDepositParams): Promise<PendingFlux> {
    if (!userAddress || !tokenAddress) return { amount: ZERO, batchId: 0 }

    const contract = await this._getContract(networkId)

    const { 0: amount, 1: batchId } = await contract.methods.getPendingDeposit(userAddress, tokenAddress).call()

    return { amount: toBN(amount), batchId: Number(batchId) }
  }

  public async getPendingWithdraw({
    userAddress,
    tokenAddress,
    networkId,
  }: GetPendingWithdrawParams): Promise<PendingFlux> {
    if (!userAddress || !tokenAddress) return { amount: ZERO, batchId: 0 }

    const contract = await this._getContract(networkId)

    const { 0: amount, 1: batchId } = await contract.methods.getPendingWithdraw(userAddress, tokenAddress).call()

    return { amount: toBN(amount), batchId: Number(batchId) }
  }

  public async deposit({
    userAddress,
    tokenAddress,
    networkId,
    amount,
    txOptionalParams,
  }: DepositParams): Promise<Receipt> {
    const contract = await this._getContract(networkId)
    logDebug('[DepositApi] deposit:', { tokenAddress, amount: amount.toString() })

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods.deposit(tokenAddress, amount.toString()).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[DepositApiImpl] Deposited ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  public async requestWithdraw({
    userAddress,
    tokenAddress,
    networkId,
    amount,
    txOptionalParams,
  }: RequestWithdrawParams): Promise<Receipt> {
    const contract = await this._getContract(networkId)
    logDebug('[DepositApi] requestWithdraw:', { tokenAddress, amount: amount.toString() })

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods.requestWithdraw(tokenAddress, amount.toString()).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(
      `[DepositApiImpl] Requested withdraw of ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`,
    )
    return tx
  }

  public async withdraw({ userAddress, tokenAddress, networkId, txOptionalParams }: WithdrawParams): Promise<Receipt> {
    const contract = await this._getContract(networkId)
    logDebug('[DepositApi] requestWithdraw:', { userAddress, tokenAddress })
    const tx = contract.methods.withdraw(userAddress, tokenAddress).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[DepositApiImpl] Withdraw for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  /********************************    private methods   ********************************/

  protected async _getContract(networkId: number): Promise<BatchExchangeContract> {
    const address = this.getContractAddress(networkId)
    assert(address, `EpochTokenLocker was not deployed to network ${networkId}`)

    let contract: BatchExchangeContract | undefined = DepositApiImpl._contractsCache[networkId]
    if (!contract) {
      contract = this._contractPrototype.clone()
      contract.options.address = address
      DepositApiImpl._contractsCache[networkId] = contract
    }

    return contract
  }
}
