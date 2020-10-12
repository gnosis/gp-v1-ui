import { Actions } from 'reducers-actions'
import { DetailedAuctionElement } from 'api/exchange/ExchangeApi'
import { addUnlistedTokensToUserTokenListById } from 'services'
import { isOrderDeleted } from 'utils'

export type ActionTypes = 'OVERWRITE_ORDERS' | 'APPEND_ORDERS' | 'UPDATE_ORDERS' | 'UPDATE_OFFSET'

export interface OrdersState {
  orders: DetailedAuctionElement[]
  offset: number
}

type UpdateOrdersActionType = Actions<ActionTypes, Pick<OrdersState, 'orders'>>
type UpdateOffsetActionType = Actions<ActionTypes, Pick<OrdersState, 'offset'>>
type ReducerActionType = Actions<ActionTypes, OrdersState>

export const overwriteOrders = (orders: DetailedAuctionElement[]): UpdateOrdersActionType => ({
  type: 'OVERWRITE_ORDERS',
  payload: { orders },
})

export const appendOrders = (orders: DetailedAuctionElement[]): UpdateOrdersActionType => ({
  type: 'APPEND_ORDERS',
  payload: { orders },
})

export const updateOrders = (orders: DetailedAuctionElement[]): UpdateOrdersActionType => ({
  type: 'UPDATE_ORDERS',
  payload: { orders },
})

export const updateOffset = (offset: number): UpdateOffsetActionType => ({
  type: 'UPDATE_OFFSET',
  payload: { offset },
})

export const INITIAL_ORDERS_STATE = { orders: [], offset: 0 }

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
        .filter((order) => !isOrderDeleted(order))
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
      const updatedOrders = reversedNewOrders.concat(currentOrders).reduce<DetailedAuctionElement[]>((acc, order) => {
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
      const reversedNewOrders = newOrders.filter((order) => !isOrderDeleted(order)).reverse()

      // existing orders are older, so new orders come first
      const orders = reversedNewOrders.concat(currentOrders)

      return { ...state, orders }
    }
    default:
      return state
  }
}

export async function sideEffect(state: OrdersState, action: ReducerActionType): Promise<void> {
  switch (action.type) {
    case 'OVERWRITE_ORDERS':
    case 'UPDATE_ORDERS':
    case 'APPEND_ORDERS': {
      const newTokenIdsFromOrders = new Set<number>()

      // orders can contain many duplicated tokenIds
      state.orders.forEach(({ sellTokenId, buyTokenId }) => newTokenIdsFromOrders.add(sellTokenId).add(buyTokenId))

      addUnlistedTokensToUserTokenListById(Array.from(newTokenIdsFromOrders))
    }
  }
}
