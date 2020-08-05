import React, { useMemo } from 'react'
import { formatTimeInHours, logDebug } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink } from 'utils/display'
import { usePriceEstimationInOwl, useWETHPriceInOwl } from 'hooks/usePriceEstimation'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'

import alertIcon from 'assets/img/alert.svg'
import { useGasPrice } from 'hooks/useGasPrice'
import { DEFAULT_GAS_PRICE, calcMinTradableAmountInOwl } from 'utils/minFee'

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

  const { priceEstimation: wethPriceInOwl, isPriceLoading: isWETHPriceLoading } = useWETHPriceInOwl(networkId)

  const gasPrice = useGasPrice({ defaultGasPrice: DEFAULT_GAS_PRICE, gasPriceLevel: 'fast' })

  return useMemo(() => {
    if (
      isPriceLoading ||
      isWETHPriceLoading ||
      priceEstimation === null ||
      wethPriceInOwl === null ||
      gasPrice === null
    )
      return { isLoading: true }
    logDebug('priceEstimation of', sellToken.symbol, 'in OWL', priceEstimation.toString(10))
    logDebug('WETH price in OWL', wethPriceInOwl.toString(10))

    const minTradableAmountInOwl = calcMinTradableAmountInOwl({ gasPrice, ethPriceInOwl: wethPriceInOwl })

    const minTradableAmountPerToken = minTradableAmountInOwl.dividedBy(priceEstimation)
    const isLowVolume = minTradableAmountPerToken.isGreaterThan(sellTokenAmount)

    const difference = isLowVolume ? minTradableAmountPerToken.minus(sellTokenAmount) : ZERO_BIG_NUMBER

    logDebug({
      isLowVolume,
      difference: difference.toString(10),
      minAmount: minTradableAmountPerToken.toString(10),
      gasPrice,
    })
    return { isLowVolume, difference, isLoading: false, minAmount: minTradableAmountPerToken }
  }, [isPriceLoading, priceEstimation, sellToken.symbol, sellTokenAmount, gasPrice, isWETHPriceLoading, wethPriceInOwl])
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
            This is a low volume order. Please keep in mind that solvers might not include your order if it does not
            generate enough fee to pay their running costs. Learn more [here]
          </span>
          <img className="alert" src={alertIcon} />
        </Warning>
      )}
    </TxMessageWrapper>
  )
}
