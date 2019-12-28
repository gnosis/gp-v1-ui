import React, { useMemo, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { getTokenFromExchangeById } from 'services'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'

import { safeTokenName, formatAmount, formatAmountFull, isBatchIdFarInTheFuture, formatDateFromBatchId } from 'utils'
import { onErrorFactory } from 'utils/onError'
import { MIN_UNLIMITED_SELL_ORDER } from 'const'
import { AuctionElement } from 'api/exchange/ExchangeApi'

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

const PendingLink: React.FC<Pick<Props, 'pending' | 'transactionHash'>> = ({ pending, transactionHash }) => {
  if (!pending) {
    return null
  }

  return (
    <div className="container pendingCell">
      <FontAwesomeIcon icon={faSpinner} size="lg" spin />
      {transactionHash && <EtherscanLink identifier={transactionHash} type="tx" label={<small>view</small>} />}
    </div>
  )
}

const DeleteOrder: React.FC<Pick<
  Props,
  'isMarkedForDeletion' | 'toggleMarkedForDeletion' | 'pending' | 'disabled'
>> = ({ isMarkedForDeletion, toggleMarkedForDeletion, pending, disabled }) => (
  <div className="checked">
    <input
      type="checkbox"
      onChange={toggleMarkedForDeletion}
      checked={isMarkedForDeletion && !pending}
      disabled={disabled}
    />
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
    <div className="container order-details">
      <div>Sell</div>
      <div>
        <Highlight color={pending ? 'grey' : ''}>1</Highlight>
      </div>
      <div>
        <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
      </div>

      <div>
        for <strong>at least</strong>
      </div>
      <div>
        <Highlight color={pending ? 'grey' : 'red'}>{price}</Highlight>
      </div>
      <div>
        <strong>{displayTokenSymbolOrLink(buyToken)}</strong>
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
    <div className={'container' + (unlimited ? '' : ' sub-columns two-columns')}>
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

  return (
    <div className="container sub-columns three-columns">
      <div>{accountBalance}</div>
      <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
      <div className="warning">{isOverBalance && <FontAwesomeIcon icon={faExclamationTriangle} />}</div>
    </div>
  )
}

const Expires: React.FC<Pick<Props, 'order' | 'pending'>> = ({ order, pending }) => {
  const { isNeverExpires, expiresOn } = useMemo(() => {
    const isNeverExpires = isBatchIdFarInTheFuture(order.validUntil)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)

    return { isNeverExpires, expiresOn }
  }, [order.validUntil])

  return <div>{isNeverExpires ? <Highlight color={pending ? 'grey' : ''}>Never</Highlight> : expiresOn}</div>
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

  useEffect(() => {
    fetchToken(order.buyTokenId, order.id, networkId, setBuyToken).catch(onError)
    fetchToken(order.sellTokenId, order.id, networkId, setSellToken).catch(onError)
  }, [networkId, order, setBuyToken, setSellToken])

  return (
    <>
      {sellToken && buyToken && (
        <OrderRowWrapper className={'orderRow' + (pending ? ' pending' : '')}>
          <PendingLink pending={pending} transactionHash={transactionHash} />
          <DeleteOrder
            isMarkedForDeletion={isMarkedForDeletion}
            toggleMarkedForDeletion={toggleMarkedForDeletion}
            pending={pending}
            disabled={disabled}
          />
          <OrderDetails order={order} sellToken={sellToken} buyToken={buyToken} />
          <UnfilledAmount order={order} sellToken={sellToken} />
          <AccountBalance order={order} isOverBalance={isOverBalance} sellToken={sellToken} />
          <Expires order={order} pending={pending} />
        </OrderRowWrapper>
      )}
    </>
  )
}

export default OrderRow
