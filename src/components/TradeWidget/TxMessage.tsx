import React, { useMemo } from 'react'
import { logDebug, formatDateLocaleShortTime } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink, symbolOrAddress } from 'utils/display'

import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { EllipsisText } from 'components/common/EllipsisText'

import useSafeState from 'hooks/useSafeState'
import { SwapIcon } from './SwapIcon'
import { usePriceEstimationInOwl, useWETHPriceInOwl } from 'hooks/usePriceEstimation'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'

import alertIcon from 'assets/img/alert.svg'
import { useGasPrice } from 'hooks/useGasPrice'
import { DEFAULT_GAS_PRICE, ROUND_TO_NUMBER, calcMinTradableAmountInOwl, roundToNext } from 'utils/minFee'
import { parseAmount, formatAmount } from '@gnosis.pm/dex-js'

interface TxMessageProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  networkId: number
}

const TxMessageWrapper = styled.div`
  padding: 1em;

  > div.message {
    div.sectionTitle {
      margin-bottom: 0.2rem;
      &:not(:first-of-type) {
        margin-top: 1rem;
      }
    }

    div:not(.sectionTitle) {
      margin-left: 1rem;
    }
  }
  a.showMoreAnchor {
    color: rgb(33, 141, 255);
    font-size: 1.2rem;
    margin-left: 0.2rem;
  }
`
const ReceiveTooltip: React.FC<{ amount: string; buyToken: string | React.ReactNode; linkURL?: string }> = ({
  amount,
  linkURL = 'https://docs.gnosis.io/protocol/',
  buyToken,
}) => (
  <HelpTooltipContainer>
    You will receive at least {amount} {buyToken} if your order is completely executed. <br />
    ⚠️ Please remember that your order can be also partially executed, or not executed at all. <br />
    Read more about how Gnosis Protocol works{' '}
    <a target="_blank" rel="noreferrer" href={linkURL}>
      here
    </a>
    .
  </HelpTooltipContainer>
)

const OrderValidityTooltip: React.FC = () => (
  <HelpTooltipContainer>
    ⚠️ Learn more about the validity of orders in the Gnosis Protocol{' '}
    <a target="_blank" rel="noreferrer" href="https://docs.gnosis.io/protocol/docs/intro-batches/#orders">
      here
    </a>
    .
  </HelpTooltipContainer>
)

interface SimpleDisplayPriceProps extends Omit<TxMessageProps, 'networkId'> {
  price: string
  priceInverse: string
}

export const SimpleDisplayPrice: React.FC<SimpleDisplayPriceProps> = ({
  price,
  priceInverse,
  sellToken,
  receiveToken,
}) => {
  // true = direct
  // false = indirect
  const [showPrice, setShowPrice] = useSafeState(true)
  const swapPrices = (): void => setShowPrice((state) => !state)

  const displaySellToken = displayTokenSymbolOrLink(sellToken)
  const displayReceiveToken = displayTokenSymbolOrLink(receiveToken)
  const sellTokenTitle = symbolOrAddress(sellToken)
  const receiveTokenTitle = symbolOrAddress(receiveToken)

  return (
    <div>
      <span>{showPrice ? priceInverse : price}</span>{' '}
      <EllipsisText as="strong" title={showPrice ? sellTokenTitle : receiveTokenTitle}>
        {showPrice ? displaySellToken : displayReceiveToken}
      </EllipsisText>
      <small> per </small>
      <EllipsisText as="strong" title={showPrice ? receiveTokenTitle : sellTokenTitle}>
        {showPrice ? displayReceiveToken : displaySellToken}
      </EllipsisText>
      <SwapIcon swap={swapPrices} />
    </div>
  )
}

const Warning = styled.div`
  position: relative;
  display: flex;
  background: var(--color-background-deleteOrders);
  margin: 1rem;
  padding: 1rem;
  border-radius: 0.3em;

  a {
    color: var(--color-text-active);
  }

  > div {
    width: 94%;
  }

  .alert {
    width: 5.2%;
    opacity: 0.4;
    align-self: center;
  }
`

