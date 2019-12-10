import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons'

import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { TokenDetails } from 'types'
import { safeTokenName } from 'utils'

const OrderRowWrapper = styled.div`
  .container {
    display: grid;
    position: relative;
  }

  .order-details {
    grid-template-columns: 6em 3em 5em;
    grid-template-rows: repeat(2, 1fr);
    justify-self: start;
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

  .pendingCell {
    place-items: center;

    a {
      top: 100%;
      position: absolute;
    }
  }

  &.pending {
    color: grey;
  }
`

const PendingLink: React.FC<Pick<Props, 'pending'>> = ({ pending }) => {
  if (!pending) {
    return null
  }

  // TODO: use proper pending tx hash for link
  return (
    <div className="container pendingCell">
      <FontAwesomeIcon icon={faSpinner} size="lg" spin />
      <EtherscanLink identifier="bla" type="tx" label={<small>view</small>} />
    </div>
  )
}

const OrderDetails: React.FC<Pick<Props, 'price' | 'buyToken' | 'sellToken' | 'pending'>> = ({
  price,
  buyToken,
  sellToken,
  pending,
}) => {
  return (
    <div className="container order-details">
      <div>Sell</div>
      <div>
        <Highlight color={pending ? 'grey' : ''}>1</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(sellToken)}</strong>
      </div>

      <div>
        for <strong>at least</strong>
      </div>
      <div>
        <Highlight color={pending ? 'grey' : 'red'}>{price}</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(buyToken)}</strong>
      </div>
    </div>
  )
}

const UnfilledAmount: React.FC<Pick<Props, 'sellToken' | 'unfilledAmount' | 'unlimited' | 'pending'>> = ({
  sellToken,
  unfilledAmount,
  unlimited,
  pending,
}) => {
  return (
    <div className={'container' + (unlimited ? '' : ' sub-columns two-columns')}>
      {unlimited ? (
        <Highlight color={pending ? 'grey' : ''}>no limit</Highlight>
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
      {overBalance && (
        <div className="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
      )}
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
  pending?: boolean
}

const OrderRow: React.FC<Props> = props => {
  const { id, expiresOn, unlimited, pending = false } = props
  return (
    <OrderRowWrapper className={'orderRow' + (pending ? ' pending' : '')} data-id={id}>
      <PendingLink {...props} />
      <div className="checked">
        <input type="checkbox" />
      </div>
      <OrderDetails {...props} />
      <UnfilledAmount {...props} />
      <AvailableAmount {...props} />
      <div className="cell">{unlimited ? <Highlight color={pending ? 'grey' : ''}>Never</Highlight> : expiresOn}</div>
    </OrderRowWrapper>
  )
}

export default OrderRow
