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
      <div className="intro-text">
        This is the final step before your order will be submitted to the blockchain. Please review the information
        below carefully to make sure everything looks correct.
      </div>
      <div>
        Sell Order: {sellTokenAmount} <strong>{displaySellToken}</strong> for <strong>{displayReceiveToken}</strong>
      </div>
      <div className="message">
        <b>Price direct:</b>
        <p>
          {priceInverse} <strong>{displaySellToken}</strong> per <strong>{displayReceiveToken}</strong>
        </p>
        <p>
          {price} {displayReceiveToken} per {displaySellToken}
        </p>
      </div>
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
