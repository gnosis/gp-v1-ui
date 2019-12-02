import React from 'react'
import styled from 'styled-components'

import Highlight from 'components/Highlight'
import { TokenDetails } from 'types'
import { safeTokenName } from 'utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const OrderRowWrapper = styled.div`
  .container {
    justify-self: center;

    display: grid;
  }

  .order-details {
    grid-template-columns: 6em 3em 5em;
    grid-template-rows: 1fr 1fr;
    justify-items: start;
    justify-self: start;
    padding-left: 1.5em;
  }

  .sub-columns {
    gap: 0.5em;

    div:first-child {
      justify-self: end;
    }
  }

  .two-columns {
    grid-template-columns: repeat(2, 1fr);
  }

  .three-columns {
    grid-template-columns: minmax(4em, 60%) minmax(3em, 30%) minmax(1em, 10%);
  }
`

const OrderDetails: React.FC<Pick<Props, 'price' | 'buyToken' | 'sellToken'>> = ({ price, buyToken, sellToken }) => {
  return (
    <div className="container order-details">
      <div>Sell</div>
      <div>
        <Highlight>1</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(sellToken)}</strong>
      </div>

      <div>
        for <strong>at least</strong>
      </div>
      <div>
        <Highlight className="error">{price}</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(buyToken)}</strong>
      </div>
    </div>
  )
}

const UnfilledAmount: React.FC<Pick<Props, 'sellToken' | 'unfilledAmount' | 'unlimited'>> = ({
  sellToken,
  unfilledAmount,
  unlimited,
}) => {
  return (
    <div className={'container' + (unlimited ? '' : ' sub-columns two-columns')}>
      {unlimited ? (
        <Highlight>no limit</Highlight>
      ) : (
        <>
          <div>{unfilledAmount}</div>
          <div>
            <strong>{safeTokenName(sellToken)}</strong>
          </div>
        </>
      )}
    </div>
  )
}

const AvailableAmount: React.FC<Pick<Props, 'sellToken' | 'availableAmount' | 'overBalance'>> = ({
  sellToken,
  availableAmount,
  overBalance,
}) => {
  return (
    <div className="container sub-columns three-columns">
      <div>{availableAmount}</div>
      <strong>{safeTokenName(sellToken)}</strong>
      <div className="warning">{overBalance && <FontAwesomeIcon icon={faExclamationTriangle} />}</div>
    </div>
  )
}

// TODO: temporary params, adjust when implementing real logic
// probably just take an Order object?
interface Props {
  id: string
  sellToken: TokenDetails
  buyToken: TokenDetails
  price: string
  unfilledAmount?: string
  availableAmount: string
  expiresOn?: string
  overBalance?: boolean
  unlimited?: boolean
}

const OrderRow: React.FC<Props> = props => {
  const { id, expiresOn, unlimited } = props
  return (
    <OrderRowWrapper className="rowContainer" data-id={id}>
      <div>
        <input type="checkbox" />
      </div>
      <OrderDetails {...props} />
      <UnfilledAmount {...props} />
      <AvailableAmount {...props} />
      <div className="cell">{unlimited ? <Highlight>Never</Highlight> : expiresOn}</div>
    </OrderRowWrapper>
  )
}

export default OrderRow
