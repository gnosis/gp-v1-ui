import React, { useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { faExchangeAlt, faTrashAlt, faExclamationTriangle, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useOrders } from 'hooks/useOrders'
import useSafeState from 'hooks/useSafeState'

import { AuctionElement } from 'api/exchange/ExchangeApi'

import { isOrderActive } from 'utils'

import { CardTable } from 'components/Layout/Card'
import Highlight from 'components/Highlight'
import OrderRow from './OrderRow'

import { useDeleteOrders } from './useDeleteOrders'
import { OrdersWrapper, CreateButtons, ButtonWithIcon, OrdersForm } from './OrdersWidget.styled'

interface ShowOrdersButtonProps {
  type: 'active' | 'expired'
  isActive: boolean
  shownCount: number
  hiddenCount: number
  onClick: () => void
}

const ShowOrdersButton: React.FC<ShowOrdersButtonProps> = ({ type, isActive, shownCount, hiddenCount, onClick }) => {
  const count = isActive ? shownCount : hiddenCount

  return (
    <button className={type} disabled={isActive} onClick={onClick}>
      {!isActive ? <Highlight>{count}</Highlight> : <>{count}</>}
      <> {type}</>
    </button>
  )
}

const OrdersWidget: React.FC = () => {
  const allOrders = useOrders()

  const [orders, setOrders] = useSafeState<AuctionElement[]>(allOrders)

  const [showActive, setShowActive] = useSafeState<boolean>(true)

  const toggleShowActive = useCallback(() => {
    setShowActive(isActive => !isActive)
  }, [setShowActive])

  useEffect(() => {
    const now = new Date()
    const filtered = allOrders.filter(order => showActive === isOrderActive(order, now))
    setOrders(filtered)
  }, [allOrders, setOrders, showActive])

  const shownOrdersCount = orders.length
  const hiddenOrdersCount = allOrders.length - shownOrdersCount

  const noOrders = allOrders.length === 0

  // this page is behind login wall so networkId should always be set
  const { networkId } = useWalletConnection()

  const overBalanceOrders = useMemo(
    () =>
      new Set<string>(orders.filter(order => order.remainingAmount.gt(order.sellTokenBalance)).map(order => order.id)),
    [orders],
  )

  const [markedForDeletion, setMarkedForDeletion] = useSafeState<Set<string>>(new Set())

  const toggleMarkForDeletionFactory = useCallback(
    (orderId: string): (() => void) => (): void =>
      setMarkedForDeletion(curr => {
        const newSet = new Set(curr)
        newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId)
        return newSet
      }),
    [setMarkedForDeletion],
  )

  const toggleSelectAll = useCallback(
    ({ currentTarget: { checked } }: React.SyntheticEvent<HTMLInputElement>) => {
      const newSet: Set<string> = checked ? new Set(orders.map(order => order.id)) : new Set()
      setMarkedForDeletion(newSet)
    },
    [orders, setMarkedForDeletion],
  )

  const { deleteOrders, deleting } = useDeleteOrders()

  const onSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      const success = await deleteOrders(Array.from(markedForDeletion))

      if (success) {
        // reset selections
        setOrders(orders.filter(order => !markedForDeletion.has(order.id)))
        setMarkedForDeletion(new Set<string>())
      }
    },
    [deleteOrders, markedForDeletion, orders, setMarkedForDeletion, setOrders],
  )

  return (
    <OrdersWrapper>
      <div>
        <h2>Your orders</h2>
        <CreateButtons className={noOrders ? 'withoutOrders' : 'withOrders'}>
          {noOrders && (
            <p className="noOrdersInfo">
              It appears you haven&apos;t placed any order yet. <br /> Create one!
            </p>
          )}
          <Link to="/trade" className="tradeBtn">
            <ButtonWithIcon>
              <FontAwesomeIcon icon={faExchangeAlt} /> Trade
            </ButtonWithIcon>
          </Link>
          {/* TODO: enable when the strategy page is implemented */}
          <Link to="/liquidity">
            <ButtonWithIcon className="danger strategyBtn">
              <FontAwesomeIcon icon={faChartLine} /> Create new liquidity
            </ButtonWithIcon>
          </Link>
          {/* TODO: replace href here */}
          <a href="/" className="strategyInfo">
            <small>Learn more about liquidity</small>
          </a>
        </CreateButtons>
      </div>
      {!noOrders && networkId && (
        <OrdersForm>
          <div className="infoContainer">
            <div className="countContainer">
              <div className="total">
                You have <Highlight>{allOrders.length}</Highlight> standing orders:
              </div>
              <ShowOrdersButton
                type="active"
                isActive={showActive}
                shownCount={shownOrdersCount}
                hiddenCount={hiddenOrdersCount}
                onClick={toggleShowActive}
              />
              <ShowOrdersButton
                type="expired"
                isActive={!showActive}
                shownCount={shownOrdersCount}
                hiddenCount={hiddenOrdersCount}
                onClick={toggleShowActive}
              />
            </div>
            {overBalanceOrders.size > 0 && showActive && (
              <div className="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <strong> Low balance</strong>
              </div>
            )}
          </div>
          {shownOrdersCount ? (
            <form action="submit" onSubmit={onSubmit}>
              <div className="ordersContainer">
                <CardTable
                  $columns="minmax(5rem, min-content) minmax(13.625rem, 1fr) repeat(2, minmax(6.2rem, 0.6fr)) minmax(5.5rem, 0.6fr)"
                  $cellSeparation="0.2rem"
                  $rowSeparation="0.6rem"
                >
                  <thead>
                    <tr>
                      <th className="checked">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={orders.length === markedForDeletion.size}
                          disabled={deleting}
                        />
                        <span>All</span>
                      </th>
                      <th>Order details</th>
                      <th>Unfilled amount</th>
                      <th>Account balance</th>
                      <th>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        networkId={networkId}
                        isOverBalance={overBalanceOrders.has(order.id)}
                        isMarkedForDeletion={markedForDeletion.has(order.id)}
                        toggleMarkedForDeletion={toggleMarkForDeletionFactory(order.id)}
                        pending={deleting && markedForDeletion.has(order.id)}
                        disabled={deleting}
                      />
                    ))}
                  </tbody>
                </CardTable>
              </div>

              <div className="deleteContainer">
                <ButtonWithIcon disabled={markedForDeletion.size == 0 || deleting}>
                  <FontAwesomeIcon icon={faTrashAlt} /> {showActive ? 'Cancel' : 'Delete'} orders
                </ButtonWithIcon>
                <span className={markedForDeletion.size == 0 ? '' : 'hidden'}>
                  Select first the order(s) you want to {showActive ? 'cancel' : 'delete'}
                </span>
              </div>
            </form>
          ) : (
            <div className="noOrders">
              <span>You have no {showActive ? 'active' : 'expired'} orders</span>
            </div>
          )}
        </OrdersForm>
      )}
    </OrdersWrapper>
  )
}

export default OrdersWidget
