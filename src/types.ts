export declare var VERSION: string

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
