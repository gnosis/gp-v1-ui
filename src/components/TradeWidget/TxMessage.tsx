import React from 'react'
import { formatTimeInHours } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink } from 'utils/display'

interface TxMessageProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

const TxMessageWrapper = styled.div`
  padding: 1em;
`

export const TxMessage: React.FC<TxMessageProps> = ({ sellToken, receiveToken }) => {
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

  return (
    <TxMessageWrapper>
      <p>
        Your are selling {sellTokenAmount} {displaySellToken} for {displayReceiveToken}
      </p>
      <p>At a price of</p>
      <p>
        {price} {displaySellToken} per {displayReceiveToken}
      </p>
      <p>
        {priceInverse} {displayReceiveToken} per {displaySellToken}
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
    </TxMessageWrapper>
  )
}
