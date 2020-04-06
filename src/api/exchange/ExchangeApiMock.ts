import BN from 'bn.js'

import assert from 'assert'

import { DepositApiMock, BalancesByUserAndToken } from '../deposit/DepositApiMock'
import { Receipt } from 'types'
import { FEE_DENOMINATOR, ONE, DEFAULT_ORDERS_PAGE_SIZE } from 'const'
import { waitAndSendReceipt } from 'utils/mock'
import { RECEIPT } from '../../../test/data'
import {
  ExchangeApi,
  AuctionElement,
  PlaceOrderParams,
  Order,
  CancelOrdersParams,
  AddTokenParams,
  GetOrdersParams,
  GetTokenAddressByIdParams,
  GetTokenIdByAddressParams,
  PlaceValidFromOrdersParams,
  GetOrdersPaginatedParams,
  GetOrdersPaginatedResult,
  HasTokenParams,
} from './ExchangeApi'
import { Erc20Api } from 'api/erc20/Erc20Api'
import { wait } from 'utils'

export interface OrdersByUser {
  [userAddress: string]: Order[]
}

interface ConstructorParams {
  erc20Api: Erc20Api
  balanceStates?: BalancesByUserAndToken
  registeredTokens?: string[]
  ordersByUser?: OrdersByUser
  maxTokens?: number
}

/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiMock extends DepositApiMock implements ExchangeApi {
  private registeredTokens: string[]
  private tokenAddressToId: { [address in string]: number } // reverse mapping of registeredTokens for faster access
  private maxTokens: number
  private orders: OrdersByUser

  public constructor(params: ConstructorParams) {
    const { erc20Api, balanceStates = {}, registeredTokens = [], ordersByUser = {}, maxTokens = 10000 } = params

    super(balanceStates, erc20Api)

    this.registeredTokens = registeredTokens
    this.tokenAddressToId = registeredTokens.reduce((obj, address, index) => {
      obj[address] = index
      return obj
    }, {})
    this.maxTokens = maxTokens
    this.orders = ordersByUser
  }

  public async getOrders({ userAddress }: GetOrdersParams): Promise<AuctionElement[]> {
    this._initOrders(userAddress)
    return this.orders[userAddress].map((order, index) => this.orderToAuctionElement(order, index, userAddress))
  }

  public async getOrdersPaginated({
    userAddress,
    offset,
    pageSize = DEFAULT_ORDERS_PAGE_SIZE,
  }: GetOrdersPaginatedParams): Promise<GetOrdersPaginatedResult> {
    this._initOrders(userAddress)

    await wait(5000)

    const nextIndex = offset + pageSize

    const orders = this.orders[userAddress]
      .slice(offset, nextIndex)
      .map((order, index) => this.orderToAuctionElement(order, index + offset, userAddress))

    if (!this.orders[userAddress][nextIndex]) {
      return { orders }
    } else {
      return { orders, nextIndex }
    }
  }

  public async getNumTokens(): Promise<number> {
    return this.registeredTokens.length
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(): Promise<number> {
    return FEE_DENOMINATOR
  }

  public async getTokenAddressById({ tokenId }: GetTokenAddressByIdParams): Promise<string> {
    assert(typeof this.registeredTokens[tokenId] === 'string', 'Must have ID to get Address')
    return this.registeredTokens[tokenId]
  }

  public async getTokenIdByAddress({ tokenAddress }: GetTokenIdByAddressParams): Promise<number> {
    assert(typeof this.tokenAddressToId[tokenAddress] === 'number', 'Must have Address to get ID')
    return this.tokenAddressToId[tokenAddress]
  }

  public async hasToken({ tokenAddress }: HasTokenParams): Promise<boolean> {
    return !!this.tokenAddressToId[tokenAddress]
  }

  public async addToken({ tokenAddress, txOptionalParams }: AddTokenParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    assert(typeof this.tokenAddressToId[tokenAddress] !== 'number', 'Token already registered')
    assert(this.registeredTokens.length < this.maxTokens, 'Max tokens reached')
    this.registeredTokens.push(tokenAddress)
    this.tokenAddressToId[tokenAddress] = this.registeredTokens.length - 1

    return RECEIPT
  }

  public async placeOrder(params: PlaceOrderParams): Promise<Receipt> {
    const { buyTokenId, sellTokenId, validUntil, txOptionalParams } = params
    await waitAndSendReceipt({ txOptionalParams })

    this._initOrders(params.userAddress)

    this.orders[params.userAddress].push({
      buyTokenId,
      sellTokenId,
      validFrom: await this.getCurrentBatchId(),
      validUntil,
      priceNumerator: params.buyAmount,
      priceDenominator: params.sellAmount,
      remainingAmount: params.sellAmount,
    })

    return RECEIPT
  }

  public async placeValidFromOrders({
    userAddress,
    buyTokens,
    sellTokens,
    validFroms,
    validUntils,
    buyAmounts,
    sellAmounts,
    txOptionalParams,
  }: PlaceValidFromOrdersParams): Promise<Receipt> {
    const length = buyTokens.length
    assert(
      [sellTokens, validFroms, validUntils, buyAmounts, sellAmounts].every(el => el.length === length),
      'Parameters length do not match',
    )
    assert(length > 0, 'At least one order required')

    await waitAndSendReceipt({ txOptionalParams })

    this._initOrders(userAddress)

    for (let i = 0; i < length; i++) {
      this.orders[userAddress].push({
        buyTokenId: buyTokens[i],
        sellTokenId: sellTokens[i],
        validFrom: validFroms[i],
        validUntil: validUntils[i],
        priceNumerator: buyAmounts[i],
        priceDenominator: sellAmounts[i],
        remainingAmount: sellAmounts[i],
      })
    }

    return RECEIPT
  }

  public async cancelOrders({ userAddress, orderIds, txOptionalParams }: CancelOrdersParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    this._initOrders(userAddress)
    const batchId = await this.getCurrentBatchId()

    orderIds.forEach(orderId => {
      if (this.orders[userAddress][orderId]) {
        this.orders[userAddress][orderId].validUntil = batchId - 1
      }
    })

    return RECEIPT
  }

  /********************************    private methods   ********************************/
  private _initOrders(userAddress: string): void {
    const userOrders = this.orders[userAddress]
    if (!userOrders) {
      this.orders[userAddress] = []
    }
  }

  private orderToAuctionElement(order: Order, index: number, userAddress: string): AuctionElement {
    return {
      ...order,
      user: userAddress,
      sellTokenBalance: new BN('1500000000000000000000').add(ONE),
      id: index.toString(),
    }
  }
}

export default ExchangeApiMock
