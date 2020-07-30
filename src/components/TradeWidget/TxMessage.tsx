import React, { useMemo } from 'react'
import { formatTimeInHours } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink } from 'utils/display'
import { usePriceEstimationInOwl } from 'hooks/usePriceEstimation'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'

import alertIcon from 'assets/img/alert.svg'

interface TxMessageProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  networkId: number
}

const TxMessageWrapper = styled.div`
  padding: 1em;
`

const Warning = styled.p`
  background: beige;
  padding: 0.5em;
  box-shadow: inset 0 0 7px 3px #cc262647;
  border-radius: 0.3em;
  display: flex;

  .alert {
    min-width: 2.5em;
  }
`

const MIN_ECONOMICAL_VIABLE_FEE_IN_OWL = 1.2
const SUBSIDIZE_FACTOR = 10
const MIN_FEE = MIN_ECONOMICAL_VIABLE_FEE_IN_OWL / SUBSIDIZE_FACTOR
const SETTLEMENT_FACTOR = 1.5
const FEE_FACTOR = 1000
const MIN_TRADABLE_AMOUNT_IN_OWL = new BigNumber(MIN_FEE * FEE_FACTOR * SETTLEMENT_FACTOR)

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
}

const useLowVolumeAmount = ({ sellToken, sellTokenAmount, networkId }: LowVolumeParams): LowVolumeResult => {
  const { priceEstimation, isPriceLoading } = usePriceEstimationInOwl({
    tokenId: sellToken.id,
    tokenDecimals: sellToken.decimals,
    networkId,
  })

  return useMemo(() => {
    if (isPriceLoading || priceEstimation === null) return { isLoading: true }
    console.log('priceEstimation of', sellToken.symbol, 'in OWL', priceEstimation.toString(10))

    const minTradableAmountPerToken = MIN_TRADABLE_AMOUNT_IN_OWL.dividedBy(priceEstimation)
    const isLowVolume = minTradableAmountPerToken.isGreaterThan(sellTokenAmount)

    const difference = isLowVolume ? minTradableAmountPerToken.minus(sellTokenAmount) : ZERO_BIG_NUMBER

    console.log('{ isLowVolume, difference, minAmount }', {
      isLowVolume,
      difference: difference.toString(10),
      minAmount: minTradableAmountPerToken.toString(10),
    })
    return { isLowVolume, difference, isLoading: false, minAmount: minTradableAmountPerToken }
  }, [isPriceLoading, priceEstimation, sellToken.symbol, sellTokenAmount])
}

export const TxMessage: React.FC<TxMessageProps> = ({ sellToken, receiveToken, networkId }) => {
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

  const { isLoading, isLowVolume } = useLowVolumeAmount({ sellToken, networkId, sellTokenAmount })

  return (
    <TxMessageWrapper>
      <p>
        Your are selling {sellTokenAmount} {displaySellToken} for {displayReceiveToken}
      </p>
      <p>At a price of</p>
      <p>
        {priceInverse} {displaySellToken} per {displayReceiveToken}
      </p>
      <p>
        {price} {displayReceiveToken} per {displaySellToken}
      </p>
      <p>
        <strong>
          You will receive at least {receiveTokenAmount} {displayReceiveToken}
        </strong>
      </p>
      <p>
        Your order starts {formatTimeInHours(validFrom || 0, 'now')}{' '}
        {validUntil && `and will expire ${formatTimeInHours(validUntil, 'Never')}`}
      </p>
      {!isLoading && isLowVolume && (
        <Warning>
          <span>
            This is a small order. Please keep in mind that solvers might not include your order if it does not generate
            enough fee to pay their running costs. Learn more [here]
          </span>
          <img className="alert" src={alertIcon} />
        </Warning>
      )}
    </TxMessageWrapper>
  )
}
