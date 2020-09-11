import React, { useMemo, useCallback, useEffect, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

// Assets
import { faTrashAlt, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Const and utils
import { isOrderActive, isPendingOrderActive, isTradeSettled, isTradeReverted } from 'utils'
import { DEFAULT_ORDERS_SORTABLE_TOPIC } from 'const'
import { filterTradesFn, filterOrdersFn } from 'utils/filter'

// Hooks
import { useOrders } from 'hooks/useOrders'
import { useTrades } from 'hooks/useTrades'
import useSafeState from 'hooks/useSafeState'
import useDataFilter from 'hooks/useDataFilter'
import useSortByTopic from 'hooks/useSortByTopic'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { useTabs, Tabs, TabData } from 'hooks/useTabs'

// Api
import { DetailedAuctionElement, DetailedPendingOrder, Trade } from 'api/exchange/ExchangeApi'

// Components
import { ConnectWalletBanner } from 'components/ConnectWalletBanner'
import { CardTable, CardWidgetWrapper } from 'components/layout/SwapLayout/Card'
import { InnerTradesWidget } from 'components/TradesWidget'
import FilterTools from 'components/FilterTools'

// OrderWidget
import { useDeleteOrders } from 'components/OrdersWidget/useDeleteOrders'
import OrderRow from 'components/OrdersWidget/OrderRow'
import { OrdersWrapper, ButtonWithIcon, OrdersForm } from 'components/OrdersWidget/OrdersWidget.styled'

type OrderTabs = 'active' | 'closed' | 'trades'
type FilteredOrdersStateKeys = Exclude<OrderTabs, 'trades'>
type FilteredOrdersState = {
  [key in FilteredOrdersStateKeys]: {
    orders: DetailedAuctionElement[]
    pendingOrders: DetailedPendingOrder[]
    markedForDeletion: Set<string>
  }
}

type TopicNames = 'validUntil'

function emptyState(): FilteredOrdersState {
  return {
    active: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
    closed: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
  }
}

function classifyOrders(
  orders: DetailedAuctionElement[],
  state: FilteredOrdersState,
  ordersType: 'orders' | 'pendingOrders',
): void {
  const now = new Date()
  const isOrderActiveFn = ordersType === 'pendingOrders' ? isPendingOrderActive : isOrderActive

  orders.forEach((order) => {
    if (!isOrderActiveFn(order, now)) {
      state.closed[ordersType].push(order)
    } else {
      state.active[ordersType].push(order)
    }
  })
}

const compareFnFactory = (topic: TopicNames, asc: boolean) => (
  lhs: DetailedAuctionElement,
  rhs: DetailedAuctionElement,
): number => {
  if (asc) {
    return lhs[topic] - rhs[topic]
  } else {
    return rhs[topic] - lhs[topic]
  }
}

interface Props {
  displayOnly?: 'liquidity' | 'regular'
}

function filterOrdersByDisplayType(
  orders: DetailedAuctionElement[],
  displayOnly?: 'liquidity' | 'regular',
): DetailedAuctionElement[] {
  return !displayOnly
    ? orders
    : orders.filter(
        (order) =>
          (displayOnly === 'liquidity' && order.isUnlimited) || (displayOnly === 'regular' && !order.isUnlimited),
      )
}

// inputFOcus on filter timeout
let inputTimeout: NodeJS.Timeout | undefined

const OrdersWidget: React.FC<Props> = ({ displayOnly }) => {
  const { orders: allOrders, pendingOrders: allPendingOrders, forceOrdersRefresh } = useOrders()
  // this page is behind login wall so networkId should always be set
  const { networkId, isConnected } = useWalletConnection()

  // allOrders and markedForDeletion, split by tab
  const [classifiedOrders, setClassifiedOrders] = useSafeState<FilteredOrdersState>(emptyState)

  // Subscribe to trade events
  const allTrades = useTrades()
  // Filter only `ordersType` trades
  const trades = useMemo(
    () =>
      !displayOnly
        ? allTrades
        : allTrades.filter(
            (trade) =>
              (displayOnly === 'liquidity' && trade.type === 'liquidity') ||
              (displayOnly === 'regular' && trade.type != 'liquidity'),
          ),
    [allTrades, displayOnly],
  )

  const tabList = useMemo<TabData<OrderTabs>[]>(
    () => [
      {
        type: 'active',
        count: classifiedOrders.active.orders.length + classifiedOrders.active.pendingOrders.length,
      },
      {
        type: 'trades',
        count: trades.length,
      },
      {
        type: 'closed',
        count: classifiedOrders.closed.orders.length + classifiedOrders.active.pendingOrders.length,
      },
    ],
    [
      classifiedOrders.active.orders.length,
      classifiedOrders.active.pendingOrders.length,
      classifiedOrders.closed.orders.length,
      trades.length,
    ],
  )

  const { selectedTab, tabsProps } = useTabs<OrderTabs>('active', tabList)
  // syntactic sugar
  const { displayedOrders, displayedPendingOrders, markedForDeletion } = useMemo(
    () => ({
      displayedOrders: selectedTab === 'trades' ? [] : classifiedOrders[selectedTab].orders,
      displayedPendingOrders: selectedTab === 'trades' ? [] : classifiedOrders[selectedTab].pendingOrders,
      markedForDeletion: selectedTab === 'trades' ? new Set<string>() : classifiedOrders[selectedTab].markedForDeletion,
    }),
    [classifiedOrders, selectedTab],
  )

  // Update classifiedOrders state whenever there's a change to allOrders
  // splitting orders into respective tabs
  useEffect(() => {
    const classifiedOrders = emptyState()

    classifyOrders(filterOrdersByDisplayType(allOrders, displayOnly), classifiedOrders, 'orders')
    classifyOrders(filterOrdersByDisplayType(allPendingOrders, displayOnly), classifiedOrders, 'pendingOrders')

    setClassifiedOrders((curr) => {
      // copy markedForDeletion
      Object.keys(classifiedOrders).forEach(
        (type) => (classifiedOrders[type].markedForDeletion = curr[type].markedForDeletion),
      )
      return classifiedOrders
    })
  }, [allOrders, allPendingOrders, displayOnly, setClassifiedOrders])

  const ordersCount = displayedOrders.length + displayedPendingOrders.length

  const noOrders = allOrders.length === 0
  const noTrades = trades.length === 0

  const overBalanceOrders = useMemo(
    () =>
      new Set<string>(
        displayedOrders.filter((order) => order.remainingAmount.gt(order.sellTokenBalance)).map((order) => order.id),
      ),
    [displayedOrders],
  )

  // =========================================
  // SORTING + FILTERING
  // =========================================
  const { sortedData: sortedOrders, sortTopic, setSortTopic } = useSortByTopic<DetailedAuctionElement, TopicNames>(
    displayedOrders,
    DEFAULT_ORDERS_SORTABLE_TOPIC,
    compareFnFactory,
    'desc',
  )

  // Why 2 useDataFilter instead of concatenating pending + current?
  // I find the approach of using 2 hooks, 1 for each data set of orders (current, pending)
  // to be clearer than potentially using 1 data set concatenated + split to display
  // FILTER CURRENT ORDERS
  const {
    filteredData: filteredAndSortedOrders,
    search,
    handlers: { handleSearch: handleSearchingOrders, clearFilters: clearOrdersFilters },
  } = useDataFilter({
    data: sortedOrders,
    filterFnFactory: filterOrdersFn,
  })

  // FILTER PENDING ORDERS
  const {
    filteredData: filteredAndSortedPendingOrders,
    handlers: { handleSearch: handleSearchingPendingOrders, clearFilters: clearPendingOrdersFilters },
  } = useDataFilter<DetailedPendingOrder>({
    data: displayedPendingOrders,
    filterFnFactory: filterOrdersFn,
  })

  // =========================================
  // =========================================

  const toggleMarkForDeletionFactory = useCallback(
    (orderId: string, selectedTab: OrderTabs): (() => void) => (): void => {
      if (selectedTab === 'trades') return

      setClassifiedOrders((curr) => {
        // copy full state
        const state = { ...curr }

        // copy markedForDeletion set
        const newSet = new Set(curr[selectedTab].markedForDeletion)
        // toggle order
        newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId)
        // store new set
        state[selectedTab].markedForDeletion = newSet

        return state
      })
    },
    [setClassifiedOrders],
  )

  const toggleSelectAll = useCallback(
    ({ currentTarget: { checked } }: React.SyntheticEvent<HTMLInputElement>) => {
      if (selectedTab === 'trades') return

      setClassifiedOrders((curr) => {
        // copy full state
        const state = { ...curr }

        // filteredOrders are selectedTab specific,
        // so it's ok to use them directly
        // without classifiedOrders[selectedTab]
        state[selectedTab].markedForDeletion = checked
          ? new Set(filteredAndSortedOrders.concat(filteredAndSortedPendingOrders).map((order) => order.id))
          : new Set()
        // on deselect, better deselect all filtered and unfiltered
        // to avoid cancelling not shown orders

        return state
      })
    },
    [filteredAndSortedOrders, filteredAndSortedPendingOrders, selectedTab, setClassifiedOrders],
  )

  const { deleteOrders, deleting } = useDeleteOrders()

  const onSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      if (selectedTab === 'trades') return

      const success = await deleteOrders(Array.from(markedForDeletion))

      if (success) {
        unstable_batchedUpdates(() => {
          // reset selections

          setClassifiedOrders((curr) => {
            // copy full state
            const state = { ...curr }

            // remove checked orders
            state[selectedTab].orders = curr[selectedTab].orders.filter(
              (order) => !curr[selectedTab].markedForDeletion.has(order.id),
            )
            // clear orders to delete
            state[selectedTab].markedForDeletion = new Set<string>()
            return state
          })

          // update the list of orders
          forceOrdersRefresh()
        })
      }
    },
    [deleteOrders, forceOrdersRefresh, markedForDeletion, selectedTab, setClassifiedOrders],
  )

  const settledAndNotRevertedTrades = useMemo(
    () => trades.filter((trade) => trade && isTradeSettled(trade) && !isTradeReverted(trade)),
    [trades],
  )

  const {
    filteredData: filteredTrades,
    handlers: { handleSearch: handleTradesSearch, clearFilters: clearTradesFilters },
  } = useDataFilter<Trade>({
    data: settledAndNotRevertedTrades,
    filterFnFactory: filterTradesFn,
  })

  const handleCompleteFilterClear = useCallback(() => {
    clearTradesFilters()
    clearPendingOrdersFilters()
    clearOrdersFilters()
  }, [clearOrdersFilters, clearPendingOrdersFilters, clearTradesFilters])

  const handleCompleteSearch = useCallback(
    (e): void => {
      handleSearchingOrders(e)
      handleSearchingPendingOrders(e)
      handleTradesSearch(e)
    },
    [handleSearchingOrders, handleSearchingPendingOrders, handleTradesSearch],
  )

  const filterInputRef = useRef<HTMLInputElement>(null)
  const focusFilterInput: () => boolean | undefined = () => filterInputRef?.current?.classList?.toggle('focusAnimation')
  const handleCellClickAndFilterFocus = useCallback(
    (e): void => {
      // prevents multiple timeouts chaining
      inputTimeout && clearTimeout(inputTimeout)
      // Toggle animation class
      focusFilterInput()
      // fill in filter bar with filter text
      handleCompleteSearch(e)
      // wait for animation to finish and toggle off class
      inputTimeout = setTimeout(focusFilterInput, 300)
    },
    [handleCompleteSearch],
  )

  const { tabSpecificResultName, tabSpecificDataLength } = useMemo(
    () => ({
      tabSpecificResultName: selectedTab === 'trades' ? 'trades' : 'orders',
      tabSpecificDataLength:
        selectedTab === 'trades'
          ? filteredTrades.length
          : displayedPendingOrders.length + filteredAndSortedOrders.length,
    }),
    [selectedTab, filteredTrades.length, displayedPendingOrders.length, filteredAndSortedOrders.length],
  )

  const markedForDeletionChecked = !!(
    classifiedOrders[selectedTab]?.orders?.length > 0 && markedForDeletion.size === displayedOrders.length
  )

  return (
    <OrdersWrapper>
      {!isConnected ? (
        <ConnectWalletBanner />
      ) : (
        noOrders &&
        noTrades && (
          <p className="noOrdersInfo">
            It appears you haven&apos;t placed any order yet. <br /> Create one!
          </p>
        )
      )}
      {(!noOrders || !noTrades) && networkId && (
        <OrdersForm>
          <form action="submit" onSubmit={onSubmit}>
            <FilterTools
              customRef={filterInputRef}
              className="widgetFilterTools"
              resultName={tabSpecificResultName}
              searchValue={search}
              handleSearch={handleCompleteSearch}
              clearFilters={handleCompleteFilterClear}
              showFilter={!!search}
              dataLength={tabSpecificDataLength}
            >
              {selectedTab !== 'trades' && (
                <label className="checked">
                  <small>Cancel All Orders:</small>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={markedForDeletionChecked}
                    disabled={deleting}
                  />
                </label>
              )}
            </FilterTools>
            {/* ORDERS TABS: ACTIVE/TRADES/CLOSED */}
            <Tabs<OrderTabs> {...tabsProps} />

            {/* DELETE ORDERS ROW */}
            <div className="deleteContainer" data-disabled={markedForDeletion.size === 0 || deleting}>
              <b>↴</b>
              <ButtonWithIcon disabled={markedForDeletion.size === 0 || deleting} type="submit">
                <FontAwesomeIcon icon={faTrashAlt} />{' '}
                {['active', 'liquidity'].includes(selectedTab) ? 'Cancel' : 'Delete'} {markedForDeletion.size} orders
              </ButtonWithIcon>
            </div>
            {/* FILLS AKA TRADES */}
            {selectedTab === 'trades' ? (
              <div className="ordersContainer">
                <CardWidgetWrapper className="widgetCardWrapper">
                  <InnerTradesWidget isTab trades={filteredTrades} onCellClick={handleCellClickAndFilterFocus} />
                </CardWidgetWrapper>
              </div>
            ) : ordersCount > 0 ? (
              // ACTIVE / LIQUIDITY / CLOSED ORDERS
              <div className="ordersContainer">
                <CardWidgetWrapper className="widgetCardWrapper">
                  <CardTable
                    $columns="3.2rem 5.5rem minmax(8.6rem, 0.3fr) repeat(2,1fr) minmax(5.2rem,0.6fr) minmax(8.6rem, 0.3fr)"
                    $gap="0 0.6rem"
                    $rowSeparation="0"
                  >
                    <thead>
                      <tr>
                        <th className="checked">
                          <input
                            type="checkbox"
                            onChange={toggleSelectAll}
                            checked={markedForDeletionChecked}
                            disabled={deleting}
                          />
                        </th>
                        <th>Order ID</th>
                        <th>Market</th>
                        <th>Limit price</th>
                        <th className="filled">Filled / Total</th>
                        <th
                          className="sortable"
                          onClick={(): void => setSortTopic((prev) => ({ ...prev, asc: !prev.asc }))}
                        >
                          Expires <FontAwesomeIcon size="xs" icon={!sortTopic.asc ? faChevronDown : faChevronUp} />
                        </th>
                        <th className="status">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedPendingOrders.map((order) => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          networkId={networkId}
                          isOverBalance={false}
                          pending
                          disabled={deleting}
                          isPendingOrder
                          transactionHash={order.txHash}
                          onCellClick={handleCellClickAndFilterFocus}
                        />
                      ))}
                      {filteredAndSortedOrders.map((order) => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          networkId={networkId}
                          isOverBalance={overBalanceOrders.has(order.id)}
                          isMarkedForDeletion={markedForDeletion.has(order.id)}
                          toggleMarkedForDeletion={toggleMarkForDeletionFactory(order.id, selectedTab)}
                          pending={deleting && markedForDeletion.has(order.id)}
                          disabled={deleting}
                          onCellClick={handleCellClickAndFilterFocus}
                        />
                      ))}
                    </tbody>
                  </CardTable>
                </CardWidgetWrapper>
              </div>
            ) : (
              <div className="noOrders">
                <span>You have no {selectedTab} orders</span>
              </div>
            )}
          </form>
        </OrdersForm>
      )}
    </OrdersWrapper>
  )
}

export default OrdersWidget
