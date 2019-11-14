import BN from 'bn.js'

import 'global'

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

  getBalance({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): Promise<BN>
  getPendingDepositAmount({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): Promise<BN>
  getPendingDepositBatchId({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<number>
  getPendingWithdrawAmount({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): Promise<BN>
  getPendingWithdrawBatchId({
    userAddress,
    tokenAddress,
  }: {
    userAddress: string
    tokenAddress: string
  }): Promise<number>

  deposit(
    {
      userAddress,
      tokenAddress,
      amount,
    }: {
      userAddress: string
      tokenAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>>

  requestWithdraw(
    {
      userAddress,
      tokenAddress,
      amount,
    }: {
      userAddress: string
      tokenAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>>

  withdraw(
    {
      userAddress,
      tokenAddress,
    }: {
      userAddress: string
      tokenAddress: string
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<void>>
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
  addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<TxResult<void>>
  placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<TxResult<number>>
  cancelOrder(senderAddress: string, orderId: number, txOptionalParams?: TxOptionalParams): Promise<TxResult<void>>
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
  balanceOf({ tokenAddress, userAddress }: { tokenAddress: string; userAddress: string }): Promise<BN>
  allowance({
    tokenAddress,
    userAddress,
    spenderAddress,
  }: {
    tokenAddress: string
    userAddress: string
    spenderAddress: string
  }): Promise<BN>

  approve(
    {
      senderAddress,
      tokenAddress,
      spenderAddress,
      amount,
    }: {
      senderAddress: string
      tokenAddress: string
      spenderAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>>

  transfer(
    {
      senderAddress,
      tokenAddress,
      toAddress,
      amount,
    }: {
      senderAddress: string
      tokenAddress: string
      toAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>>

  transferFrom(
    {
      senderAddress,
      tokenAddress,
      fromAddress,
      toAddress,
      amount,
    }: {
      senderAddress: string
      tokenAddress: string
      fromAddress: string
      toAddress: string
      amount: BN
    },
    txOptionalParams?: TxOptionalParams,
  ): Promise<TxResult<boolean>>
}
