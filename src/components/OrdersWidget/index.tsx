import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { faExchangeAlt, faChartLine, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { useOrders } from 'hooks/useOrders'
import { useLowBalance } from './useLowBalance'

import Widget from 'components/layout/Widget'
import Highlight from 'components/Highlight'
import { tokenListApi } from 'api'
import { TokenDetails } from 'types'
import OrderRow from './OrderRow'
import { getToken } from 'utils'
import { DEFAULT_DECIMALS } from 'const'

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
  margin-top: 2em;
  margin-left: 2em;

  .infoContainer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    .warning {
      justify-self: end;
    }
  }

  .ordersContainer {
    // negative left margin to better position "hidden" elements
    margin: 2em 0 2em -3em;

    display: grid;
    // 6 columns:
    // loading indicator | select checkbox | order details | unfilled | available | expires
    grid-template-columns: 3em 4em minmax(20em, 1.5fr) repeat(3, 1fr);
    grid-row-gap: 1em;
    place-items: center;
  }

  .headerRow {
    // make the contents of this div behave as part of the parent
    // grid container
    display: contents;

    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;

    .title {
      // create a divider line only bellow titled columns
      border-bottom: 2px solid #ededed;
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
  }

  .orderRow {
    display: contents;
  }

  .checked {
    // pull checkbox to the left to make divider line be further away
    justify-self: left;
    grid-column-start: 2;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .warning {
    color: orange;
  }
`

const FAKE_TOKEN = {
  symbol: 'UNKNOWN',
  name: 'unknown',
  decimals: DEFAULT_DECIMALS,
  address: '0x...',
}

const OrdersWidget: React.FC = () => {
  const orders = useOrders()
  const noOrders = orders.length === 0

  // TODO: find a way to update list of tokens based on address returned by contract if we don't have it in our list
  const { networkId } = useWalletConnection()
  // this page is behind login wall so networkId should always be set
  // reference for the `variable!` notation https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
  const tokens = tokenListApi.getTokens(networkId!)

  const getTokenById = useCallback(
    (id: number): TokenDetails => {
      const token = getToken('id', id.toString(), tokens)
      // TODO: get address from exchangeApi and add to list of tokens
      // consider fake token like a `loading` token
      return token ? token : { ...FAKE_TOKEN, id }
    },
    [tokens],
  )

  const { isLowBalance, updateLowBalanceFactory } = useLowBalance()

  return (
    <OrdersWrapper>
      <div>
        <h2>Your orders</h2>
        <CreateButtons className={noOrders ? 'withoutOrders' : 'withOrders'}>
          {noOrders && (
            <p className="noOrdersInfo">
              It appears you haven&apos;t place any order yet. <br /> Create one!
            </p>
          )}
          <Link to="/trade" className="tradeBtn">
            <ButtonWithIcon>
              <FontAwesomeIcon icon={faExchangeAlt} /> Trade
            </ButtonWithIcon>
          </Link>
          <ButtonWithIcon className="danger strategyBtn">
            <FontAwesomeIcon icon={faChartLine} /> Create new strategy
          </ButtonWithIcon>
          <a href="/" className="strategyInfo">
            <small>Learn more about strategies</small>
          </a>
        </CreateButtons>
      </div>
      {!noOrders && (
        <OrdersForm>
          <div className="infoContainer">
            <div>
              You have <Highlight>{orders.length}</Highlight> standing orders
            </div>
            {isLowBalance && (
              <div className="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <strong> Low balance</strong>
              </div>
            )}
          </div>
          <form action="submit">
            <div className="ordersContainer">
              <div className="headerRow">
                <div className="checked">
                  <input type="checkbox" />
                </div>
                <div className="title">Order details</div>
                <div className="title">
                  Unfilled <br /> amount
                </div>
                <div className="title">
                  Available <br />
                  amount
                </div>
                <div className="title">Expires</div>
              </div>

              {orders.map(order => (
                <OrderRow
                  key={order.id}
                  sellToken={getTokenById(order.sellTokenId)}
                  buyToken={getTokenById(order.buyTokenId)}
                  order={order}
                  updateLowBalance={updateLowBalanceFactory(order.id)}
                />
              ))}
            </div>

            <div className="deleteContainer">
              <ButtonWithIcon disabled>
                <FontAwesomeIcon icon={faTrashAlt} /> Delete orders
              </ButtonWithIcon>
              <span>Select first the order(s) you want to delete</span>
            </div>
          </form>
        </OrdersForm>
      )}
    </OrdersWrapper>
  )
}

export default OrdersWidget
