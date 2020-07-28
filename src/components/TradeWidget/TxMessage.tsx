import React from 'react'
import { formatTimeInHours } from 'utils'
import { useFormContext } from 'react-hook-form'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { TradeFormData } from '.'
import { displayTokenSymbolOrLink } from 'utils/display'
import { UnderlinedText } from 'components/PoolingWidget/CreateStrategy.styled'

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
        <div>Carefully review the information below to make sure everything looks correct.</div>
      </div>
      <div className="message">
        {/* Details */}
        <div>
          <strong>Order Details</strong>
        </div>
        <div>
          Sell: <span>{sellTokenAmount}</span> <strong>{displaySellToken}</strong> for{' '}
          <strong>{displayReceiveToken}</strong>
        </div>
        <div>
          Receive: <UnderlinedText>at least</UnderlinedText> {receiveTokenAmount} <strong>{displayReceiveToken}</strong>
        </div>

        {/* Prices */}
        <p>
          <div>
            <strong>Prices</strong>
          </div>
          <div>
            Direct: <span>{priceInverse}</span> <strong>{displaySellToken}</strong> per{' '}
            <strong>{displayReceiveToken}</strong>
          </div>
          <div>
            Inverse: <span>{price}</span> <strong>{displayReceiveToken}</strong> per <strong>{displaySellToken}</strong>
          </div>
        </p>

        {/* Order Validity */}
        <p>
          <div>
            <strong>Order Validity Details</strong>
          </div>
          <div>
            Starts: <span>{formatTimeInHours(validFrom || 0, 'Now')}</span>
          </div>
          <div>
            Expires: <span>{formatTimeInHours(validUntil || 0, 'Never')}</span>
          </div>
        </p>
      </div>
    </TxMessageWrapper>
  )
}