interface LowVolumeParams {
  sellToken: TokenDetails
  networkId: number
  sellTokenAmount: string
}

interface LowVolumeResult {
  isLoading: boolean
  isLowVolume?: boolean
  difference?: BigNumber
  minAmount?: BigNumber
  roundedUpAmount?: BigNumber
  roundedUpTo?: number
  roundedUpAmountInOwl?: BigNumber
}

const useLowVolumeAmount = ({ sellToken, sellTokenAmount, networkId }: LowVolumeParams): LowVolumeResult => {
  const { priceEstimation, isPriceLoading } = usePriceEstimationInOwl({
    tokenId: sellToken.id,
    tokenDecimals: sellToken.decimals,
    networkId,
  })

  const { priceEstimation: wethPriceInOwl, isPriceLoading: isWETHPriceLoading } = useWETHPriceInOwl(networkId)

  const gasPrice = useGasPrice({ defaultGasPrice: DEFAULT_GAS_PRICE, gasPriceLevel: 'fast' })

  return useMemo(() => {
    if (priceEstimation !== null && priceEstimation.isZero()) {
      // no price data for token
      logDebug('No priceEstimation data for', sellToken.symbol, 'in OWL')

      return { isLoading: false, isLowVolume: false }
    }

    if (
      isPriceLoading ||
      isWETHPriceLoading ||
      priceEstimation === null ||
      wethPriceInOwl === null ||
      gasPrice === null
    ) {
      return { isLoading: true }
    }

    logDebug('priceEstimation of', sellToken.symbol, 'in OWL', priceEstimation.toString(10))
    logDebug('WETH price in OWL', wethPriceInOwl.toString(10))

    const minTradableAmountInOwl = calcMinTradableAmountInOwl({ gasPrice, ethPriceInOwl: wethPriceInOwl })

    const minTradableAmountInOwlRoundedUp = roundToNext(minTradableAmountInOwl)

    const minTradableAmountPerToken = minTradableAmountInOwl.dividedBy(priceEstimation)
    const isLowVolume = minTradableAmountPerToken.isGreaterThan(sellTokenAmount)

    const roundedUpAmount = minTradableAmountInOwlRoundedUp.dividedBy(priceEstimation)

    const difference = isLowVolume ? minTradableAmountPerToken.minus(sellTokenAmount) : ZERO_BIG_NUMBER

    logDebug({
      isLowVolume,
      difference: difference.toString(10),
      minAmount: minTradableAmountPerToken.toString(10),
      gasPrice,
      roundedUpAmount: roundedUpAmount.toString(10),
      roundedUpAmountInOwl: minTradableAmountInOwlRoundedUp.toString(10),
    })
    return {
      isLowVolume,
      difference,
      isLoading: false,
      minAmount: minTradableAmountPerToken,
      roundedUpAmount: roundedUpAmount,
      roundedUpTo: ROUND_TO_NUMBER,
      roundedUpAmountInOwl: minTradableAmountInOwlRoundedUp,
    }
  }, [isPriceLoading, priceEstimation, sellToken.symbol, sellTokenAmount, gasPrice, isWETHPriceLoading, wethPriceInOwl])
}

