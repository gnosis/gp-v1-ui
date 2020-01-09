import React, { useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { faExchangeAlt, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useOrders } from 'hooks/useOrders'
import useSafeState from 'hooks/useSafeState'

import { AuctionElement } from 'api/exchange/ExchangeApi'

import { isOrderActive } from 'utils'

import Widget from 'components/Layout/Widget'
import Highlight from 'components/Highlight'
import OrderRow, { OrderRowWrapper } from './OrderRow'
import { useDeleteOrders } from './useDeleteOrders'
import { RESPONSIVE_SIZES } from 'const'

const OrdersWrapper = styled(Widget)`
  > a {
    margin-bottom: -2em;
  }
`

const ButtonWithIcon = styled.button`
  min-width: 10em;

  > svg {
    margin: 0 0.25em;
  }
`

const CreateButtons = styled.div`
  margin-top: 2em;

  // 💙 grid
  display: grid;

  &.withOrders {
    justify-items: start;
    grid-gap: 0.25em 0.75em;
    grid:
      'tradeBtn strategyBtn'
      '.        strategyInfo'
      / 1fr 1fr;

    .tradeBtn {
      justify-self: end;
    }
  }

  &.withoutOrders {
    // adjust grid layout when no orders
    place-items: center;
    grid-row-gap: 1em;
    grid:
      'noOrdersInfo'
      'tradeBtn'
      'strategyBtn'
      'strategyInfo';

    button {
      // make buttons the same width
      width: 15em;
    }
  }

  .noOrdersInfo {
    grid-area: noOrdersInfo;
  }
  .tradeBtn {
    grid-area: tradeBtn;
  }
  .strategyBtn {
    grid-area: strategyBtn;
  }
  .strategyInfo {
    grid-area: strategyInfo;
  }

  button {
    // resetting button margins to help with alignment
    margin: 0;
  }
`

const OrdersForm = styled.div`
  .infoContainer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;

    margin: 1em 0;

    @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
      grid-template-columns: 2fr 1fr;
    }

    .warning {
      justify-self: end;
    }

    .countContainer {
      display: grid;
      grid: 'total active expired';
      align-items: center;
    }

    .total {
      grid-area: total;
    }
    .active {
      grid-area: active;
    }
    .expired {
      grid-area: expired;
    }
  }

  .ordersContainer {
    display: grid;
  }

  .checked {
    // pull checkbox to the left to make divider line be further away
    justify-self: left;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-items: center;
    gap: 0 0.6rem;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    align-items: center;

    .hidden {
      visibility: hidden;
    }

    @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
      display: none;
    }
  }

  .noOrders {
    padding: 3em;

    display: flex;
    justify-content: center;
  }

  .warning {
    color: orange;
  }
`

const OrdersHeader = styled(OrderRowWrapper)`
  background: transparent;
  box-shadow: none;

  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.75em;

  @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
    display: none;
  }

  .title {
    // create a divider line only bellow titled columns
    border-bottom: 0.125rem solid #ededed;
    // push the border all the way to the bottom and extend it
    place-self: stretch;

    // align that text!
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  > * {
    // more space for the divider line
    padding-bottom: 0.5em;
  }
`

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
          {/* <ButtonWithIcon className="danger strategyBtn">
            <FontAwesomeIcon icon={faChartLine} /> Create new strategy
          </ButtonWithIcon>
          <a href="/" className="strategyInfo">
            <small>Learn more about strategies</small>
          </a> */}
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
                {/* GRID HEADER */}
                <OrdersHeader>
                  <div className="checked">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={orders.length === markedForDeletion.size}
                      disabled={deleting}
                    />
                    <span>All</span>
                  </div>
                  <div className="title">Order details</div>
                  <div className="title">Unfilled amount</div>
                  <div className="title">Account balance</div>
                  <div className="title">Expires</div>
                </OrdersHeader>

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
