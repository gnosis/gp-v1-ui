import React, { useMemo, useEffect, useRef } from 'react'
import { toast } from 'toastify'

// types, utils and services
import { Fraction, TokenDetails } from 'types'
import { isNeverExpiresOrder } from '@gnosis.pm/dex-js'

// assets
import alertIcon from 'assets/img/alert.svg'

// components
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Spinner } from 'components/common/Spinner'
import { StatusCountdown } from 'components/StatusCountdown'

// Common
import { EllipsisText } from 'components/common/EllipsisText'

// hooks
import useSafeState from 'hooks/useSafeState'

import {
  formatSmart,
  formatDateFromBatchId,
  batchIdToDate,
  isOrderFilled,
  dateToBatchId,
  getTimeRemainingInBatch,
} from 'utils'

import { DetailedAuctionElement } from 'api/exchange/ExchangeApi'

import { OrderRowWrapper } from 'components/OrdersWidget/OrderRow.styled'
import { displayTokenSymbolOrLink } from 'utils/display'
import { SmartPrice } from 'components/common/SmartPrice'

const PendingLink: React.FC<Pick<Props, 'transactionHash'>> = (props) => {
  const { transactionHash } = props
  return (
    <>
      <Spinner size="sm" />
      &nbsp;Pending...
      <br />
      {transactionHash && (
        <BlockExplorerLink identifier={transactionHash} type="tx" label={<small>View status</small>} />
      )}
    </>
  )
}

type DeleteOrderProps = Pick<Props, 'isMarkedForDeletion' | 'toggleMarkedForDeletion' | 'pending' | 'disabled'>

const DeleteOrder: React.FC<DeleteOrderProps> = ({
  isMarkedForDeletion,
  toggleMarkedForDeletion,
  pending,
  disabled,
}) => (
  <td data-label="Cancel Order" className="checked">
    <input
      type="checkbox"
      onChange={toggleMarkedForDeletion}
      checked={isMarkedForDeletion && !pending}
      disabled={disabled}
    />
  </td>
)

interface MarketProps {
  sellToken: TokenDetails
  buyToken: TokenDetails
  onCellClick: (e: Pick<React.BaseSyntheticEvent<HTMLInputElement>, 'target'>) => void
}

const Market: React.FC<MarketProps> = ({ sellToken, buyToken, onCellClick }) => {
  const labels = useMemo(
    () => ({
      label: `Swap ${displayTokenSymbolOrLink(buyToken)} for ${displayTokenSymbolOrLink(sellToken)}`,
      market: `${displayTokenSymbolOrLink(buyToken)}/${displayTokenSymbolOrLink(sellToken)}`,
    }),
    [buyToken, sellToken],
  )
  return (
    <td
      data-label="Market"
      onClick={(): void =>
        onCellClick({
          target: {
            value: labels.market,
          },
        })
      }
    >
      {labels.label}
    </td>
  )
}

interface OrderDetailsProps {
  buyToken: TokenDetails
  sellToken: TokenDetails
  price: Fraction
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ buyToken, sellToken, price }) => {
  return (
    <td data-label="Price" className="showResponsive">
      <div className="order-details">
        <SmartPrice sellToken={sellToken} buyToken={buyToken} price={price} />
      </div>
    </td>
  )
}

interface AmountsProps extends Pick<Props, 'order' | 'pending'> {
  sellToken: TokenDetails
}

const Amounts: React.FC<AmountsProps> = ({ sellToken, order }) => {
  const filledAmount = useMemo(() => {
    const filledAmount = order.priceDenominator.sub(order.remainingAmount)

    return formatSmart(filledAmount, sellToken.decimals) || '0'
  }, [order.priceDenominator, order.remainingAmount, sellToken.decimals])

  const totalAmount = useMemo(() => formatSmart(order.priceDenominator, sellToken.decimals) || '0', [
    order.priceDenominator,
    sellToken.decimals,
  ])

  let filledCellContent = 'no limit'
  let totalCellContent = 'no limit'

  if (!order.isUnlimited) {
    filledCellContent = `${filledAmount} ${displayTokenSymbolOrLink(sellToken)}`
    totalCellContent = `${totalAmount} ${displayTokenSymbolOrLink(sellToken)}`
  }

  return (
    <>
      <td className="amounts" data-label="Filled Amount">
        {filledCellContent}
      </td>
      <td className="amounts" data-label="Total Amount">
        {totalCellContent}
      </td>
    </>
  )
}

const Expires: React.FC<Pick<Props, 'order' | 'pending' | 'isPendingOrder'>> = ({ order, isPendingOrder }) => {
  const { isNeverExpires, expiresOn, expireDateFormatted } = useMemo(() => {
    const isNeverExpires = isNeverExpiresOrder(order.validUntil) || (isPendingOrder && order.validUntil === 0)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)
    const expireDateFormatted = batchIdToDate(order.validUntil).toLocaleString()

    return { isNeverExpires, expiresOn, expireDateFormatted }
  }, [isPendingOrder, order.validUntil])

  return (
    <td data-label="Expires">
      {isNeverExpires ? <span>Never</span> : <span title={expireDateFormatted}>{expiresOn}</span>}
    </td>
  )
}

