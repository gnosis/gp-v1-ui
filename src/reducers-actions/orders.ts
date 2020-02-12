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

type UpdateOrdersActionType = Actions<ActionTypes, Pick<OrdersState, 'orders'>>
type UpdateOffsetActionType = Actions<ActionTypes, Pick<OrdersState, 'offset'>>
type ReducerActionType = Actions<ActionTypes, OrdersState>

export const overwriteOrders = (payload: Pick<OrdersState, 'orders'>): UpdateOrdersActionType => ({
  type: ActionTypes.OVERWRITE_ORDERS,
  payload,
})

export const appendOrders = (payload: Pick<OrdersState, 'orders'>): UpdateOrdersActionType => ({
  type: ActionTypes.APPEND_ORDERS,
  payload,
})

export const updateOffset = (payload: Pick<OrdersState, 'offset'>): UpdateOffsetActionType => ({
  type: ActionTypes.UPDATE_OFFSET,
  payload,
})

export const INITIAL_ORDERS_STATE = { orders: [], offset: 0 }

export const reducer = (state: OrdersState, action: ReducerActionType): OrdersState => {
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
      const { orders: currentOrders } = state
      return { ...state, orders: currentOrders.concat(orders) }
    }
    default:
      return state
  }
}
