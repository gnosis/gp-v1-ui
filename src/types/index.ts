import BN from 'bn.js'
import { TransactionReceipt } from 'web3-core'
import { PendingFlux } from 'api/deposit/DepositApi'

export type Command = () => void
export type Mutation<T> = (original: T) => T
export type Unpromise<T> = T extends Promise<infer U> ? U : T

export enum Network {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
}

export interface MinimalTokenDetails {
  address: string
  symbol?: string
  name?: string
  decimals: number
}

export interface TokenDetails extends MinimalTokenDetails {
  id: number
  addressMainnet?: string
  image?: string
}

export interface TokenBalanceDetails extends TokenDetails {
  exchangeBalance: BN
  pendingDeposit: PendingFlux
  pendingWithdraw: PendingFlux
  walletBalance: BN
  claimable: boolean
  enabled: boolean
  totalExchangeBalance: BN
}

export interface TxOptionalParams {
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt
