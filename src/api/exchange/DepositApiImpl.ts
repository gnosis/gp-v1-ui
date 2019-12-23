import BN from 'bn.js'
import { AbiItem } from 'web3-utils'
import { log, assert, toBN } from 'utils'
import { ZERO } from 'const'

import { BatchExchangeContract } from '@gnosis.pm/dex-js'
import { getAddressForNetwork } from './batchExchangeAddresses'
import { DepositApi, Receipt, TxOptionalParams } from 'types'

import Web3 from 'web3'
import { getProviderState, Provider, ProviderState } from '@gnosis.pm/dapp-ui'

// TODO: Very likely, this ABI makes webpack build heavier. Review how to instruct to discard info
//  https://github.com/gnosis/dex-react/issues/97
import { abi as batchExchangeAbi } from '@gnosis.pm/dex-contracts/build/contracts/BatchExchange.json'

const getNetworkIdFromWeb3 = (web3: Web3): null | number => {
  if (!web3.currentProvider) return null

  // web3.currentProvider may be our provider wrapped in a Proxy
  // depending on web3 version
  // or internally created provider from url
  const providerState: ProviderState | null = getProviderState((web3.currentProvider as unknown) as Provider | null)

  return providerState && providerState.chainId
}

export class DepositApiImpl implements DepositApi {
  protected _contractPrototype: BatchExchangeContract
  protected _web3: Web3
  protected static _contractsCache: { [K: string]: BatchExchangeContract } = {}

  public constructor(web3: Web3) {
    this._contractPrototype = new web3.eth.Contract(batchExchangeAbi as AbiItem[]) as BatchExchangeContract
    this._web3 = web3

    // TODO remove later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).epoch = this._contractPrototype
  }

  public getContractAddress(networkId: number): string | null {
    return getAddressForNetwork(networkId)
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
    // TODO: Update APIs to the new get balances changes
    // https://github.com/gnosis/dex-react/issues/332
    const { 0: depositAmount } = await contract.methods.getPendingDeposit(userAddress, tokenAddress).call()

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
    // TODO: Update APIs to the new get balances changes
    // https://github.com/gnosis/dex-react/issues/332
    const { 1: depositBatchId } = await contract.methods.getPendingDeposit(userAddress, tokenAddress).call()

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
    // TODO: Update APIs to the new get balances changes
    // https://github.com/gnosis/dex-react/issues/332
    const { 0: withdrawAmount } = await contract.methods.getPendingWithdraw(userAddress, tokenAddress).call()

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
    // TODO: Update APIs to the new get balances changes
    // https://github.com/gnosis/dex-react/issues/332
    const { 1: withdrawBatchId } = await contract.methods.getPendingWithdraw(userAddress, tokenAddress).call()

    return +withdrawBatchId
  }

  public async deposit(
    { userAddress, tokenAddress, amount }: { userAddress: string; tokenAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods.deposit(tokenAddress, amount.toString()).send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Deposited ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  public async requestWithdraw(
    { userAddress, tokenAddress, amount }: { userAddress: string; tokenAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods.requestWithdraw(tokenAddress, amount.toString()).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Requested withdraw of ${amount.toString()} for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  public async withdraw(
    { userAddress, tokenAddress }: { userAddress: string; tokenAddress: string },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.withdraw(userAddress, tokenAddress).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[DepositApiImpl] Withdraw for token ${tokenAddress}. User ${userAddress}`)
    return tx
  }

  /********************************    private methods   ********************************/

  protected async _getNetworkId(): Promise<number> {
    const networkId = getNetworkIdFromWeb3(this._web3)

    return networkId === null ? this._web3.eth.net.getId() : networkId
  }

  protected async _getContract(): Promise<BatchExchangeContract> {
    const networkId = await this._getNetworkId()

    return this._getContractForNetwork(networkId)
  }

  protected _getContractForNetwork(networkId: number): BatchExchangeContract {
    const address = this.getContractAddress(networkId)

    assert(address, `EpochTokenLocker was not deployed to network ${networkId}`)

    // as string as assert is not detected by TS
    return this._getContractAtAddress(address)
  }

  protected _getContractAtAddress(address: string): BatchExchangeContract {
    const contract = DepositApiImpl._contractsCache[address]

    if (contract) return contract

    const newContract = this._contractPrototype.clone()
    newContract.options.address = address

    return (DepositApiImpl._contractsCache[address] = newContract)
  }
}
