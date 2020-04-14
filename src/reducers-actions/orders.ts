import { Actions } from 'reducers-actions'
import { AuctionElement } from 'api/exchange/ExchangeApi'

export type ActionTypes = 'OVERWRITE_ORDERS' | 'APPEND_ORDERS' | 'UPDATE_OFFSET'

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

      // default sorting order is ascending by order id
      // since we are starting from 0, reverse to have the latest on top
      // make a copy first (slice(0)) to avoid mutating current state
      const reversedOrders = orders.slice(0).reverse()

      return { ...state, orders: reversedOrders }
    }
    case 'APPEND_ORDERS': {
      const {
        payload: { orders: newOrders },
      } = action
      const { orders: currentOrders } = state

      // reverse new orders
      const reversedNewOrders = newOrders.slice(0).reverse()

      // existing orders are older, so new orders come first
      const orders = reversedNewOrders.concat(currentOrders)

      return { ...state, orders }
    }
    default:
      return state
  }
}
