import React, { useMemo, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import lowBalanceIcon from 'assets/img/lowBalance.svg'

import { faSpinner, faTrashAlt, faExchangeAlt, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'toastify'

import { isOrderUnlimited, isNeverExpiresOrder } from '@gnosis.pm/dex-js'

// import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { getTokenFromExchangeById } from 'services'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'

import { safeTokenName, formatAmount, formatAmountFull, formatDateFromBatchId, formatPrice } from 'utils'
import { onErrorFactory } from 'utils/onError'
import { AuctionElement } from 'api/exchange/ExchangeApi'
import TokenImg from 'components/TokenImg'
import { OrderRowWrapper } from './OrderRow.styled'

const PendingLink: React.FC<Pick<Props, 'transactionHash'>> = ({ transactionHash }) => {
  return (
    <td className="pendingCell" data-label="Actions">
      <FontAwesomeIcon icon={faSpinner} size="lg" spin />
      {transactionHash && <EtherscanLink identifier={transactionHash} type="tx" label={<small>view</small>} />}
    </td>
  )
}

const DeleteOrder: React.FC<Pick<
  Props,
  'isMarkedForDeletion' | 'toggleMarkedForDeletion' | 'pending' | 'disabled'
>> = ({ isMarkedForDeletion, toggleMarkedForDeletion, pending, disabled }) => (
  <td data-label="Actions" className="checked">
    <input
      type="checkbox"
      onChange={toggleMarkedForDeletion}
      checked={isMarkedForDeletion && !pending}
      disabled={disabled}
    />
    <button className="danger" onClick={toggleMarkedForDeletion}>
      Cancel Order <FontAwesomeIcon icon={faTrashAlt} />
    </button>
  </td>
)

function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

function calculatePrice(numeratorString?: string | null, denominatorString?: string | null): string {
  let price
  if (numeratorString && denominatorString) {
    const numerator = new BigNumber(numeratorString)
    const denominator = new BigNumber(denominatorString)

    price = formatPrice(numerator, denominator)
  }

  return price || 'N/A'
}

interface OrderDetailsProps extends Pick<Props, 'order' | 'pending'> {
  buyToken: TokenDetails
  sellToken: TokenDetails
}

const OrderImage: React.FC<Pick<OrderDetailsProps, 'sellToken' | 'buyToken'>> = ({ buyToken, sellToken }) => {
  return (
    <td className="order-image-row">
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
    </td>
  )
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ buyToken, sellToken, order }) => {
  const price = useMemo(() => {
    const numeratorString = formatAmountFull(order.priceNumerator, buyToken.decimals, false)
    const denominatorString = formatAmountFull(order.priceDenominator, sellToken.decimals, false)

    return calculatePrice(numeratorString, denominatorString)
  }, [buyToken, order.priceDenominator, order.priceNumerator, sellToken])

  return (
    <td data-label="Price">
      <div className="order-details">
        {/* <Highlight color={pending ? 'grey' : ''} /> */}
        {price} {displayTokenSymbolOrLink(sellToken)}
        {'/'}
        {displayTokenSymbolOrLink(buyToken)}
        <br />
        {price} {displayTokenSymbolOrLink(buyToken)}
        {'/'}
        {displayTokenSymbolOrLink(sellToken)}
      </div>
    </td>
  )
}

interface UnfilledAmountProps extends Pick<Props, 'order' | 'pending'> {
  sellToken: TokenDetails
  isUnlimited: boolean
}

const UnfilledAmount: React.FC<UnfilledAmountProps> = ({ sellToken, order, isUnlimited }) => {
  const unfilledAmount = useMemo(() => formatAmount(order.remainingAmount, sellToken.decimals) || '0', [
    order.remainingAmount,
    sellToken.decimals,
  ])

  return (
    <td data-label="Unfilled Amount" className={isUnlimited ? '' : 'sub-columns two-columns'}>
      {isUnlimited ? (
        // <Highlight color={pending ? 'grey' : ''}>no limit</Highlight>
        <span>no limit</span>
      ) : (
        <>
          <div>{unfilledAmount}</div>
          <div>
            <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
          </div>
        </>
      )}
    </td>
  )
}

//TODO: no longer needed? remove
// interface AccountBalanceProps extends Pick<Props, 'order' | 'isOverBalance'> {
//   sellToken: TokenDetails
//   isUnlimited: boolean
// }

// const AccountBalance: React.FC<AccountBalanceProps> = ({ sellToken, order, isOverBalance, isUnlimited }) => {
//   const accountBalance = useMemo(() => formatAmount(order.sellTokenBalance, sellToken.decimals) || '0', [
//     order.sellTokenBalance,
//     sellToken.decimals,
//   ])
//   const isActive = isOrderActive(order, new Date())

//   return (
//     <td data-label="Account Balance" className="sub-columns three-columns">
//       <div>{accountBalance}</div>
//       <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
//       {isOverBalance && isActive && !isUnlimited && (
//         <div className="warning">
//           <FontAwesomeIcon icon={faExclamationTriangle} />
//         </div>
//       )}
//     </td>
//   )
// }

const Expires: React.FC<Pick<Props, 'order' | 'pending'>> = ({ order }) => {
  const { isNeverExpires, expiresOn } = useMemo(() => {
    const isNeverExpires = isNeverExpiresOrder(order.validUntil)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)

    return { isNeverExpires, expiresOn }
  }, [order.validUntil])

  return (
    <td data-label="Expires">
      {isNeverExpires ? (
        // <Highlight color={pending ? 'grey' : ''}>Never</Highlight>
        <span>Never</span>
      ) : (
        // <Highlight color={'inherit'}>{expiresOn}</Highlight>
        <span>{expiresOn}</span>
      )}
    </td>
  )
}

