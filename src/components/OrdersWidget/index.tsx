import React, { useMemo } from 'react'
import styled from 'styled-components'
import { faExchangeAlt, faChartLine, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Widget from 'components/layout/Widget'
import Highlight from 'components/Highlight'
import { tokenListApi } from 'api'
import { getToken } from 'utils'
import { Network, TokenDetails } from 'types'
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

    div:last-child {
      justify-self: end;
    }
  }

  .ordersContainer {
    display: grid;
    grid-template-columns: auto;
    margin: 2em 0 2em -3em;
  }

  .rowContainer {
    display: inherit;
    grid-template-columns: minmax(2em, 6%) minmax(20em, 1.5fr) 1fr 1fr 1fr;
    align-items: center;
    margin: 0.25em 0;
  }

  .headerRow {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    align-items: stretch;
    justify-items: stretch;

    .cell {
      border-bottom: 2px solid #ededed;
      text-align: center;
    }

    div:first-child {
      align-self: center;
    }

    > * {
      padding-bottom: 0.25em;
    }
  }

  .cell {
    text-align: center;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .warning {
    color: orange;
  }

  .error {
    color: red;
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

  return (
    <OrdersWrapper>
      <div className="header">
        <h2>Your orders</h2>
        <CreateButtons>
          <ButtonWithIcon>
            <FontAwesomeIcon icon={faExchangeAlt} /> Trade
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
            <div className="rowContainer headerRow">
              <div>
                <input type="checkbox" />
              </div>
              <div className="cell">Order details</div>
              <div className="cell">
                Unfilled <br /> amount
              </div>
              <div className="cell">
                Available <br />
                amount
              </div>
              <div className="cell">Expires</div>
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
            <span>Select first the orders you want to delete</span>
          </div>
        </form>
      </OrdersForm>
    </OrdersWrapper>
  )
}

export default OrdersWidget
