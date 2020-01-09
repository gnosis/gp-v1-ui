import React, { useMemo, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faSpinner,
  faTrashAlt,
  faExchangeAlt,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'
// import TokenImg from 'components/TokenImg'

import { getTokenFromExchangeById } from 'services'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'

import {
  safeTokenName,
  formatAmount,
  formatAmountFull,
  isBatchIdFarInTheFuture,
  formatDateFromBatchId,
  isOrderActive,
} from 'utils'
import { onErrorFactory } from 'utils/onError'
import { MIN_UNLIMITED_SELL_ORDER, RESPONSIVE_SIZES } from 'const'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import TokenImg from 'components/TokenImg'

export const OrderRowWrapper = styled.tr<{ $open?: boolean }>`
  .order-image-row {
    display: none;
  }

  .checked {
    > button {
      display: none;
      justify-content: center;
      align-items: center;

      margin: 0 0 0 auto;
      > * {
        margin: 0 0.5rem;
      }
    }
  }

  .order-details-responsive {
    display: none;
  }

  .order-details {
    display: grid;
    grid-template-columns: max-content max-content;
    grid-gap: 0 1rem;
    text-align: left;
    justify-content: space-evenly;

    .order-details-subgrid {
      display: grid;
      grid-template-columns: min-content minmax(5.6rem, max-content);
      grid-gap: 0 0.5rem;
      justify-content: space-between;
    }
  }

  .sub-columns {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;

    div:first-child {
      justify-self: end;
    }

    > *:not(:last-child) {
      margin: 0 0.3rem;
    }
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

  @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
    &.selected {
      > div {
        border-bottom: 0.0625rem solid #ffffff40;
      }
    }

    // All TR row items
    > div {
      // Cancel Order Row - shown as button in responsive
      &:first-child {
        width: 100%;
        grid-row-start: 6;

        > img {
          order: 2;
          margin-right: -0.5rem;
        }
      }

      // First row - TokenA <-> TokenB - visible in Responsive
      &.order-image-row {
        cursor: pointer;
        display: initial;
        > div {
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          max-width: 72%;
          margin: auto;

          > div {
            display: inherit;
            justify-content: inherit;
            align-items: center;
            > * {
              margin: 0 0.3rem;
            }
          }
        }
      }

      // Hide Web view "Order Details" for condensed responsive version
      > .order-details {
        display: none;
      }
      > .order-details-responsive {
        display: flex;
      }
      // Web view checkbox for order cancellation
      &.checked {
        > button {
          display: initial;
        }
        > input {
          display: none;
        }
      }

      ${(props): string | false =>
        !props.$open &&
        `
        // &:not(:nth-child(2)):not(:nth-child(3)):not(:last-child) {
        //   display: none;
        // }
      `}
    }
  }
`

const PendingLink: React.FC<Pick<Props, 'transactionHash'>> = ({ transactionHash }) => {
  return (
    <div className="pendingCell" data-label="Actions">
      <FontAwesomeIcon icon={faSpinner} size="lg" spin />
      {transactionHash && <EtherscanLink identifier={transactionHash} type="tx" label={<small>view</small>} />}
    </div>
  )
}

const DeleteOrder: React.FC<Pick<
  Props,
  'isMarkedForDeletion' | 'toggleMarkedForDeletion' | 'pending' | 'disabled'
>> = ({ isMarkedForDeletion, toggleMarkedForDeletion, pending, disabled }) => (
  <div data-label="Actions" className="checked">
    <input
      type="checkbox"
      onChange={toggleMarkedForDeletion}
      checked={isMarkedForDeletion && !pending}
      disabled={disabled}
    />
    <button className="danger" onClick={toggleMarkedForDeletion}>
      Cancel Order <FontAwesomeIcon icon={faTrashAlt} />
    </button>
  </div>
)

function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

function calculatePrice(_numerator?: string | null, _denominator?: string | null): string {
  if (!_numerator || !_denominator) {
    return 'N/A'
  }
  const numerator = new BigNumber(_numerator)
  const denominator = new BigNumber(_denominator)
  const price = numerator.dividedBy(denominator)
  return price.toFixed(2)
}

interface OrderDetailsProps extends Pick<Props, 'order' | 'pending'> {
  buyToken: TokenDetails
  sellToken: TokenDetails
}

const OrderImage: React.FC<Pick<OrderDetailsProps, 'sellToken' | 'buyToken'>> = ({ buyToken, sellToken }) => {
  return (
    <div className="order-image-row">
      <div>
        {/* e.g SELL DAI <-> BUY TUSD */}
        <div>
          <TokenImg src={sellToken.image} alt={sellToken.addressMainnet} />{' '}
          <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
        </div>
        {/* Switcher icon */}
        <FontAwesomeIcon icon={faExchangeAlt} size="lg" />
        <div>
          <strong>{displayTokenSymbolOrLink(buyToken)}</strong>{' '}
          <TokenImg src={buyToken.image} alt={buyToken.addressMainnet} />
        </div>
      </div>
    </div>
  )
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ buyToken, sellToken, order, pending }) => {
  const price = useMemo(
    () =>
      calculatePrice(
        formatAmountFull(order.priceNumerator, buyToken.decimals, false),
        formatAmountFull(order.priceDenominator, sellToken.decimals, false),
      ),
    [buyToken, order.priceDenominator, order.priceNumerator, sellToken],
  )
  return (
    <div data-label="Price (at least)">
      <div className="order-details">
        <div>Sell</div>
        <div className="order-details-subgrid">
          <Highlight color={pending ? 'grey' : ''}>1</Highlight> <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
        </div>

        <div>
          for <strong>at least</strong>
        </div>
        <div className="order-details-subgrid">
          <Highlight color={pending ? 'grey' : 'red'}>{price}</Highlight>{' '}
          <strong>{displayTokenSymbolOrLink(buyToken)}</strong>
        </div>
      </div>
      <div className="order-details-responsive">
        <div className="order-details-subgrid">
          <Highlight color={pending ? 'grey' : 'red'}>{price}</Highlight>{' '}
          <strong>{displayTokenSymbolOrLink(buyToken)}</strong>
        </div>
      </div>
    </div>
  )
}

