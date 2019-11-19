import React, { useMemo } from 'react'
import styled from 'styled-components'
import { faExchangeAlt, faChartLine, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Widget from 'components/layout/Widget'
import Highlight from 'components/Highlight'
import { tokenListApi } from 'api'
import { getToken } from 'utils'
import { Network } from 'types'
import OrderRow from './OrderRow'

const OrdersWrapper = styled(Widget)`
  > a {
    margin-bottom: -2em;
  }

  .header {
    margin-top: 0;

    h2 {
      margin-bottom: 0.25em;
    }
  }
`

const ButtonWithIcon = styled.button`
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

  .ordersContainer {
    display: grid;
    grid-template-columns: auto;
    margin: 2em 0 2em -3em;
  }

  .headerRow {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;

    > div {
      border-bottom: 2px solid #ededed;
      text-align: center;
    }

    & > * {
      padding-bottom: 0.25em;
    }
  }

  .rowContainer {
    display: inherit;
    grid-template-columns: 6% 8% auto 25% 12% 10%;
    align-items: center;
    margin: 0.25em 0;
  }

  .cell {
    text-align: center;
    vertical-align: middle;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

const OrdersWidget: React.FC = () => {
  // TODO: only for temporary layout
  const tokens = useMemo(() => tokenListApi.getTokens(Network.Mainnet), [])

  const DAI = getToken('symbol', 'DAI', tokens)
  const USDC = getToken('symbol', 'USDC', tokens)
  const TUSD = getToken('symbol', 'TUSD', tokens)
  const PAX = getToken('symbol', 'PAX', tokens)
  // end temporary layout vars

  return (
    <OrdersWrapper>
      <div className="header">
        <h2>Your sell orders</h2>
        <span>Standing orders for the connected account</span>
        <CreateButtons>
          <ButtonWithIcon>
            <FontAwesomeIcon icon={faExchangeAlt} /> Create order
          </ButtonWithIcon>
          <div className="strategy">
            <ButtonWithIcon>
              <FontAwesomeIcon icon={faChartLine} /> Create new strategy
            </ButtonWithIcon>
            <a href="/">
              <small>Learn more about strategies</small>
            </a>
          </div>
        </CreateButtons>
      </div>
      <OrdersForm>
        <span>
          You have <Highlight>3</Highlight> standing orders
        </span>
        <form action="submit">
          <div className="ordersContainer">
            <div className="rowContainer headerRow">
              <input type="checkbox" />
              <div className="cell">ID</div>
              <div className="cell">Order details</div>
              <div className="cell">Trade at most</div>
              <div className="cell">Matched</div>
              <div className="cell">Expires</div>
            </div>
            <OrderRow
              id="1"
              sellToken={DAI}
              buyToken={TUSD}
              price="1.05"
              sellTotal="1,500"
              matched="500"
              expiresOn="In 3 min"
            />
            <OrderRow
              id="543"
              sellToken={TUSD}
              buyToken={USDC}
              price="1.03"
              sellTotal={<Highlight>unlimited</Highlight>}
              matched="5,876.8429"
              expiresOn={<Highlight>Never</Highlight>}
            />
            <OrderRow
              id="1257"
              sellToken={PAX}
              buyToken={DAI}
              price="1.10"
              sellTotal="350"
              matched="0"
              expiresOn="In 2 days"
            />
          </div>

          <div className="deleteContainer">
            <ButtonWithIcon disabled>
              <FontAwesomeIcon icon={faTrashAlt} /> Delete orders
            </ButtonWithIcon>
            <span>Select first the orders you want to delete</span>
          </div>
        </form>
      </OrdersForm>
    </OrdersWrapper>
  )
}

export default OrdersWidget
