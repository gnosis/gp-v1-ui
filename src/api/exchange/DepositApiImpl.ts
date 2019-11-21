import BN from 'bn.js'
import assert from 'assert'

import { log, toBN } from 'utils'
import { ZERO } from 'const'
import { getEpochAddressForNetwork } from './epochList'

import { DepositApi, Receipt, TxOptionalParams, EpochTokenLocker } from 'types'
import EpochTokenLockerAbi from './EpochTokenLockerAbi'
import Web3 from 'web3'
import { getProviderState, Provider, ProviderState } from '@gnosis.pm/dapp-ui'

const getNetworkIdFromWeb3 = (web3: Web3): null | number => {
  if (!web3.currentProvider) return null

  // web3.currentProvider may be our provider wrapped in a Proxy
  // depending on web3 version
  // or internally created provider from url
  const providerState: ProviderState | null = getProviderState((web3.currentProvider as unknown) as Provider | null)

  return providerState && providerState.chainId
}

export class DepositApiImpl implements DepositApi {
  private _ReferenceEpochTokenLocker: EpochTokenLocker
  private _web3: Web3

  private static _address2ContractCache: { [K: string]: EpochTokenLocker } = {}

  public constructor(web3: Web3) {
    this._ReferenceEpochTokenLocker = new web3.eth.Contract(EpochTokenLockerAbi)

    this._web3 = web3

    // TODO remove later
    ;(window as any).epoch = this._ReferenceEpochTokenLocker
  }

  public getContractAddress(networkId: number): string | null {
    return getEpochAddressForNetwork(networkId)
  }

  public async getBatchTime(): Promise<number> {
    const contract = await this._getContract()
    const BATCH_TIME = await contract.methods.BATCH_TIME().call()
    return +BATCH_TIME
  }

  public async getCurrentBatchId(): Promise<number> {
    const contract = await this._getContract()
    const batchId = await contract.methods.getCurrentBatchId().call()
    return +batchId
  }

  public async getSecondsRemainingInBatch(): Promise<number> {
    const contract = await this._getContract()
    const secondsRemainingInBatch = await contract.methods.getSecondsRemainingInBatch().call()
    return +secondsRemainingInBatch
  }

  public async getBalance({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const contract = await this._getContract()
    const balance = await contract.methods.getBalance(userAddress, tokenAddress).call()

    return toBN(balance)
  }

  public async getPendingDepositAmount({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const contract = await this._getContract()
    const depositAmount = await contract.methods.getPendingDepositAmount(userAddress, tokenAddress).call()

    return toBN(depositAmount)
  }

  public async getPendingDepositBatchId({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<number> {
    if (!userAddress || !tokenAddress) return 0

    const contract = await this._getContract()
    const depositBatchId = await contract.methods.getPendingDepositBatchNumber(userAddress, tokenAddress).call()

    return +depositBatchId
  }

  public async getPendingWithdrawAmount({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const contract = await this._getContract()
    const withdrawAmount = await contract.methods.getPendingWithdrawAmount(userAddress, tokenAddress).call()

    return toBN(withdrawAmount)
  }

  public async getPendingWithdrawBatchId({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<number> {
    if (!userAddress || !tokenAddress) return 0

    const contract = await this._getContract()
    const withdrawBatchId = await contract.methods.getPendingWithdrawBatchNumber(userAddress, tokenAddress).call()

    return +withdrawBatchId
  }

  public async deposit(
    { userAddress, tokenAddress, amount }: { userAddress: string; tokenAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.deposit(tokenAddress, amount).send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Deposited ${amount} for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  public async requestWithdraw(
    { userAddress, tokenAddress, amount }: { userAddress: string; tokenAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.requestWithdraw(tokenAddress, amount).send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Requested withdraw of ${amount} for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  public async withdraw(
    { userAddress, tokenAddress }: { userAddress: string; tokenAddress: string },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.withdraw(tokenAddress, userAddress).send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Withdraw for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  /********************************    private methods   ********************************/

  private async _getContract(): Promise<EpochTokenLocker> {
    let networkId = getNetworkIdFromWeb3(this._web3)

    if (networkId === null) {
      networkId = await this._web3.eth.net.getId()
    }

    return this._getContractForNetwork(networkId)
  }

  private _getContractForNetwork(networkId: number): EpochTokenLocker {
    const address = this.getContractAddress(networkId)

    assert(address, `EpochTokenLocker was not deployed to network ${networkId}`)

    return this._getContractAtAddress(address)
  }

  private _getContractAtAddress(address: string): EpochTokenLocker {
    const contract = DepositApiImpl._address2ContractCache[address]

    if (contract) return contract

    const newContract = this._ReferenceEpochTokenLocker.clone()
    newContract.options.address = address

    return (DepositApiImpl._address2ContractCache[address] = newContract)
  }
}
