import { PendingTxArray, PendingTxObj } from './PendingApi'
import { GetOrdersParams } from 'api/exchange/ExchangeApi'
import BN from 'bn.js'
import { ONE } from '@gnosis.pm/dex-js'
import { OrderWithTx, OrdersWithTxByUser } from '../../../test/data'

interface ConstructorParams {
  ordersByUser: OrdersWithTxByUser
}

export class PendingApiMock implements PendingApiMock {
  private orders: OrdersWithTxByUser

  constructor(params: ConstructorParams) {
    const { ordersByUser } = params
    this.orders = ordersByUser
  }

  async getOrders({ userAddress }: GetOrdersParams): Promise<PendingTxArray> {
    this._initOrders(userAddress)

    const orders = this.orders[userAddress].map((order, index) => this.orderToAuctionElement(order, index, userAddress))
    return orders
  }

  /********************************    private methods   ********************************/
  private _initOrders(userAddress: string): void {
    const userOrders = this.orders[userAddress]
    if (!userOrders) {
      this.orders[userAddress] = []
    }
  }

  private orderToAuctionElement(order: OrderWithTx, index: number, userAddress: string): PendingTxObj {
    return {
      ...order,
      user: userAddress,
      sellTokenBalance: new BN('1500000000000000000000').add(ONE),
      id: index.toString(),
    }
  }
}