export const TxMessage: React.FC<TxMessageProps> = ({ sellToken, receiveToken, networkId }) => {
  const [orderHelpVisible, showOrderHelp] = useSafeState(false)
  const { getValues } = useFormContext<TradeFormData>()
  const {
    price,
    priceInverse,
    validFrom,
    validUntil,
    sellToken: sellTokenAmount,
    receiveToken: receiveTokenAmount,
  } = getValues()
  const displaySellToken = displayTokenSymbolOrLink(sellToken)
  const displayReceiveToken = displayTokenSymbolOrLink(receiveToken)

  const {
    isLoading,
    isLowVolume,
    roundedUpAmount: recommendedAmount,
    roundedUpAmountInOwl: roundedAmountInUSD,
  } = useLowVolumeAmount({
    sellToken,
    networkId,
    sellTokenAmount,
  })

  const { formattedAmount = '', amountInUSD = '' } = useMemo<{ formattedAmount?: string; amountInUSD?: string }>(() => {
    if (!recommendedAmount || !roundedAmountInUSD) return {}

    const parsedAmount = parseAmount(recommendedAmount.toString(10), sellToken.decimals)
    const parseAmountInUSD = parseAmount(roundedAmountInUSD.toString(10), 1)

    if (!parsedAmount || !parseAmountInUSD) return {}

    const amountFull = formatAmount({ amount: parsedAmount, precision: sellToken.decimals, decimals: 2 })
    const amountInUSD = formatAmount({ amount: parseAmountInUSD, precision: 1 })

    return { formattedAmount: amountFull, amountInUSD }
  }, [recommendedAmount, roundedAmountInUSD, sellToken.decimals])

  return (
    <TxMessageWrapper>
      <div className="intro-text">
        <div>Carefully review the information below to make sure everything looks correct.</div>
      </div>
      <div>
        How is the order executed?
        <a className="showMoreAnchor" onClick={(): void => showOrderHelp(!orderHelpVisible)}>
          {orderHelpVisible ? '[-] Show less...' : '[+] Show more...'}
        </a>
        {orderHelpVisible && (
          <>
            <ul>
              <li>
                After confirming and sending the transaction, your order will be active during the specified validity
                time.
              </li>
              <li>
                During that time, it will be matched against other orders as long as there is an overlap in the limit
                prices.
              </li>
              <li>
                The limit price specified in this order will be respected, and{' '}
                <strong>no fee will be applied on top of it</strong>.
              </li>
              <li>You can cancel the order at any point after its creation.</li>
            </ul>
            <p>
              Check{' '}
              <a href="https://docs.gnosis.io/protocol/" target="_blank" rel="noreferrer">
                here
              </a>{' '}
              for more information on Gnosis Protocol.
            </p>
          </>
        )}
      </div>
      <div className="message">
        {/* Details */}
        <div className="sectionTitle">
          <strong>Order Details</strong>
        </div>
        <div>
          Sell: <span>{sellTokenAmount}</span> <strong>{displaySellToken}</strong>
        </div>
        <div>
          Receive: {receiveTokenAmount} <strong>{displayReceiveToken}</strong>{' '}
          <HelpTooltip tooltip={<ReceiveTooltip amount={receiveTokenAmount} buyToken={displayReceiveToken} />} />
        </div>

        {/* Prices */}

        <div className="sectionTitle">
          <strong>Prices</strong>
        </div>
        <SimpleDisplayPrice
          receiveToken={receiveToken}
          sellToken={sellToken}
          price={price}
          priceInverse={priceInverse}
        />

        {/* Order Validity */}

        <div className="sectionTitle">
          <strong>Order Validity Details</strong> <HelpTooltip tooltip={<OrderValidityTooltip />} />
        </div>
        <div>
          Starts: <span>{validFrom ? formatDateLocaleShortTime(+validFrom) : 'Now'}</span>
        </div>
        <div>
          Expires: <span>{validUntil ? formatDateLocaleShortTime(+validUntil) : 'Never'}</span>
        </div>
      </div>
      {!isLoading && isLowVolume && (
        <Warning>
          <div>
            <p>
              This is a low volume order. We recommend selling at least{' '}
              <strong>
                {formattedAmount} {symbolOrAddress(sellToken)}
              </strong>{' '}
              (approximately <strong>${amountInUSD}</strong>) of the token.
            </p>
            <p>
              Please keep in mind that solvers may not include your order if it does not generate enough fees to pay
              their running costs. Learn more{' '}
              <a
                href="https://docs.gnosis.io/protocol/docs/introduction1/#minimum-order"
                rel="noopener noreferrer"
                target="_blank"
              >
                here
              </a>
              .
            </p>
          </div>
          <img className="alert" src={alertIcon} />
        </Warning>
      )}
    </TxMessageWrapper>
  )
}
