import React, { useMemo, useCallback, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

// Assets
import { faTrashAlt, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Const and utils
import { isOrderUnlimited } from '@gnosis.pm/dex-js'
import { isOrderActive, isPendingOrderActive } from 'utils'
import { DEFAULT_ORDERS_SORTABLE_TOPIC } from 'const'

// Hooks
import { useOrders } from 'hooks/useOrders'
import useSafeState from 'hooks/useSafeState'
import useDataFilter from 'hooks/useDataFilter'
import useSortByTopic from 'hooks/useSortByTopic'
import { useWalletConnection } from 'hooks/useWalletConnection'

// Api
import { DetailedAuctionElement } from 'api/exchange/ExchangeApi'

// Components
import { ConnectWalletBanner } from 'components/ConnectWalletBanner'
import { CardTable } from 'components/Layout/Card'
import FilterTools from 'components/FilterTools'

// OrderWidget
import { useDeleteOrders } from 'components/OrdersWidget/useDeleteOrders'
import OrderRow from 'components/OrdersWidget/OrderRow'
import { OrdersWrapper, ButtonWithIcon, OrdersForm } from 'components/OrdersWidget/OrdersWidget.styled'

// Types/misc
import { DetailedPendingOrder } from 'hooks/usePendingOrders'
import { TokenDetails } from 'types'

type OrderTabs = 'active' | 'liquidity' | 'closed'

interface ShowOrdersButtonProps {
  type: OrderTabs
  isActive: boolean
  count: number
  onClick: (event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>) => void
}

const ShowOrdersButton: React.FC<ShowOrdersButtonProps> = ({ type, isActive, count, onClick }) => (
  <button type="button" className={isActive ? 'selected' : ''} onClick={onClick}>
    {type} <i>{count}</i>
  </button>
)

type FilteredOrdersStateKeys = OrderTabs
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
    liquidity: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
  }
}

function classifyOrders(
  orders: DetailedAuctionElement[],
  state: FilteredOrdersState,
  ordersType: 'orders' | 'pendingOrders',
): void {
  const now = new Date()
  const isOrderActiveFn = ordersType === 'pendingOrders' ? isPendingOrderActive : isOrderActive

  orders.forEach(order => {
    if (!isOrderActiveFn(order, now)) {
      state.closed[ordersType].push(order)
    } else if (isOrderUnlimited(order.priceDenominator, order.priceNumerator)) {
      state.liquidity[ordersType].push(order)
    } else {
      state.active[ordersType].push(order)
    }
  })
}

function checkTokenAgainstSearch(token: TokenDetails | null, searchText: string): boolean {
  if (!token) return false
  return (
    token?.symbol?.toLowerCase().includes(searchText) ||
    token?.name?.toLowerCase().includes(searchText) ||
    token?.address.toLowerCase().includes(searchText)
  )
}

const filterOrdersFn = (searchTxt: string) => ({ id, buyToken, sellToken }: DetailedAuctionElement): boolean | null => {
  if (searchTxt === '') return null

  return (
    !!id.includes(searchTxt) ||
    checkTokenAgainstSearch(buyToken, searchTxt) ||
    checkTokenAgainstSearch(sellToken, searchTxt)
  )
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
  isWidget?: boolean
}

