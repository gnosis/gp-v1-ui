import BN from 'bn.js'
import { TransactionReceipt } from 'web3-core'
import { PendingFlux } from 'api/deposit/DepositApi'
import { TokenOverride } from './config'
import { TokenDex } from '@gnosis.pm/dex-js'

export type Command = () => void
export type AnyFunction = (...args: unknown[]) => unknown
export type Mutation<T> = (original: T) => T
export type Unpromise<T> = T extends Promise<infer U> ? U : T

export enum Network {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  xDAI = 100,
}

export interface TokenDetails extends TokenDex {
  label: string
  disabled?: boolean
  override?: TokenOverride
}

export interface BalanceDetails {
  exchangeBalance: BN
  pendingDeposit: PendingFlux
  pendingWithdraw: PendingFlux
  walletBalance: BN
  claimable: boolean
  enabled: boolean
  totalExchangeBalance: BN
  immatureClaim?: boolean
}

export type TokenBalanceDetails = TokenDetails & BalanceDetails

export interface WithTxOptionalParams {
  txOptionalParams?: TxOptionalParams
}

export interface TxOptionalParams {
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt
