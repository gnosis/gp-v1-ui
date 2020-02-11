import { useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

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

export function useOrders2(): Result {
  const { userAddress, networkId, blockNumber } = useWalletConnection()
  const [orders, setOrders] = useSafeState<AuctionElement[]>([])
  console.log('UO::orders', orders)
  //  consider first state to be loading
  const [isLoading, setIsLoading] = useSafeState<boolean>(true)
  console.log('UO::isLoading', isLoading)
  // start fetching from 0
  const [offset, setOffset] = useSafeState<number>(0)
  console.log('UO::offset', offset)

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async (offset: number): Promise<void> => {
      // isLoading is the important one
      // controls ongoing fetching chain
      if (!userAddress || !networkId || !isLoading) return

      // contract call
      console.log('getOrdersPaginated, offste = ', offset)
      try {
        const { orders, nextIndex } = await exchangeApi.getOrdersPaginated({ userAddress, networkId, offset })
        console.log('fetched orders', orders, 'nextIndex', nextIndex)

        // check cancelled bool from parent scope
        if (cancelled) return

        // Apply filters (remove deleted orders)
        const filteredOrders = filterDeletedOrders(orders)

        // ensures we don't have multiple reruns for each update
        // i.e. offset change -> render
        //      isLoading change -> another render
        unstable_batchedUpdates(() => {
          // incremental update: append
          setOrders(oldOrders => oldOrders.concat(filteredOrders))

          if (!nextIndex) {
            // no more orders left
            // done fetching for now
            setIsLoading(false)
          }
          // move offset forward, fetch new batch
          setOffset(offset + orders.length)
        })
      } catch (error) {
        console.log('Failed to fetch orders', error)
        // TODO: inform user
        setIsLoading(false)
      }
    }

    fetchOrders(offset)

    // if offset changed mid-fetch
    // which happens when forceOrdersRefresh si called
    // ignore current fetch results
    return (): void => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, isLoading])

  useEffect(() => {
    // continue loading new orders
    // from current offset
    setIsLoading(true)
    // whenever new block is mined
  }, [blockNumber, setIsLoading])

  // allow to fresh start/refresh on demand
  const forceOrdersRefresh = useCallback((): void => {
    setOffset(0)
    setOrders([])
    setIsLoading(true)
  }, [setIsLoading, setOffset, setOrders])

  useEffect(() => {
    // fresh start/refresh: replace whatever is stored
    forceOrdersRefresh()
    // whenever userAddress or networkId changes
  }, [userAddress, networkId, setIsLoading, setOffset, setOrders, forceOrdersRefresh])

  return { orders, isLoading, forceOrdersRefresh }
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
