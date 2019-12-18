import React, { useMemo, useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons'

import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { getTokenFromExchangeById } from 'services'

import { TokenDetails, AuctionElement } from 'types'
import { safeTokenName, formatAmount, formatAmountFull, isBatchIdFarInTheFuture, formatDateFromBatchId } from 'utils'
import { MIN_UNLIMITED_SELL_ORDER } from 'const'

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

function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

interface OrderDetailsProps extends Pick<Props, 'pending'> {
  buyToken: TokenDetails
  sellToken: TokenDetails
  price: string
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ price, buyToken, sellToken, pending }) => (
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

interface UnfilledAmountProps extends Pick<Props, 'pending'> {
  sellToken: TokenDetails
  unfilledAmount: string
  unlimited: boolean
}

const UnfilledAmount: React.FC<UnfilledAmountProps> = ({ sellToken, unfilledAmount, unlimited, pending }) => (
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

interface AccountBalanceProps extends Pick<Props, 'isOverBalance'> {
  sellToken: TokenDetails
  accountBalance: string
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ sellToken, accountBalance, isOverBalance }) => (
  <div className="container sub-columns three-columns">
    <div>{accountBalance}</div>
    <strong>{displayTokenSymbolOrLink(sellToken)}</strong>
    <div className="warning">{isOverBalance && <FontAwesomeIcon icon={faExclamationTriangle} />}</div>
  </div>
)

interface ExpiresProps extends Pick<Props, 'pending'> {
  isNeverExpires: boolean
  expiresOn: string
}

const Expires: React.FC<ExpiresProps> = ({ pending, isNeverExpires, expiresOn }) => (
  <div>{isNeverExpires ? <Highlight color={pending ? 'grey' : ''}>Never</Highlight> : expiresOn}</div>
)

interface Props {
  order: AuctionElement
  isOverBalance: boolean
  networkId: number
  pending?: boolean
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

async function fetchToken(
  tokenId: number,
  networkId: number,
  setFn: React.Dispatch<React.SetStateAction<TokenDetails | null>>,
): Promise<void> {
  console.log('fetching token %d', tokenId)
  const token = await getTokenFromExchangeById({ tokenId, networkId })
  console.log('fetched token %d', tokenId, token)

  // It is unlikely the token ID coming form the order won't exist
  // Still, if that ever happens, store null and keep this order hidden
  setFn(token)
}

const OrderRow: React.FC<Props> = props => {
  const { order, networkId, pending = false } = props

  // Fetching buy and sell tokens
  const [sellToken, setSellToken] = useState<TokenDetails | null>(null)
  const [buyToken, setBuyToken] = useState<TokenDetails | null>(null)

  useEffect(() => {
    console.log('will fetch tokens')
    fetchToken(order.buyTokenId, networkId, setBuyToken)
    fetchToken(order.sellTokenId, networkId, setSellToken)
  }, [networkId, order.buyTokenId, order.sellTokenId, setBuyToken, setSellToken])

  // TODO: move these memos into respective sub components
  const price = useMemo(() => {
    if (buyToken && 'decimals' in buyToken && sellToken && 'decimals' in sellToken) {
      return calculatePrice(
        formatAmountFull(order.priceNumerator, buyToken.decimals, false),
        formatAmountFull(order.priceDenominator, sellToken.decimals, false),
      )
    }
    return 'N/A'
  }, [buyToken, order.priceDenominator, order.priceNumerator, sellToken])

  const { unfilledAmount, accountBalance } = useMemo(() => {
    let unfilledAmount = 'N/A'
    let accountBalance = 'N/A'

    if (sellToken && 'decimals' in sellToken) {
      unfilledAmount = formatAmount(order.remainingAmount, sellToken.decimals) || '0'
      accountBalance = formatAmount(order.sellTokenBalance, sellToken.decimals) || '0'
    }

    return { unfilledAmount, accountBalance }
  }, [order.remainingAmount, order.sellTokenBalance, sellToken])

  const unlimitedAmount = useMemo(() => order.priceDenominator.gt(MIN_UNLIMITED_SELL_ORDER), [order.priceDenominator])

  const { isNeverExpires, expiresOn } = useMemo(() => {
    const isNeverExpires = isBatchIdFarInTheFuture(order.validUntil)
    const expiresOn = isNeverExpires ? '' : formatDateFromBatchId(order.validUntil)
    return { isNeverExpires, expiresOn }
  }, [order.validUntil])

  return (
    <>
      {sellToken && buyToken && (
        <OrderRowWrapper className={'orderRow' + (pending ? ' pending' : '')}>
          <PendingLink {...props} />
          <div className="checked">
            <input type="checkbox" />
          </div>
          <OrderDetails {...props} price={price} sellToken={sellToken} buyToken={buyToken} />
          <UnfilledAmount
            {...props}
            unfilledAmount={unfilledAmount}
            unlimited={unlimitedAmount}
            sellToken={sellToken}
          />
          <AccountBalance {...props} accountBalance={accountBalance} sellToken={sellToken} />
          <Expires {...props} isNeverExpires={isNeverExpires} expiresOn={expiresOn} />
        </OrderRowWrapper>
      )}
    </>
  )
}

export default OrderRow