const OrdersWidget: React.FC<Props> = ({ isWidget = false }) => {
  const { orders: allOrders, pendingOrders: allPendingOrders, forceOrdersRefresh } = useOrders()
  // this page is behind login wall so networkId should always be set
  const { networkId, isConnected } = useWalletConnection()

  // allOrders and markedForDeletion, split by tab
  const [classifiedOrders, setClassifiedOrders] = useSafeState<FilteredOrdersState>(emptyState())
  const [selectedTab, setSelectedTab] = useSafeState<OrderTabs>('active')

  // syntactic sugar
  const { displayedOrders, displayedPendingOrders, markedForDeletion } = useMemo(
    () => ({
      displayedOrders: classifiedOrders[selectedTab].orders,
      displayedPendingOrders: classifiedOrders[selectedTab].pendingOrders,
      markedForDeletion: classifiedOrders[selectedTab].markedForDeletion,
    }),
    [classifiedOrders, selectedTab],
  )

  const setSelectedTabFactory = useCallback(
    (type: OrderTabs): ((event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>) => void) => (
      event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>,
    ): void => {
      // form is being submitted when clicking on tab buttons, thus preventing default
      event.preventDefault()

      setSelectedTab(type)
    },
    [setSelectedTab],
  )

  // Update classifiedOrders state whenever there's a change to allOrders
  // splitting orders into respective tabs
  useEffect(() => {
    const classifiedOrders = emptyState()

    classifyOrders(allOrders, classifiedOrders, 'orders')
    classifyOrders(allPendingOrders, classifiedOrders, 'pendingOrders')

    setClassifiedOrders(curr => {
      // copy markedForDeletion
      Object.keys(classifiedOrders).forEach(
        type => (classifiedOrders[type].markedForDeletion = curr[type].markedForDeletion),
      )
      return classifiedOrders
    })
  }, [allOrders, allPendingOrders, setClassifiedOrders])

  const ordersCount = displayedOrders.length + displayedPendingOrders.length

  const noOrders = allOrders.length === 0

  const overBalanceOrders = useMemo(
    () =>
      new Set<string>(
        displayedOrders.filter(order => order.remainingAmount.gt(order.sellTokenBalance)).map(order => order.id),
      ),
    [displayedOrders],
  )

  // Sort validUntil
  const { sortedData: sortedDisplayedOrders, sortTopic, setSortTopic } = useSortByTopic<
    DetailedAuctionElement,
    TopicNames
  >(displayedOrders, DEFAULT_ORDERS_SORTABLE_TOPIC, compareFnFactory)

  const toggleMarkForDeletionFactory = useCallback(
    (orderId: string, selectedTab: OrderTabs): (() => void) => (): void =>
      setClassifiedOrders(curr => {
        const state = emptyState()

        // copy full state
        Object.keys(curr).forEach(tab => (state[tab] = curr[tab]))

        // copy markedForDeletion set
        const newSet = new Set(curr[selectedTab].markedForDeletion)
        // toggle order
        newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId)
        // store new set
        state[selectedTab].markedForDeletion = newSet

        return state
      }),
    [setClassifiedOrders],
  )

  const toggleSelectAll = useCallback(
    ({ currentTarget: { checked } }: React.SyntheticEvent<HTMLInputElement>) =>
      setClassifiedOrders(curr => {
        const state = emptyState()

        // copy full state
        Object.keys(curr).forEach(tab => (state[tab] = curr[tab]))

        state[selectedTab].markedForDeletion = checked
          ? new Set(classifiedOrders[selectedTab].orders.map(order => order.id))
          : new Set()

        return state
      }),
    [classifiedOrders, selectedTab, setClassifiedOrders],
  )

  const { deleteOrders, deleting } = useDeleteOrders()

  const onSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      const success = await deleteOrders(Array.from(markedForDeletion))

      if (success) {
        unstable_batchedUpdates(() => {
          // reset selections

          setClassifiedOrders(curr => {
            const state = emptyState()

            // copy full state
            Object.keys(curr).forEach(tab => (state[tab] = curr[tab]))

            // remove checked orders
            state[selectedTab].orders = curr[selectedTab].orders.filter(
              order => !curr[selectedTab].markedForDeletion.has(order.id),
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

  const {
    filteredData: filteredAndSortedOrders,
    search,
    handlers: { handleSearch },
  } = useDataFilter({
    data: sortedDisplayedOrders,
    filterFnFactory: filterOrdersFn,
  })

  return (
    <OrdersWrapper>
      {!isConnected ? (
        <ConnectWalletBanner />
      ) : (
        noOrders && (
          <p className="noOrdersInfo">
            It appears you haven&apos;t placed any order yet. <br /> Create one!
          </p>
        )
      )}
      {!noOrders && networkId && (
        <OrdersForm>
          <form action="submit" onSubmit={onSubmit}>
            <FilterTools
              className={isWidget ? 'widgetFilterTools' : ''}
              resultName="orders"
              searchValue={search}
              handleSearch={handleSearch}
              showFilter={!!search}
              dataLength={displayedPendingOrders.length + filteredAndSortedOrders.length}
            >
              {/* implement later when better data concerning order state and can be saved to global state 
              <label className="balances-hideZero">
                <input type="checkbox" checked={hideUntouchedOrders} onChange={handleHideUntouchedOrders} />
                <b>Hide untouched orders</b>
              </label>
              */}
            </FilterTools>
            <div className="infoContainer">
              <div className="countContainer">
                <ShowOrdersButton
                  type="active"
                  isActive={selectedTab === 'active'}
                  count={classifiedOrders.active.orders.length + classifiedOrders.active.pendingOrders.length}
                  onClick={setSelectedTabFactory('active')}
                />
                <ShowOrdersButton
                  type="liquidity"
                  isActive={selectedTab === 'liquidity'}
                  count={classifiedOrders.liquidity.orders.length + classifiedOrders.liquidity.pendingOrders.length}
                  onClick={setSelectedTabFactory('liquidity')}
                />
                <ShowOrdersButton
                  type="closed"
                  isActive={selectedTab === 'closed'}
                  count={classifiedOrders.closed.orders.length + classifiedOrders.closed.pendingOrders.length}
                  onClick={setSelectedTabFactory('closed')}
                />
              </div>
            </div>
            <div className="deleteContainer" data-disabled={markedForDeletion.size === 0 || deleting}>
              <b>↴</b>
              <ButtonWithIcon disabled={markedForDeletion.size === 0 || deleting} type="submit">
                <FontAwesomeIcon icon={faTrashAlt} />{' '}
                {['active', 'liquidity'].includes(selectedTab) ? 'Cancel' : 'Delete'} {markedForDeletion.size} orders
              </ButtonWithIcon>
            </div>
            {ordersCount > 0 ? (
              <div className="ordersContainer">
                <CardTable
                  $columns="3.2rem repeat(2, 1fr) repeat(2, minmax(5.2rem, 0.6fr))"
                  $gap="0 0.6rem"
                  $rowSeparation="0"
                >
                  <thead>
                    <tr>
                      <th className="checked">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={markedForDeletion.size === displayedOrders.length}
                          disabled={deleting}
                        />
                      </th>
                      <th>Limit price</th>
                      <th className="filled">Filled / Total</th>
                      <th
                        className="sortable"
                        onClick={(): void => setSortTopic(prev => ({ ...prev, asc: !prev.asc }))}
                      >
                        Expires <FontAwesomeIcon size="xs" icon={!sortTopic.asc ? faChevronDown : faChevronUp} />
                      </th>
                      <th className="status">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPendingOrders.map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        networkId={networkId}
                        isOverBalance={false}
                        pending
                        disabled={deleting}
                        isPendingOrder
                        transactionHash={order.txHash}
                      />
                    ))}
                    {filteredAndSortedOrders.map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        networkId={networkId}
                        isOverBalance={overBalanceOrders.has(order.id)}
                        isMarkedForDeletion={markedForDeletion.has(order.id)}
                        toggleMarkedForDeletion={toggleMarkForDeletionFactory(order.id, selectedTab)}
                        pending={deleting && markedForDeletion.has(order.id)}
                        disabled={deleting}
                      />
                    ))}
                  </tbody>
                </CardTable>
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