const OrderID: React.FC<Pick<MarketProps, 'onCellClick'> & { isPendingOrder: boolean; orderId: string }> = ({
  orderId,
  isPendingOrder,
  onCellClick,
}) => (
  <td
    data-label="Order ID"
    onClick={(): false | void =>
      !isPendingOrder &&
      onCellClick({
        target: {
          value: orderId,
        },
      })
    }
  >
    {isPendingOrder ? <Spinner /> : <EllipsisText title={orderId}>{orderId}</EllipsisText>}
  </td>
)

const Status: React.FC<Pick<Props, 'order' | 'isOverBalance' | 'transactionHash' | 'isPendingOrder'>> = ({
  order,
  isOverBalance,
  isPendingOrder,
  transactionHash,
}) => {
  const now = new Date()
  const batchId = dateToBatchId(now)
  const msRemainingInBatch = getTimeRemainingInBatch({ inMilliseconds: true })

  const validFromDate = batchIdToDate(order.validFrom)
  const isExpiredOrder = batchIdToDate(order.validUntil) <= now
  const isScheduled = validFromDate > now
  const isActiveNextBatch = batchId === order.validFrom
  const isFirstActiveBatch = batchId === order.validFrom + 1 && msRemainingInBatch > 60 * 1000 // up until minute 4
  const isUnlimited = order.isUnlimited
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
    <td className="status showResponsive" data-label="Status" title={isScheduled ? validFromDate.toLocaleString() : ''}>
      {pending ? (
        pending
      ) : isFilled ? (
        'Filled'
      ) : isExpiredOrder ? (
        'Expired'
      ) : isActiveNextBatch ? (
        <>
          {`Tradable in next batch: `} <StatusCountdown />
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
            <img src={alertIcon} />
          </span>
        </>
      )}
    </td>
  )
}

function fetchToken(
  orderId: string,
  token: TokenDetails | null,
  setFn: React.Dispatch<React.SetStateAction<TokenDetails | null>>,
  isPendingOrder?: boolean,
): void {
  // It is unlikely the token ID coming form the order won't exist
  // Still, if that ever happens, store null and keep this order hidden
  setFn(token)

  // Also, inform the user this token failed and the order is hidden.
  if (!token && !isPendingOrder) {
    toast.warn(`Token used on orderId ${orderId} is not a valid ERC20 token. Order will not be displayed.`)
  }
}

interface Props {
  order: DetailedAuctionElement
  isOverBalance: boolean
  networkId: number
  pending?: boolean
  transactionHash?: string
  isMarkedForDeletion?: boolean
  toggleMarkedForDeletion?: () => void
  disabled: boolean
  isPendingOrder?: boolean
  onCellClick: (e: Pick<React.BaseSyntheticEvent<HTMLInputElement>, 'target'>) => void
}

const OrderRow: React.FC<Props> = (props) => {
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
    onCellClick,
  } = props

  // Fetching buy and sell tokens
  const [sellToken, setSellToken] = useSafeState<TokenDetails | null>(null)
  const [buyToken, setBuyToken] = useSafeState<TokenDetails | null>(null)

  useEffect(() => {
    fetchToken(order.id, order.buyToken as TokenDetails, setBuyToken, isPendingOrder)
    fetchToken(order.id, order.sellToken as TokenDetails, setSellToken, isPendingOrder)
  }, [isPendingOrder, networkId, order, setBuyToken, setSellToken])

  const price: Fraction = useMemo(
    () => ({
      numerator: order.priceNumerator,
      denominator: order.priceDenominator,
    }),
    [order.priceNumerator, order.priceDenominator],
  )

  return (
    sellToken &&
    buyToken && (
      <OrderRowWrapper data-order-id={order.id} className={`orderRowWrapper${pending ? ' pending' : ''}`}>
        <DeleteOrder
          isMarkedForDeletion={isMarkedForDeletion}
          toggleMarkedForDeletion={toggleMarkedForDeletion}
          pending={pending}
          disabled={disabled || isPendingOrder || pending}
        />
        <Market sellToken={sellToken} buyToken={buyToken} onCellClick={onCellClick} />
        <OrderDetails price={price} sellToken={sellToken} buyToken={buyToken} />
        <Amounts order={order} sellToken={sellToken} />
        <Expires order={order} pending={pending} isPendingOrder={isPendingOrder} />
        <OrderID orderId={order.id} isPendingOrder={!!isPendingOrder} onCellClick={onCellClick} />
        <Status
          order={order}
          isOverBalance={isOverBalance}
          isPendingOrder={isPendingOrder}
          transactionHash={transactionHash}
        />
      </OrderRowWrapper>
    )
  )
}

export default OrderRow
