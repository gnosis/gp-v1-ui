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
    case 'OVERWRITE_ORDERS': {
      return { ...state, ...action.payload }
    }
    case 'APPEND_ORDERS': {
      const {
        payload: { orders },
      } = action
      const { orders: currentOrders } = state
      return { ...state, orders: currentOrders.concat(orders) }
    }
    default:
      return state
  }
}
