import React, { useMemo, useCallback, useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import { faTrashAlt, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isOrderUnlimited } from '@gnosis.pm/dex-js'

import { useOrders } from 'hooks/useOrders'
import useSafeState from 'hooks/useSafeState'
import { useDeleteOrders } from './useDeleteOrders'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { AuctionElement } from 'api/exchange/ExchangeApi'

import { isOrderActive, isPendingOrderActive } from 'utils'

import { OrdersWrapper, ButtonWithIcon, OrdersWidgetInnerWrapper, OrdersWidgetForm } from './OrdersWidget.styled'
import { ConnectWalletBanner } from 'components/ConnectWalletBanner'
import { OrdersTable } from './OrdersTable'

export type OrderTabs = 'active' | 'liquidity' | 'closed'

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
    orders: AuctionElement[]
    pendingOrders: AuctionElement[]
    markedForDeletion: Set<string>
  }
}

function emptyState(): FilteredOrdersState {
  return {
    active: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
    closed: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
    liquidity: { orders: [], pendingOrders: [], markedForDeletion: new Set() },
  }
}

function classifyOrders(
  orders: AuctionElement[],
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

interface OrdersWidgetProps {
  defaultOrderTab?: OrderTabs
  orderTabsToShow?: OrderTabs[]
  shouldHideOrders?: boolean
  isWidget?: boolean
}

const OrdersWidget: React.FC<OrdersWidgetProps> = ({
  defaultOrderTab = 'active',
  orderTabsToShow = ['active', 'liquidity', 'closed'],
  isWidget,
  shouldHideOrders,
}) => {
  // this page is behind login wall so networkId should always be set
  const { networkId, isConnected } = useWalletConnection()
  const { orders: allOrders, forceOrdersRefresh, pendingOrders: allPendingOrders } = useOrders()

  // Widget vertical expand
  const [hideOrders, setHideOrders] = useSafeState<boolean>(!!shouldHideOrders)

  // allOrders and markedForDeletion, split by tab
  const [filteredOrders, setFilteredOrders] = useSafeState<FilteredOrdersState>(emptyState())
  const [selectedTab, setSelectedTab] = useSafeState<OrderTabs>(defaultOrderTab)

  // syntactic sugar
  const { displayedOrders, displayedPendingOrders, markedForDeletion } = useMemo(
    () => ({
      displayedOrders: filteredOrders[selectedTab].orders,
      displayedPendingOrders: filteredOrders[selectedTab].pendingOrders,
      markedForDeletion: filteredOrders[selectedTab].markedForDeletion,
    }),
    [filteredOrders, selectedTab],
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

  // Update filteredOrders state whenever there's a change to allOrders
  // splitting orders into respective tabs
  useEffect(() => {
    const filteredOrders = emptyState()

    classifyOrders(allOrders, filteredOrders, 'orders')
    classifyOrders(allPendingOrders, filteredOrders, 'pendingOrders')

    setFilteredOrders(curr => {
      // copy markedForDeletion
      Object.keys(filteredOrders).forEach(
        type => (filteredOrders[type].markedForDeletion = curr[type].markedForDeletion),
      )
      return filteredOrders
    })
  }, [allOrders, allPendingOrders, setFilteredOrders])

  const ordersCount = displayedOrders.length + displayedPendingOrders.length
  const noOrders = allOrders.length === 0
  const overBalanceOrders = useMemo(
    () =>
      new Set<string>(
        displayedOrders.filter(order => order.remainingAmount.gt(order.sellTokenBalance)).map(order => order.id),
      ),
    [displayedOrders],
  )

  const toggleMarkForDeletionFactory = useCallback(
    (orderId: string, selectedTab: OrderTabs): (() => void) => (): void =>
      setFilteredOrders(curr => {
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
    [setFilteredOrders],
  )

  const toggleSelectAll = useCallback(
    ({ currentTarget: { checked } }: React.SyntheticEvent<HTMLInputElement>) =>
      setFilteredOrders(curr => {
        const state = emptyState()

        // copy full state
        Object.keys(curr).forEach(tab => (state[tab] = curr[tab]))

        state[selectedTab].markedForDeletion = checked
          ? new Set(filteredOrders[selectedTab].orders.map(order => order.id))
          : new Set()

        return state
      }),
    [filteredOrders, selectedTab, setFilteredOrders],
  )

  const { deleteOrders, deleting } = useDeleteOrders()

  const onSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      const success = await deleteOrders(Array.from(markedForDeletion))

      if (success) {
        batchedUpdates(() => {
          // reset selections

          setFilteredOrders(curr => {
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
    [deleteOrders, forceOrdersRefresh, markedForDeletion, selectedTab, setFilteredOrders],
  )

  return (
    <OrdersWrapper $isWidget={isWidget}>
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
        <OrdersWidgetInnerWrapper>
          <div className="infoContainer">
            <div className="countContainer">
              {orderTabsToShow.map((tabName: OrderTabs) => (
                <ShowOrdersButton
                  key={tabName}
                  type={tabName}
                  isActive={selectedTab === tabName}
                  count={filteredOrders[tabName].orders.length + filteredOrders[tabName].pendingOrders.length}
                  onClick={setSelectedTabFactory(tabName)}
                />
              ))}
            </div>
            {isWidget && (
              <ButtonWithIcon
                onClick={(): void => setHideOrders(hideOrders => !hideOrders)}
                $color="var(--color-background-CTA)"
              >
                <FontAwesomeIcon icon={hideOrders ? faChevronCircleDown : faChevronCircleUp} />
              </ButtonWithIcon>
            )}
          </div>
          {/* Show/Hide Orders table */}
          {!hideOrders && (
            <OrdersWidgetForm action="submit" onSubmit={onSubmit}>
              <div className="deleteContainer" data-disabled={markedForDeletion.size === 0 || deleting}>
                <b>↴</b>
                <ButtonWithIcon disabled={markedForDeletion.size === 0 || deleting} type="submit">
                  <FontAwesomeIcon icon={faTrashAlt} />{' '}
                  {['active', 'liquidity'].includes(selectedTab) ? 'Cancel' : 'Delete'} {markedForDeletion.size} orders
                </ButtonWithIcon>
              </div>
              {ordersCount > 0 ? (
                <OrdersTable
                  displayedPendingOrders={displayedPendingOrders}
                  displayedOrders={displayedOrders}
                  toggleSelectAll={toggleSelectAll}
                  markedForDeletion={markedForDeletion}
                  deleting={deleting}
                  networkId={networkId}
                  selectedTab={selectedTab}
                  overBalanceOrders={overBalanceOrders}
                  toggleMarkForDeletionFactory={toggleMarkForDeletionFactory}
                />
              ) : (
                <div className="noOrders">
                  <span>You have no {selectedTab} orders</span>
                </div>
              )}
            </OrdersWidgetForm>
          )}
        </OrdersWidgetInnerWrapper>
      )}
    </OrdersWrapper>
  )
}

export default OrdersWidget
