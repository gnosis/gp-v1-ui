import { useEffect, useCallback } from 'react'

import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { exchangeApi } from 'api'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import { ZERO } from 'const'

interface Result {
  orders: AuctionElement[]
  forceOrdersRefresh: () => void
  isLoading: boolean
}

/**
 * Filter out deleted orders.
 *
 * When orders are `deleted` from the contract, they are still returned, but with all fields set to zero.
 * We will not display such orders.
 *
 * @param orders all orders returned by the contract
 */
function filterDeletedOrders(orders: AuctionElement[]): AuctionElement[] {
  return orders.filter(
    order =>
      !(
        order.buyTokenId === 0 &&
        order.sellTokenId === 0 &&
        order.priceDenominator.eq(ZERO) &&
        order.priceNumerator.eq(ZERO) &&
        order.validFrom === 0 &&
        order.validUntil === 0
      ),
  )
}

interface OrdersState {
  [networkAndAddress: string]: AuctionElement[]
}

function buildKey(networkId: number, userAddress: string): string {
  return `${networkId}${userAddress}`
}

function updateOrdersState(
  networkId: number,
  userAddress: string,
  state: OrdersState,
  orders: AuctionElement[],
  isAppend: boolean,
): OrdersState {
  const key = buildKey(networkId, userAddress)

  let _orders: AuctionElement[]
  if (isAppend) {
    _orders = (state[key] || []).concat(orders)
  } else {
    _orders = orders
  }

  return { ...state, [key]: _orders }
}

function areThereOrders(networkId: number | undefined, userAddress: string | undefined, state: OrdersState): boolean {
  if (networkId === undefined || userAddress === undefined) {
    return false
  }

  const key = buildKey(networkId, userAddress)

  return state[key]?.length > 0
}

export function useOrders(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [ordersState, setOrdersState] = useSafeState<OrdersState>({})
  const [offset, setOffset] = useSafeState<number | undefined>(0)
  const [isLoading, setIsLoading] = useSafeState<boolean>(false)

  // Tracking last seen values to decide whether to update
  const [lastBlockNumber, setLastBlockNumber] = useSafeState<number | undefined>(undefined)
  const [lastNetworkId, setLastNetworkId] = useSafeState<number | undefined>(undefined)
  const [lastUserAddress, setLastUserAddress] = useSafeState<string | undefined>(undefined)

  const _fetchOrders = useCallback(
    async (
      userAddress: string | undefined,
      networkId: number | undefined,
      offset: number | undefined,
      areThereOrders?: boolean,
    ): Promise<void> => {
      if (userAddress === undefined || networkId === undefined || offset === undefined) {
        return
      }

      await exchangeApi.getOrdersPaginated({ userAddress, networkId, offset }).then(({ orders, nextIndex }) => {
        if (orders.length > 0) {
          // Apply filters (remove deleted orders)
          const filteredOrders = filterDeletedOrders(orders)

          // Store new orders, if any
          if (offset === 0) {
            // fresh start/refresh: replace whatever is stored
            setOrdersState(curr => updateOrdersState(networkId, userAddress, curr, filteredOrders, false))
          } else if (filteredOrders.length > 0) {
            // incremental update: append
            setOrdersState(curr => updateOrdersState(networkId, userAddress, curr, filteredOrders, true))
          }
        } else if (offset === 0 && areThereOrders) {
          // There were orders. We fetched again from the beginning, and now there are none (in the first page). Set to []
          // Example: switching network or address.
          setOrdersState(curr => updateOrdersState(networkId, userAddress, curr, [], false))
        }

        // `nextIndex` can be `undefined`, which means there are no more pages
        if (nextIndex) {
          // There are more, keep going
          _fetchOrders(userAddress, networkId, nextIndex)
        } else {
          // We are done, remember where we stopped for next time
          setOffset(offset + orders.length)
        }
      })
    },
    [],
  )

  const fetchOrdersAndHandleErrors = useCallback(
    async (
      userAddress: string | undefined,
      networkId: number | undefined,
      offset: number | undefined,
      areThereOrders?: boolean,
    ): Promise<void> => {
      setIsLoading(true)
      try {
        await _fetchOrders(userAddress, networkId, offset, areThereOrders)
      } catch (e) {
        console.log('Failed to fetch orders', e)
        // TODO: inform user
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    setLastBlockNumber(blockNumber)
  }, [blockNumber, setLastBlockNumber])

  useEffect(() => {
    setLastNetworkId(networkId)
  }, [networkId, setLastNetworkId])

  useEffect(() => {
    setLastUserAddress(userAddress)
  }, [userAddress, setLastUserAddress])

  useEffect(() => {
    // whenever there's a state change (new block, network /address change)

    if (!isLoading && networkId && userAddress) {
      // should try to update orders
      if (networkId !== lastNetworkId || userAddress !== lastUserAddress) {
        // networkId or userAddress changed, start from 0
        fetchOrdersAndHandleErrors(userAddress, networkId, 0, areThereOrders(networkId, userAddress, ordersState))
      } else if (blockNumber !== lastBlockNumber) {
        // block changed, start from where we last checked
        fetchOrdersAndHandleErrors(userAddress, networkId, offset)
      }
    }
  }, [
    blockNumber,
    lastBlockNumber,
    networkId,
    lastNetworkId,
    userAddress,
    lastUserAddress,
    ordersState,
    fetchOrdersAndHandleErrors,
    isLoading,
    offset,
  ])

  /**
   * Forces the immediate refresh of orders
   */
  const forceOrdersRefresh = useCallback((): void => {
    fetchOrdersAndHandleErrors(userAddress, networkId, 0, areThereOrders(networkId, userAddress, ordersState))
  }, [fetchOrdersAndHandleErrors, userAddress, networkId, ordersState, areThereOrders])

  return {
    orders: (networkId && userAddress && ordersState[buildKey(networkId, userAddress)]) || [],
    forceOrdersRefresh,
    isLoading,
  }
}