interface UnfilledAmountProps extends Pick<Props, 'order' | 'pending'> {
  sellToken: TokenDetails
}

const UnfilledAmount: React.FC<UnfilledAmountProps> = ({ sellToken, order, pending }) => {
  const unfilledAmount = useMemo(() => formatAmount(order.remainingAmount, sellToken.decimals) || '0', [
    order.remainingAmount,
    sellToken.decimals,
  ])
  const unlimited = order.priceDenominator.gt(MIN_UNLIMITED_SELL_ORDER)

  return (
    <div data-label="Unfilled Amount" className={unlimited ? '' : 'sub-columns two-columns'}>
      {unlimited ? (
        <Highlight color={pending ? 'grey' : ''}>no limit</Highlight>
      ) : (
        <>
          <div>{unfilledAmount}</div>
          <div>
            <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
          </div>
        </>
      )}
    </div>
  )
}

interface AccountBalanceProps extends Pick<Props, 'order' | 'isOverBalance'> {
  sellToken: TokenDetails
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ sellToken, order, isOverBalance }) => {
  const accountBalance = useMemo(() => formatAmount(order.sellTokenBalance, sellToken.decimals) || '0', [
    order.sellTokenBalance,
    sellToken.decimals,
  ])
  const isActive = isOrderActive(order, new Date())

  return (
    <div data-label="Account Balance" className="sub-columns three-columns">
      <div>{accountBalance}</div>
      <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
      {isOverBalance && isActive && (
        <div className="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
      )}
    </div>
  )
}

const Expires: React.FC<Pick<Props, 'order' | 'pending'>> = ({ order, pending }) => {
  const { isNeverExpires, expiresOn } = useMemo(() => {
    const isNeverExpires = isBatchIdFarInTheFuture(order.validUntil)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)

    return { isNeverExpires, expiresOn }
  }, [order.validUntil])

  return (
    <div data-label="Expires">
      {isNeverExpires ? (
        <Highlight color={pending ? 'grey' : ''}>Never</Highlight>
      ) : (
        <Highlight color={'inherit'}>{expiresOn}</Highlight>
      )}
    </div>
  )
}

async function fetchToken(
  tokenId: number,
  orderId: string,
  networkId: number,
  setFn: React.Dispatch<React.SetStateAction<TokenDetails | null>>,
): Promise<void> {
  const token = await getTokenFromExchangeById({ tokenId, networkId })

  // It is unlikely the token ID coming form the order won't exist
  // Still, if that ever happens, store null and keep this order hidden
  setFn(token)

  // Also, inform the user this token failed and the order is hidden.
  if (!token) {
    toast.warn(
      `Token id ${tokenId} used on orderId ${orderId} is not a valid ERC20 token. Order will not be displayed.`,
    )
  }
}

interface ResponsiveRowSizeTogglerProps {
  handleOpen: () => void
  openStatus: boolean
}

const ResponsiveRowSizeToggler: React.FC<ResponsiveRowSizeTogglerProps> = ({ handleOpen, openStatus }) => {
  return (
    <div className="cardOpener" onClick={handleOpen}>
      <FontAwesomeIcon icon={openStatus ? faChevronUp : faChevronDown} />
    </div>
  )
}

interface Props {
  order: AuctionElement
  isOverBalance: boolean
  networkId: number
  pending?: boolean
  transactionHash?: string
  isMarkedForDeletion: boolean
  toggleMarkedForDeletion: () => void
  disabled: boolean
}

const onError = onErrorFactory('Failed to fetch token')

const OrderRow: React.FC<Props> = props => {
  const {
    order,
    isOverBalance,
    networkId,
    pending = false,
    transactionHash,
    isMarkedForDeletion,
    toggleMarkedForDeletion,
    disabled,
  } = props

  // Fetching buy and sell tokens
  const [sellToken, setSellToken] = useSafeState<TokenDetails | null>(null)
  const [buyToken, setBuyToken] = useSafeState<TokenDetails | null>(null)
  const [openCard, setOpenCard] = useSafeState(true)

  useEffect(() => {
    fetchToken(order.buyTokenId, order.id, networkId, setBuyToken).catch(onError)
    fetchToken(order.sellTokenId, order.id, networkId, setSellToken).catch(onError)
  }, [networkId, order, setBuyToken, setSellToken])

  return (
    sellToken &&
    buyToken && (
      <OrderRowWrapper className={pending ? 'pending' : ''} $open={openCard}>
        {pending ? (
          <PendingLink transactionHash={transactionHash} />
        ) : (
          <DeleteOrder
            isMarkedForDeletion={isMarkedForDeletion}
            toggleMarkedForDeletion={toggleMarkedForDeletion}
            pending={pending}
            disabled={disabled}
          />
        )}
        <OrderImage sellToken={sellToken} buyToken={buyToken} />
        <OrderDetails order={order} sellToken={sellToken} buyToken={buyToken} />
        <UnfilledAmount order={order} sellToken={sellToken} />
        <AccountBalance order={order} isOverBalance={isOverBalance} sellToken={sellToken} />
        <Expires order={order} pending={pending} />
        <ResponsiveRowSizeToggler handleOpen={(): void => setOpenCard(!openCard)} openStatus={openCard} />
      </OrderRowWrapper>
    )
  )
}

export default OrderRow
