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
  symbol: string
  decimals: number
  address: string
  addressMainnet?: string
  image?: string
}

export interface TokenBalanceDetails extends TokenDetails {
  exchangeBalance: BN
  depositingBalance: BN
  withdrawingBalance: BN
  walletBalance: BN
  claimable: boolean
  enabled: boolean
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
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt

export interface DepositApi {
  getContractAddress(networkId: number): string | null
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
  ): Promise<Receipt>

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
  ): Promise<Receipt>

  withdraw(
    { userAddress, tokenAddress }: { userAddress: string; tokenAddress: string },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>
}

export interface EpochTokenLocker extends Contract {
  clone(): EpochTokenLocker

  methods: {
    hasCreditedBalance(user: string, token: string, batchId: number | string | BN): TransactionObject<boolean>

    BATCH_TIME(): TransactionObject<string>

    deposit(token: string, amount: number | string | BN): TransactionObject<void>

    requestWithdraw(token: string, amount: number | string | BN): TransactionObject<void>

    withdraw(owner: string, token: string): TransactionObject<void>

    getPendingDepositAmount(user: string, token: string): TransactionObject<string>

    getPendingDepositBatchNumber(user: string, token: string): TransactionObject<string>

    getPendingWithdrawAmount(user: string, token: string): TransactionObject<string>

    getPendingWithdrawBatchNumber(user: string, token: string): TransactionObject<string>

    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
    withdraw(
      {
        userAddress,
        tokenAddress,
      }: {
        userAddress: string
        tokenAddress: string
      },
      txOptionalParams?: TxOptionalParams,
    ): Promise<Receipt>

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

export interface AuctionElement extends Order {
  user: string
  sellTokenBalance: BN
  id: number
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
  getOrders(userAddress: string): Promise<AuctionElement[]>
  getNumTokens(): Promise<number>
  getFeeDenominator(): Promise<number>
  getTokenAddressById(tokenId: number): Promise<string> // tokenAddressToIdMap
  getTokenIdByAddress(tokenAddress: string): Promise<number>
  addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  cancelOrder(
    { senderAddress, orderId }: { senderAddress: string; orderId: number },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>
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
      userAddress,
      tokenAddress,
      spenderAddress,
      amount,
    }: { userAddress: string; tokenAddress: string; spenderAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>

  transfer(
    {
      fromAddress,
      tokenAddress,
      toAddress,
      amount,
    }: { fromAddress: string; tokenAddress: string; toAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>

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

export interface BatchExchange extends Contract {
  clone(): BatchExchange

  methods: EpochTokenLocker['methods'] & {
    getSecondsRemainingInBatch(): TransactionObject<string>

    feeDenominator(): TransactionObject<string>

    getPendingWithdrawAmount(user: string, token: string): TransactionObject<string, [string, string]>

    requestWithdraw(
      token: string,
      amount: number | string | BN,
    ): TransactionObject<void, [string, number | string | BN]>

    getPendingDepositAmount(user: string, token: string): TransactionObject<string, [string, string]>

    deposit(token: string, amount: number | string | BN): TransactionObject<void, [string, number | string | BN]>

    getPendingWithdrawBatchNumber(user: string, token: string): TransactionObject<string, [string, string]>

    TOKEN_ADDITION_FEE_IN_OWL(): TransactionObject<string>

    feeToken(): TransactionObject<string>

    currentPrices(arg0: number | string | BN): TransactionObject<string, [number | string | BN]>

    orders(
      arg0: string,
      arg1: number | string | BN,
    ): TransactionObject<
      {
        buyToken: BN
        sellToken: BN
        validFrom: BN
        validUntil: BN
        isSellOrder: boolean
        priceNumerator: BN
        priceDenominator: BN
        usedAmount: BN
        0: BN
        1: BN
        2: BN
        3: BN
        4: BN
        5: BN
        6: BN
      },
      [string, number | string | BN]
    >

    numTokens(): TransactionObject<string>

    lastCreditBatchId(arg0: string, arg1: string): TransactionObject<string>

    latestSolution(): TransactionObject<{
      batchId: string
      solutionSubmitter: string
      feeReward: string
      objectiveValue: string
      0: string
      1: string
      2: string
      3: string
    }>

    getBalance(user: string, token: string): TransactionObject<string, [string, string]>

    getCurrentBatchId(): TransactionObject<string>

    requestFutureWithdraw(
      token: string,
      amount: number | string | BN,
      batchId: number | string | BN,
    ): TransactionObject<void, [string, number | string | BN, number | string | BN]>

    hasValidWithdrawRequest(user: string, token: string): TransactionObject<boolean, [string, string]>

    MAX_TOKENS(): TransactionObject<string>

    getPendingDepositBatchNumber(user: string, token: string): TransactionObject<string, [string, string]>

    withdraw(user: string, token: string): TransactionObject<void, [string, string]>

    MAX_TOUCHED_ORDERS(): TransactionObject<string>

    addToken(token: string): TransactionObject<void, [string]>

    placeValidFromOrders(
      buyTokens: (number | string | BN)[],
      sellTokens: (number | string | BN)[],
      validFroms: (number | string | BN)[],
      validUntils: (number | string | BN)[],
      buyAmounts: (number | string | BN)[],
      sellAmounts: (number | string | BN)[],
    ): TransactionObject<
      string[],
      [
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
      ]
    >

    placeOrder(
      buyToken: number | string | BN,
      sellToken: number | string | BN,
      validUntil: number | string | BN,
      buyAmount: number | string | BN,
      sellAmount: number | string | BN,
    ): TransactionObject<
      string,
      [number | string | BN, number | string | BN, number | string | BN, number | string | BN, number | string | BN]
    >

    cancelOrder(ids: (number | string | BN)[]): TransactionObject<void, [(number | string | BN)[]]>

    freeStorageOfOrder(ids: (number | string | BN)[]): TransactionObject<void, [(number | string | BN)[]]>

    submitSolution(
      batchIndex: number | string | BN,
      claimedObjectiveValue: number | string | BN,
      owners: string[],
      orderIds: (number | string | BN)[],
      volumes: (number | string | BN)[],
      prices: (number | string | BN)[],
      tokenIdsForPrice: (number | string | BN)[],
    ): TransactionObject<
      string,
      [
        number | string | BN,
        number | string | BN,
        string[],
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
        (number | string | BN)[],
      ]
    >

    tokenAddressToIdMap(addr: string): TransactionObject<string, [string]>

    tokenIdToAddressMap(id: number | string | BN): TransactionObject<string, [number | string | BN]>

    hasToken(addr: string): TransactionObject<boolean, [string]>

    getEncodedAuctionElements(): TransactionObject<string>

    acceptingSolutions(batchIndex: number | string | BN): TransactionObject<boolean, [number | string | BN]>

    getCurrentObjectiveValue(): TransactionObject<string>
  }
}
