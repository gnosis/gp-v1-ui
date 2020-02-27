import { AuctionElement } from 'api/exchange/ExchangeApi'

export interface PendingTxObj extends AuctionElement {
  txHash: string
}

export type PendingTxArray = PendingTxObj[]

interface BaseParams {
  networkId: number
}

export interface GetOrdersParams extends BaseParams {
  userAddress: string
}

export interface PendingApi {
  getOrders(params: GetOrdersParams): Promise<PendingTxArray>
}

export class PendingApiImpl implements PendingApi {
  async getOrders(): Promise<PendingTxArray> {
    return []
  }
}
