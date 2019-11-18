import BN from 'bn.js'

export type Command = () => void
export type Mutation<T> = (original: T) => T

export enum Network {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
}

export interface TokenDetails {
  name?: string
  symbol?: string
  decimals?: number
  address: string
  addressMainnet?: string
  image?: string
}

export interface TokenBalanceDetails extends TokenDetails {
  exchangeBalance: BN
  depositingBalance: BN
  withdrawingBalance: BN
  claimable: boolean
  walletBalance: BN
  enabled: boolean
  highlighted: boolean
  enabling: boolean
  claiming: boolean
}

export interface TokenList {
  getTokens: (networkId: number) => TokenDetails[]
}

export interface PendingFlux {
  amount: BN
  batchId: number
}

export interface BalanceState {
  balance: BN
  pendingDeposits: PendingFlux
  pendingWithdraws: PendingFlux
}

export interface TxOptionalParams {
  onSentTransaction?: (receipt: Receipt) => void
}

export type Receipt = TransactionReceipt

export interface DepositApi {
  getContractAddress(networkId: number): string
  getBatchTime(): Promise<number>
  getCurrentBatchId(): Promise<number>
  getSecondsRemainingInBatch(): Promise<number>

  getBalance(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositBatchId(userAddress: string, tokenAddress: string): Promise<number>
  getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingWithdrawBatchId(userAddress: string, tokenAddress: string): Promise<number>

  deposit(userAddress: string, tokenAddress: string, amount: BN, txOptionalParams?: TxOptionalParams): Promise<Receipt>

  requestWithdraw(
    userAddress: string,
    tokenAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>

  withdraw(userAddress: string, tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
}

export interface EpochTokenLocker extends Contract {
  clone(): EpochTokenLocker

  methods: {
    hasCreditedBalance(user: string, token: string, batchId: number | string | BN): TransactionObject<boolean>

    BATCH_TIME(): TransactionObject<string>

    deposit(token: string, amount: number | string | BN): TransactionObject<void>

    requestWithdraw(token: string, amount: number | string | BN): TransactionObject<void>

    withdraw(token: string, owner: string): TransactionObject<void>

    getPendingDepositAmount(user: string, token: string): TransactionObject<string>

    getPendingDepositBatchNumber(user: string, token: string): TransactionObject<string>

    getPendingWithdrawAmount(user: string, token: string): TransactionObject<string>

    getPendingWithdrawBatchNumber(user: string, token: string): TransactionObject<string>

    getCurrentBatchId(): TransactionObject<string>

    getSecondsRemainingInBatch(): TransactionObject<string>

    getBalance(user: string, token: string): TransactionObject<string>

    hasValidWithdrawRequest(user: string, token: string): TransactionObject<boolean>
  }
}

export interface Order {
  buyTokenId: number
  sellTokenId: number
  validFrom: number
  validUntil: number
  priceNumerator: BN
  priceDenominator: BN
  remainingAmount: BN
}

export interface PlaceOrderParams {
  userAddress: string
  buyTokenId: number
  sellTokenId: number
  validUntil: number
  buyAmount: BN
  sellAmount: BN
}

export interface ExchangeApi extends DepositApi {
  getOrders(userAddress: string): Promise<Order[]>
  getNumTokens(): Promise<number>
  getFeeDenominator(): Promise<number>
  getTokenAddressById(tokenId: number): Promise<string> // tokenAddressToIdMap
  getTokenIdByAddress(tokenAddress: string): Promise<number>
  addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  cancelOrder(senderAddress: string, orderId: number, txOptionalParams?: TxOptionalParams): Promise<Receipt>
}

export interface WalletInfo {
  isConnected: boolean
  userAddress?: string
  networkId?: number
}

export interface WalletApi {
  isConnected(): boolean
  connect(): Promise<boolean>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getBalance(): Promise<BN>
  getNetworkId(): Promise<number>
  addOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void, trigger?: boolean): Command
  removeOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void
}

/**
 * Interfaces the access to ERC20 token
 *
 * Only the required methods are implemented.
 * See: https://theethereum.wiki/w/index.php/ERC20_Token_Standard
 */
export interface Erc20Api {
  balanceOf(tokenAddress: string, userAddress: string): Promise<BN>
  allowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<BN>

  approve(
    senderAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>

  transfer(
    senderAddress: string,
    tokenAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>

  transferFrom(
    senderAddress: string,
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>
}

import { Contract } from 'web3-eth-contract'
import { PromiEvent, TransactionConfig, TransactionReceipt } from 'web3-core'

type CallTxOptions = Pick<TransactionConfig, 'from' | 'gas' | 'gasPrice'>
type SendTxOptions = Pick<TransactionConfig, 'from' | 'gas' | 'gasPrice' | 'value'>
type EstimateGasTxOptions = Pick<TransactionConfig, 'from' | 'gas' | 'value'>

type CallTxCallback = <T>(error: Error | null, result: T) => void
type SendTxCallback = (error: Error | null, transactionHash: string) => void
type EstimateGasTxCallback = (error: Error | null, gasAmount: number) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TransactionObject<T, U extends any[] = []> {
  arguments: U

  call(callback: CallTxCallback): Promise<T>
  call(tx?: CallTxOptions, callback?: CallTxCallback): Promise<T>

  send(callback: SendTxCallback): PromiEvent<TransactionReceipt>
  send(tx?: SendTxOptions, callback?: SendTxCallback): PromiEvent<TransactionReceipt>

  estimateGas(callback: EstimateGasTxCallback): Promise<number>
  estimateGas(tx?: EstimateGasTxOptions, callback?: EstimateGasTxCallback): Promise<number>

  encodeABI(): string
}

export interface ERC20 extends Contract {
  clone(): ERC20

  methods: {
    totalSupply(): TransactionObject<string>
    decimals(): TransactionObject<string>
    symbol(): TransactionObject<string>
    name(): TransactionObject<string>

    balanceOf(owner: string): TransactionObject<string, [string]>

    allowance(owner: string, spender: string): TransactionObject<string, [string, string]>

    approve(spender: string, value: number | string | BN): TransactionObject<boolean, [string, string | number | BN]>

    transfer(to: string, value: number | string | BN): TransactionObject<boolean, [string, string | number | BN]>

    transferFrom(
      from: string,
      to: string,
      value: number | string | BN,
    ): TransactionObject<boolean, [string, string, string | number | BN]>
  }
}
