/* eslint-disable @typescript-eslint/no-unused-vars */
import BN from 'bn.js'

import { DepositApiMock, BalancesByUserAndToken } from './DepositApiMock'
import { ExchangeApi, Order, PlaceOrderParams, Erc20Api } from 'types'
import { BATCH_TIME } from 'const'

export interface OrdersByUser {
  [userAddress: string]: Order[]
}

/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiMock extends DepositApiMock implements ExchangeApi {
  private _registeredTokens: string[]
  private _orders: OrdersByUser

  public constructor(
    balanceStates: BalancesByUserAndToken,
    erc20Api: Erc20Api,
    registeredTokens: string[] = [],
    ordersByUser: OrdersByUser = {},
  ) {
    super(balanceStates, erc20Api)
    this._registeredTokens = registeredTokens
    this._orders = ordersByUser
  }

  public async getBatchTime(): Promise<number> {
    return BATCH_TIME
  }

  public async getOrders(_userAddress: string): Promise<Order[]> {
    this._initOrders(_userAddress)
    throw new Error('Not implemented yet')
  }

  public async getNumTokens(): Promise<number> {
    return this._registeredTokens.length
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async addToken(_tokenAddress: string): Promise<void> {
    throw new Error('Not implemented yet')
  }

  public async placeOrder(_orderParams: PlaceOrderParams): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async cancelOrder(_senderAddress: string, _orderId: number): Promise<void> {
    this._initOrders
    throw new Error('Not implemented yet')
  }

  public async getTokenAddressById(_tokenId: number): Promise<string> {
    throw new Error('Not implemented yet')
  }

  public async getTokenIdByAddress(_tokenAddress: string): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async getCurrentPrice(_tokenId: number): Promise<BN> {
    throw new Error('Not implemented yet')
  }

  /********************************    private methods   ********************************/
  private _initOrders(userAddress: string): void {
    const userOrders = this._orders[userAddress]
    if (!userOrders) {
      this._orders[userAddress] = []
    }
  }
}

export default ExchangeApiMock
