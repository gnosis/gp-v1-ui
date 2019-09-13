import BN from 'bn.js'

import 'global'

export type Command = () => void
export type Mutation<T> = (original: T) => T

export enum Network {
  Mainnet = 1,
  Rinkeby = 4,
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

export interface TxResult<T> {
  data: T
  receipt: Receipt
}

export interface Receipt {
  transactionHash: string
}

export interface DepositApi {
  getContractAddress(): string
  getBatchTime(): Promise<number>
  getCurrentBatchId(): Promise<number>
  getSecondsRemainingInBatch(): Promise<number>

  getBalance(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositBatchId(userAddress: string, tokenAddress: string): Promise<number>
  getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingWithdrawBatchId(userAddress: string, tokenAddress: string): Promise<number>

  deposit(
    userAddress: string,
    tokenAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>>

  requestWithdraw(
    userAddress: string,
    tokenAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>>

  withdraw(userAddress: string, tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<TxResult<void>>
}

export interface Order {
  buyTokenId: number
  sellTokenId: number
  validFrom: number
  validUntil: number
  isSellOrder: boolean
  priceNumerator: BN
  priceDenominator: BN
  remainingAmount: BN
}

export interface AddOrderParams {
  userAddress: string
  buyTokenId: number
  sellTokenId: number
  isSellOrder: boolean
  validUntil: number
  sellAmount: BN
  buyAmount: BN
}

export interface ExchangeApi extends DepositApi {
  getOrders(userAddress: string): Promise<Order[]>
  getNumTokens(): Promise<number>
  getFeeDenominator(): Promise<number>
  addToken(tokenAddress: string): Promise<void>
  placeOrder(orderParams: AddOrderParams): Promise<number>
  cancelOrder(orderId: number): Promise<void>
  getUserAddress(userId: number): Promise<string> // tokenAddressToIdMap
  getUserId(userAddress: string): Promise<number>
  getCurrentPrice(tokenId: number): Promise<BN>
}

export interface WalletInfo {
  isConnected: boolean
  userAddress?: string
  networkId?: number
}

export interface WalletApi {
  isConnected(): boolean
  connect(): Promise<void>
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
  ): Promise<TxResult<boolean>>

  transfer(
    senderAddress: string,
    tokenAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>>

  transferFrom(
    senderAddress: string,
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>>
}
