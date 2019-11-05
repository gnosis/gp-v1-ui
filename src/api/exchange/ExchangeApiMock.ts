/* eslint-disable @typescript-eslint/no-unused-vars */
import BN from 'bn.js'

import { DepositApiMock } from './DepositApiMock'
import { ExchangeApi, Order, PlaceOrderParams } from 'types'

/**
 * Basic implementation of Stable Coin Converter API
 *
 * Trivial JS implementation for testing or development
 */
export class ExchangeApiMock extends DepositApiMock implements ExchangeApi {
  public async getBatchTime(): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async getOrders(userAddress: string): Promise<Order[]> {
    throw new Error('Not implemented yet')
  }

  public async getNumTokens(): Promise<number> {
    throw new Error('Not implemented yet')
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async addToken(tokenAddress: string): Promise<void> {
    throw new Error('Not implemented yet')
  }

  public async placeOrder(_orderParams: PlaceOrderParams): Promise<number> {
    throw new Error('Not implemented yet')
  }

  public async cancelOrder(_senderAddress: string, _orderId: number): Promise<void> {
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
}

export default ExchangeApiMock
