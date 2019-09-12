import BN from 'bn.js'
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
  buyTokenId: number
  sellTokenId: number
  isSellOrder: boolean
  validUntil: number
  sellAmount: BN
  buyAmount: BN
}

export interface StableCoinConverterApi {
  getOrders(userAddress: string): Promise<Order[]>
  getNumTokens(): Promise<number>
  getFeeDenominator(): Promise<number>
  addToken(tokenAddress: string): Promise<void>
  placeOrder(orderParams: AddOrderParams): Promise<number>
  cancelOrder(orderId: number): Promise<void>
  getUserAddress(userId: number): Promise<string> // tokenAddressToIdMap
  getUserId(userAddress: string): Promise<number>
  getCurrentPrice(tokenId: number): Promise<BN>
}