async function fetchToken(
  tokenId: number,
  orderId: string,
  networkId: number,
  setFn: React.Dispatch<React.SetStateAction<TokenDetails | null>>,
  isPendingOrder?: boolean,
): Promise<void> {
  const token = await getTokenFromExchangeById({ tokenId, networkId })

  // It is unlikely the token ID coming form the order won't exist
  // Still, if that ever happens, store null and keep this order hidden
  setFn(token)

  // Also, inform the user this token failed and the order is hidden.
  if (!token && !isPendingOrder) {
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
    <td className="cardOpener" onClick={handleOpen}>
      <FontAwesomeIcon icon={openStatus ? faChevronUp : faChevronDown} />
    </td>
  )
}

interface Props {
  order: AuctionElement
  isOverBalance: boolean
  networkId: number
  pending?: boolean
  transactionHash?: string
  isMarkedForDeletion?: boolean
  toggleMarkedForDeletion?: () => void
  disabled: boolean
  isPendingOrder?: boolean
}

const onError = onErrorFactory('Failed to fetch token')

const OrderRow: React.FC<Props> = props => {
  const {
    order,
    networkId,
    pending = false,
    transactionHash,
    isMarkedForDeletion,
    toggleMarkedForDeletion,
    disabled,
    isPendingOrder,
  } = props

  // Fetching buy and sell tokens
  const [sellToken, setSellToken] = useSafeState<TokenDetails | null>(null)
  const [buyToken, setBuyToken] = useSafeState<TokenDetails | null>(null)
  const [openCard, setOpenCard] = useSafeState(true)

  useEffect(() => {
    fetchToken(order.buyTokenId, order.id, networkId, setBuyToken, isPendingOrder).catch(onError)
    fetchToken(order.sellTokenId, order.id, networkId, setSellToken, isPendingOrder).catch(onError)
  }, [isPendingOrder, networkId, order, setBuyToken, setSellToken])

  const isUnlimited = isOrderUnlimited(order.priceDenominator, order.priceNumerator)

  return (
    sellToken &&
    buyToken && (
      <OrderRowWrapper $color={pending ? 'grey' : 'inherit'} $open={openCard}>
        {!isPendingOrder &&
          (pending ? (
            <PendingLink transactionHash={transactionHash} />
          ) : (
            <DeleteOrder
              isMarkedForDeletion={isMarkedForDeletion}
              toggleMarkedForDeletion={toggleMarkedForDeletion}
              pending={pending}
              disabled={disabled}
            />
          ))}
        <OrderImage sellToken={sellToken} buyToken={buyToken} />
        <OrderDetails order={order} sellToken={sellToken} buyToken={buyToken} />
        {!isPendingOrder ? (
          <UnfilledAmount order={order} sellToken={sellToken} isUnlimited={isUnlimited} />
        ) : (
          <PendingLink />
        )}
        {/* {!isPendingOrder ? (
          <AccountBalance order={order} isOverBalance={isOverBalance} sellToken={sellToken} isUnlimited={isUnlimited} />
        ) : (
          <PendingLink />
        )} */}
        {!isPendingOrder ? <Expires order={order} pending={pending} /> : <PendingLink />}
        <td className="status">
          Partial Fill{' '}
          <span className="lowBalance">
            low balance
            <img src={lowBalanceIcon} />
          </span>
        </td>
        <ResponsiveRowSizeToggler handleOpen={(): void => setOpenCard(!openCard)} openStatus={openCard} />
      </OrderRowWrapper>
    )
  )
}

export default OrderRow
