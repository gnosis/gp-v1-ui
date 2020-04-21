import React, { useMemo, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import lowBalanceIcon from 'assets/img/lowBalance.svg'

import { faSpinner, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'toastify'

import { isOrderUnlimited, isNeverExpiresOrder, calculatePrice, formatPrice, invertPrice } from '@gnosis.pm/dex-js'

// import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { getTokenFromExchangeById } from 'services'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'

import {
  safeTokenName,
  formatAmount,
  formatDateFromBatchId,
  batchIdToDate,
  isOrderFilled,
  dateToBatchId,
  formatSeconds,
  getTimeRemainingInBatch,
} from 'utils'
import { onErrorFactory } from 'utils/onError'
import { AuctionElement } from 'api/exchange/ExchangeApi'

import { OrderRowWrapper } from './OrderRow.styled'
import { useTimeRemainingInBatch } from 'hooks/useTimeRemainingInBatch'

const PendingLink: React.FC<Pick<Props, 'transactionHash'>> = props => {
  const { transactionHash } = props
  return (
    <>
      <FontAwesomeIcon icon={faSpinner} size="sm" spin /> Pending...
      <br />
      {transactionHash && <EtherscanLink identifier={transactionHash} type="tx" label={<small>View status</small>} />}
    </>
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
  </td>
)

function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

interface OrderDetailsProps extends Pick<Props, 'order' | 'pending'> {
  buyToken: TokenDetails
  sellToken: TokenDetails
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ buyToken, sellToken, order }) => {
  const [price, priceInverse] = useMemo((): string[] => {
    const price = calculatePrice({
      numerator: { amount: order.priceNumerator, decimals: buyToken.decimals },
      denominator: { amount: order.priceDenominator, decimals: sellToken.decimals },
    })
    const priceInverse = invertPrice(price)

    return [formatPrice(price), formatPrice(priceInverse)]
  }, [buyToken.decimals, order.priceDenominator, order.priceNumerator, sellToken.decimals])

  return (
    <td data-label="Price">
      <div className="order-details">
        {/* <Highlight color={pending ? 'grey' : ''} /> */}
        {price} {displayTokenSymbolOrLink(sellToken)}
        {'/'}
        {displayTokenSymbolOrLink(buyToken)}
        <br />
        {priceInverse} {displayTokenSymbolOrLink(buyToken)}
        {'/'}
        {displayTokenSymbolOrLink(sellToken)}
      </div>
    </td>
  )
}

interface AmountsProps extends Pick<Props, 'order' | 'pending'> {
  sellToken: TokenDetails
  isUnlimited: boolean
}

const Amounts: React.FC<AmountsProps> = ({ sellToken, order, isUnlimited }) => {
  const filledAmount = useMemo(() => {
    const filledAmount = order.priceDenominator.sub(order.remainingAmount)

    return formatAmount(filledAmount, sellToken.decimals) || '0'
  }, [order.priceDenominator, order.remainingAmount, sellToken.decimals])

  const totalAmount = useMemo(() => formatAmount(order.priceDenominator, sellToken.decimals) || '0', [
    order.priceDenominator,
    sellToken.decimals,
  ])

  return (
    <td data-label="Unfilled Amount">
      {isUnlimited ? (
        <span>no limit</span>
      ) : (
        <>
          <div className="amounts">
            {filledAmount} {displayTokenSymbolOrLink(sellToken)}
            <br />
            {totalAmount} {displayTokenSymbolOrLink(sellToken)}
          </div>
        </>
      )}
    </td>
  )
}

const Expires: React.FC<Pick<Props, 'order' | 'pending' | 'isPendingOrder'>> = ({ order, isPendingOrder }) => {
  const { isNeverExpires, expiresOn } = useMemo(() => {
    const isNeverExpires = isNeverExpiresOrder(order.validUntil) || (isPendingOrder && order.validUntil === 0)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)

    return { isNeverExpires, expiresOn }
  }, [isPendingOrder, order.validUntil])

  return <td data-label="Expires">{isNeverExpires ? <span>Never</span> : <span>{expiresOn}</span>}</td>
}

const StatusCountdown: React.FC<{ timeoutDelta?: number }> = ({ timeoutDelta }) => {
  // If it's rendered, it means it should display the countdown
  const timeRemainingInBatch = useTimeRemainingInBatch()

  // `timeoutDelta` use case is for a countdown that's shorter than batch duration
  // instead of counting all the way down to (currently 5min) batch time, we count instead to
  // batchTime - timeoutDelta.
  // When this countdown is over but there's still time left in the batch, return 0 for safety.
  // Up to parent component to stop rendering at that time
  const timeRemaining = timeoutDelta ? Math.max(0, timeRemainingInBatch - timeoutDelta) : timeRemainingInBatch

  return <>{formatSeconds(timeRemaining)}</>
}

const Status: React.FC<Pick<Props, 'order' | 'isOverBalance' | 'transactionHash' | 'isPendingOrder'>> = ({
  order,
  isOverBalance,
  isPendingOrder,
  transactionHash,
}) => {
  const now = new Date()
  const batchId = dateToBatchId(now)
  const msRemainingInBatch = getTimeRemainingInBatch({ inMilliseconds: true })

  const isExpiredOrder = batchIdToDate(order.validUntil) <= now
  const isScheduled = batchIdToDate(order.validFrom) > now
  const isActiveNextBatch = batchId === order.validFrom
  const isFirstActiveBatch = batchId === order.validFrom + 1 && msRemainingInBatch > 60 * 1000 // up until minute 4

  const isUnlimited = useMemo(() => isOrderUnlimited(order.priceNumerator, order.priceDenominator), [
    order.priceDenominator,
    order.priceNumerator,
  ])
  const isActive = useMemo(() => order.remainingAmount.eq(order.priceDenominator), [
    order.priceDenominator,
    order.remainingAmount,
  ])
  const isFilled = useMemo(() => isOrderFilled(order), [order])
  // Display isLowBalance warning only for active and partial fill orders
  const isLowBalance =
    isOverBalance &&
    !isUnlimited &&
    !isFilled &&
    !isScheduled &&
    !isActiveNextBatch &&
    !isPendingOrder &&
    !isExpiredOrder

  const pending = useMemo(() => isPendingOrder && <PendingLink transactionHash={transactionHash} />, [
    isPendingOrder,
    transactionHash,
  ])

  // Dima's trick to force component update
  const [, forceUpdate] = useSafeState({})

  const refreshTimeout = useRef<null | NodeJS.Timeout>(null)

  // Sets a timeout to update at least once at the end of each countdown
  useEffect(() => {
    function clear(): void {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current)
      refreshTimeout.current = null
    }

    clear()

    const ms = getTimeRemainingInBatch({ inMilliseconds: true })

    if (isActiveNextBatch) {
      refreshTimeout.current = setTimeout(() => forceUpdate({}), ms)
    } else if (isFirstActiveBatch) {
      // we want to display this for 4min (1min less than batch duration)
      const timeout = ms - 60 * 1000

      if (timeout <= 0) {
        // already less than 1min less left, update right now
        forceUpdate({})
      } else {
        // more than 1min left, update when it's over
        refreshTimeout.current = setTimeout(() => forceUpdate({}), timeout)
      }
    }

    return clear
  }, [forceUpdate, isActiveNextBatch, isFirstActiveBatch])

  return (
    <td className="status">
      {pending ? (
        pending
      ) : isExpiredOrder ? (
        'Expired'
      ) : isFilled ? (
        'Filled'
      ) : isActiveNextBatch ? (
        <>
          {`Active in next batch: `} <StatusCountdown />
        </>
      ) : isFirstActiveBatch ? (
        <>
          {`Pending solver submission: `} <StatusCountdown timeoutDelta={60} />
        </>
      ) : isScheduled ? (
        <>
          Scheduled
          <br />
          {formatDateFromBatchId(order.validFrom)}
        </>
      ) : isActive ? (
        'Active'
      ) : (
        'Partial Fill'
      )}
      {isLowBalance && (
        <>
          <br />
          <span className="lowBalance">
            low balance
            <img src={lowBalanceIcon} />
          </span>
        </>
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
    isOverBalance,
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
      <OrderRowWrapper className={pending ? 'pending' : ''} $open={openCard}>
        <DeleteOrder
          isMarkedForDeletion={isMarkedForDeletion}
          toggleMarkedForDeletion={toggleMarkedForDeletion}
          pending={pending}
          disabled={disabled || isPendingOrder || pending}
        />
        <OrderDetails order={order} sellToken={sellToken} buyToken={buyToken} />
        <Amounts order={order} sellToken={sellToken} isUnlimited={isUnlimited} />
        <Expires order={order} pending={pending} isPendingOrder={isPendingOrder} />
        <Status
          order={order}
          isOverBalance={isOverBalance}
          isPendingOrder={isPendingOrder}
          transactionHash={transactionHash}
        />
        <ResponsiveRowSizeToggler handleOpen={(): void => setOpenCard(!openCard)} openStatus={openCard} />
      </OrderRowWrapper>
    )
  )
}

export default OrderRow
