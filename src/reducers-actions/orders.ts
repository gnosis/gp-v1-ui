import { Actions } from 'reducers-actions'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { ZERO } from '@gnosis.pm/dex-js'

export type ActionTypes = 'OVERWRITE_ORDERS' | 'APPEND_ORDERS' | 'UPDATE_ORDERS' | 'UPDATE_OFFSET'

export interface OrdersState {
  orders: AuctionElement[]
  offset: number
}

type UpdateOrdersActionType = Actions<ActionTypes, Pick<OrdersState, 'orders'>>
type UpdateOffsetActionType = Actions<ActionTypes, Pick<OrdersState, 'offset'>>
type ReducerActionType = Actions<ActionTypes, OrdersState>

export const overwriteOrders = (orders: AuctionElement[]): UpdateOrdersActionType => ({
  type: 'OVERWRITE_ORDERS',
  payload: { orders },
})

export const appendOrders = (orders: AuctionElement[]): UpdateOrdersActionType => ({
  type: 'APPEND_ORDERS',
  payload: { orders },
})

export const updateOrders = (orders: AuctionElement[]): UpdateOrdersActionType => ({
  type: 'UPDATE_ORDERS',
  payload: { orders },
})

export const updateOffset = (offset: number): UpdateOffsetActionType => ({
  type: 'UPDATE_OFFSET',
  payload: { offset },
})

export const INITIAL_ORDERS_STATE = { orders: [], offset: 0 }

/**
 * When orders are `deleted` from the contract, they are still returned, but with all fields set to zero.
 * We will not display such orders.
 *
 * This function checks whether the order has been zeroed out.
 * @param order The order object to check
 */
function isOrderDeleted(order: AuctionElement): boolean {
  return (
    order.buyTokenId === 0 &&
    order.sellTokenId === 0 &&
    order.priceDenominator.eq(ZERO) &&
    order.priceNumerator.eq(ZERO) &&
    order.validFrom === 0 &&
    order.validUntil === 0
  )
}

export const reducer = (state: OrdersState, action: ReducerActionType): OrdersState => {
  switch (action.type) {
    case 'UPDATE_OFFSET':
      return { ...state, ...action.payload }
    case 'OVERWRITE_ORDERS': {
      const {
        payload: { orders },
      } = action

      const reversedOrders = orders
        // remove deleted orders
        .filter(order => !isOrderDeleted(order))
        // default sorting order is ascending by order id
        // since we are starting from 0, reverse to have the latest on top
        .reverse()

      return { ...state, orders: reversedOrders }
    }
    case 'UPDATE_ORDERS': {
      const {
        payload: { orders: newOrders },
      } = action
      const { orders: currentOrders } = state

      // First, newest (by id) on top
      const reversedNewOrders = newOrders.slice(0).reverse()
      // Track seen orders to avoid duplicates
      const processedOrderIds = new Set<string>()

      // First we process reversedNewOrders, then currentOrders.
      // Thanks to processedOrderIds newOrders override currentOrders with same id
      const updatedOrders = reversedNewOrders.concat(currentOrders).reduce<AuctionElement[]>((acc, order) => {
        // already included a potentially updated order
        // or the order was deleted
        if (processedOrderIds.has(order.id)) {
          return acc
        }

        // don't include deleted orders
        if (isOrderDeleted(order)) {
          // but consider them processed
          processedOrderIds.add(order.id)
          return acc
        }

        // this order is either one of the newOrders
        // or one of the currentOrders that wasn't overridden by newOrders
        // and it's not deleted
        acc.push(order)
        processedOrderIds.add(order.id)
        return acc
      }, [])

      return { ...state, orders: updatedOrders }
    }
    case 'APPEND_ORDERS': {
      const {
        payload: { orders: newOrders },
      } = action
      const { orders: currentOrders } = state

      // reverse new orders
      const reversedNewOrders = newOrders.filter(order => !isOrderDeleted(order)).reverse()

      // existing orders are older, so new orders come first
      const orders = reversedNewOrders.concat(currentOrders)

      return { ...state, orders }
    }
    default:
      return state
  }
}
