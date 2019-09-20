import BN from 'bn.js'

import 'global'

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
  walletBalance: BN
  enabled: boolean
}

export interface TokenList {
  getTokens: (networkId: number) => TokenDetails[]
}

export interface PendingFlux {
  amount: BN
  stateIndex: number
}

export interface BalanceState {
  balance: BN
  pendingDeposits: PendingFlux
  pendingWithdraws: PendingFlux
}

export interface DepositApi {
  getContractAddress(): string
  getBatchTime(): Promise<number>
  getCurrentBatchNumber(): Promise<number>
  getSecondsRemainingInBatch(): Promise<number>

  getBalance(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingDepositBatchNumber(userAddress: string, tokenAddress: string): Promise<number>
  getPendingWithdrawAmount(userAddress: string, tokenAddress: string): Promise<BN>
  getPendingWithdrawBatchNumber(userAddress: string, tokenAddress: string): Promise<number>

  deposit(userAddress: string, tokenAddress: string, amount: BN): Promise<void>
  requestWithdraw(userAddress: string, tokenAddress: string, amount: BN): Promise<void>
  withdraw(userAddress: string, tokenAddress: string): Promise<void>
}

export interface WalletApi {
  isConnected(): boolean
  connect(): Promise<void>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getBalance(): Promise<BN>
  getNetworkId(): Promise<number>
}

/**
 * Interfaces the access to ERC20 token
 *
 * Only the required methods are implemented.
 * See: https://theethereum.wiki/w/index.php/ERC20_Token_Standard
 */
export interface Erc20Api {
  balanceOf(tokenAddress: string, userAddress: string): Promise<BN>
  approve(tokenAddress: string, userAddress: string, spenderAddress: string, amount: BN): Promise<boolean>
  allowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<BN>
  transfer(tokenAddress: string, fromAddress: string, toAddress: string, amount: BN): Promise<boolean>
}
