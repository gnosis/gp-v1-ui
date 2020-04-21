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

function classifyOrders(
  allOrders: AuctionElement[],
): { activeOrders: { [id: string]: number }; deletedOrdersIds: Set<string> } {
  const activeOrders: { [id: string]: number } = {}
  const deletedOrdersIds = new Set<string>()

  allOrders.forEach((order, index) => {
    if (isOrderDeleted(order)) {
      deletedOrdersIds.add(order.id)
    } else {
      activeOrders[order.id] = index
    }
  })

  return { activeOrders, deletedOrdersIds }
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
        // make a copy first (slice(0)) to avoid mutating current state
        .slice(0)
        // default sorting order is ascending by order id
        // since we are starting from 0, reverse to have the latest on top
        .reverse()
        // remove deleted orders
        .filter(order => !isOrderDeleted(order))

      return { ...state, orders: reversedOrders }
    }
    case 'UPDATE_ORDERS': {
      const {
        payload: { orders: newOrders },
      } = action
      const { orders: currentOrders } = state

      // Classify new orders between existing and deleted,
      // keeping track of the ids and indexes
      const { activeOrders, deletedOrdersIds } = classifyOrders(newOrders)

      // Filter deleted orders and update existing orders
      const filteredAndUpdatedOrders = currentOrders.reduce((acc: AuctionElement[], order) => {
        if (activeOrders[order.id] !== undefined) {
          // It's on activeOrders map? it has been updated.
          // Get the updated from newOrders list by the index in the activeOrders map
          acc.push(newOrders[activeOrders[order.id]])
          // Remove from activeOrders map so we know it's not a new order
          delete activeOrders[order.id]
        } else if (!deletedOrdersIds.has(order.id)) {
          // Not in the deletedOrdersIds set? it has not been modified.
          // Keep the same
          acc.push(order)
        }
        // Else? It has been deleted, do not include it
        return acc
      }, [])

      // Anything left on activeOrders map is a new order
      const reversedNewOrders = Object.values(activeOrders)
        // Use their indexes to fetch from newOrders list
        .map(index => newOrders[index])
        // Reverse the result to have newest on top
        .reverse()

      // Add new orders first
      const orders = reversedNewOrders.concat(filteredAndUpdatedOrders)

      return { ...state, orders }
    }
    case 'APPEND_ORDERS': {
      const {
        payload: { orders: newOrders },
      } = action
      const { orders: currentOrders } = state

      // reverse new orders
      const reversedNewOrders = newOrders
        .slice(0)
        .reverse()
        .filter(order => !isOrderDeleted(order))

      // existing orders are older, so new orders come first
      const orders = reversedNewOrders.concat(currentOrders)

      return { ...state, orders }
    }
    default:
      return state
  }
}
