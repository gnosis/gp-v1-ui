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
  exchangeWallet: number
  pendingDeposits: number
  pendingWithdraws: number
  enabled: boolean
}

export interface TokenApi {
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

export interface DepositApi {
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
