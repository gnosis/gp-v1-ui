import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { faExchangeAlt, faChartLine, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Widget from 'components/layout/Widget'
import Highlight from 'components/Highlight'
import { tokenListApi } from 'api'
import { getToken } from 'utils'
import { Network, TokenDetails } from 'types'
import OrderRow from './OrderRow'
import { useOrders } from 'hooks/useOrders'

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
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .strategy {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    a,
    button {
      margin-left: 0.5em;
    }
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

const OrdersWidget: React.FC = () => {
  // TODO: only for temporary layout
  const { DAI, USDC, TUSD, PAX } = useMemo(() => {
    const tokens = tokenListApi.getTokens(Network.Mainnet)

    return {
      DAI: getToken('symbol', 'DAI', tokens) as Required<TokenDetails>,
      USDC: getToken('symbol', 'USDC', tokens) as Required<TokenDetails>,
      TUSD: getToken('symbol', 'TUSD', tokens) as Required<TokenDetails>,
      PAX: getToken('symbol', 'PAX', tokens) as Required<TokenDetails>,
    }
  }, [])
  // end temporary layout vars

  const orders = useOrders()
  const noOrders = orders.length === 0

  return (
    <OrdersWrapper>
      <div>
        <h2>Your orders</h2>
        <CreateButtons>
          <Link to="/trade">
            <ButtonWithIcon>
              <FontAwesomeIcon icon={faExchangeAlt} /> Trade
            </ButtonWithIcon>
          </Link>
          <div className="strategy">
            <ButtonWithIcon className="danger">
              <FontAwesomeIcon icon={faChartLine} /> Create new strategy
            </ButtonWithIcon>
            <a href="/">
              <small>Learn more about strategies</small>
            </a>
          </div>
        </CreateButtons>
      </div>
      <OrdersForm>
        <div className="infoContainer">
          <div>
            You have <Highlight>3</Highlight> standing orders
          </div>
          <div className="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <strong> Low balance</strong>
          </div>
        </div>
        <form action="submit">
          <div className="ordersContainer">
            <div className="headerRow">
              <div></div> {/* Empty div on purpose */}
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

            <OrderRow
              id="1"
              sellToken={DAI}
              buyToken={TUSD}
              price="1.05"
              unfilledAmount="1,500"
              availableAmount="1,000"
              overBalance
              expiresOn="In 3 min"
            />
            <OrderRow id="543" sellToken={TUSD} buyToken={USDC} price="1.03" availableAmount="1,000" unlimited />
            <OrderRow
              id="1287"
              sellToken={USDC}
              buyToken={DAI}
              price="1.50"
              unfilledAmount="876.849"
              availableAmount="876.849"
              expiresOn="In 1 days"
              pending
            />
            <OrderRow
              id="1257"
              sellToken={PAX}
              buyToken={DAI}
              price="1.10"
              unfilledAmount="5,876.8429"
              availableAmount="500"
              expiresOn="In 2 days"
            />
          </div>

          <div className="deleteContainer">
            <ButtonWithIcon disabled>
              <FontAwesomeIcon icon={faTrashAlt} /> Delete orders
            </ButtonWithIcon>
            <span>Select first the order(s) you want to delete</span>
          </div>
        </form>
      </OrdersForm>
    </OrdersWrapper>
  )
}

export default OrdersWidget
