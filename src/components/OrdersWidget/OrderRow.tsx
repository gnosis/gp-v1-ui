import React, { useMemo, useEffect, useRef } from 'react'
import { toast } from 'toastify'

// types, utils and services
import { TokenDetails } from 'types'
import { isNeverExpiresOrder, calculatePrice, formatPrice, invertPrice } from '@gnosis.pm/dex-js'

// assets
import alertIcon from 'assets/img/alert.svg'

// components
import { EtherscanLink } from 'components/common/EtherscanLink'
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

const PendingLink: React.FC<Pick<Props, 'transactionHash'>> = (props) => {
  const { transactionHash } = props
  return (
    <>
      <Spinner size="sm" />
      &nbsp;Pending...
      <br />
      {transactionHash && <EtherscanLink identifier={transactionHash} type="tx" label={<small>View status</small>} />}
    </>
  )
}

const DeleteOrder: React.FC<Pick<
  Props,
  'isMarkedForDeletion' | 'toggleMarkedForDeletion' | 'pending' | 'disabled'
>> = ({ isMarkedForDeletion, toggleMarkedForDeletion, pending, disabled }) => (
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
  const market = useMemo(() => `${displayTokenSymbolOrLink(buyToken)}/${displayTokenSymbolOrLink(sellToken)}`, [
    buyToken,
    sellToken,
  ])
  return (
    <td
      data-label="Market"
      onClick={(): void =>
        onCellClick({
          target: {
            value: market,
          },
        })
      }
    >
      {market}
    </td>
  )
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
    <td data-label="Price" className="showResponsive">
      <div className="order-details">
        <strong>
          {priceInverse} {displayTokenSymbolOrLink(sellToken)}
        </strong>
        <br />
        {price} {displayTokenSymbolOrLink(buyToken)}
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

  return (
    <td data-label="Unfilled Amount">
      {order.isUnlimited ? (
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

const OrderID: React.FC<Pick<MarketProps, 'onCellClick'> & { orderId: string }> = ({ orderId, onCellClick }) => (
  <td
    data-label="Order ID"
    onClick={(): void =>
      onCellClick({
        target: {
          value: orderId,
        },
      })
    }
  >
    <EllipsisText title={orderId}>{orderId}</EllipsisText>
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

  const isExpiredOrder = batchIdToDate(order.validUntil) <= now
  const isScheduled = batchIdToDate(order.validFrom) > now
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
    <td className="status showResponsive" data-label="Status">
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
        <OrderID orderId={order.id} onCellClick={onCellClick} />
        <Market sellToken={sellToken} buyToken={buyToken} onCellClick={onCellClick} />
        <OrderDetails order={order} sellToken={sellToken} buyToken={buyToken} />
        <Amounts order={order} sellToken={sellToken} />
        <Expires order={order} pending={pending} isPendingOrder={isPendingOrder} />
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
