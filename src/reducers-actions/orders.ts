import { Actions } from 'reducers-actions'
import { AuctionElement } from 'api/exchange/ExchangeApi'

export const enum ActionTypes {
  OVERWRITE_ORDERS = 'OVERWRITE_ORDERS',
  APPEND_ORDERS = 'APPEND_ORDERS',
  UPDATE_OFFSET = 'UPDATE_OFFSET',
}

export interface OrdersState {
  orders: AuctionElement[]
  offset: number
}

export const overwriteOrders = (payload: Pick<OrdersState, 'orders'>) => ({
  type: ActionTypes.OVERWRITE_ORDERS,
  payload,
})

export const appendOrders = (payload: Pick<OrdersState, 'orders'>) => ({
  type: ActionTypes.APPEND_ORDERS,
  payload,
})

export const updateOffset = (payload: Pick<OrdersState, 'offset'>) => ({
  type: ActionTypes.UPDATE_OFFSET,
  payload,
})

type OrdersActionType = Actions<ActionTypes, OrdersState>

export const INITIAL_ORDERS_STATE = { orders: [], offset: 0 }

export const reducer = (state: OrdersState, action: OrdersActionType): OrdersState => {
  switch (action.type) {
    case ActionTypes.UPDATE_OFFSET:
    case ActionTypes.OVERWRITE_ORDERS: {
      console.log('Type', action.type, 'payload', action.payload)
      return { ...state, ...action.payload }
    }
    case ActionTypes.APPEND_ORDERS: {
      const {
        payload: { orders },
      } = action
      return { ...state, orders: state.orders.concat(orders) }
    }
    default:
      return state
  }
}
