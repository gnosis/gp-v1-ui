import React from 'react'
import styled from 'styled-components'
import { TokenDetails, safeTokenName } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { Frame } from 'components/common/Frame'
import { useForm } from 'react-hook-form'

const Wrapper = styled.div`
  max-width: 50rem;
`

export interface Props {
  sellToken?: TokenDetails
  receiveToken?: TokenDetails
  limitPrice: BigNumber | null
  isPriceInverted: boolean
  amount?: string
  onSwapPrices: () => void
  onSelectedPrice: (price: string) => void
  onSubmitLimitOrder: (data: LimitOrderFormData) => void
}

export interface LimitOrderFormData {
  // TODO: Add form data
  amount: string
}

export const LimitOrder: React.FC<Props> = (props: Props) => {
  const {
    sellToken,
    receiveToken,
    limitPrice,
    isPriceInverted,
    amount,
    onSwapPrices,
    onSelectedPrice,
    onSubmitLimitOrder,
  } = props

  const fillPriceFormatted = '51.15324'
  const bestAskPriceFormatted = '55.13246'

  const { handleSubmit, register } = useForm<LimitOrderFormData>({
    defaultValues: {
      amount: amount,
    },
  })
  const onSubmit = (data: LimitOrderFormData): void => {
    if (confirm('Please review your order: ' + JSON.stringify(data))) {
      onSubmitLimitOrder(data)
    }
  }

  return (
    <Wrapper>
      <form action="submit" onSubmit={handleSubmit(onSubmit)}>
        <Frame>
          <strong>SELL: </strong>: <input name="amount" ref={register} /> {sellToken ? safeTokenName(sellToken) : 'N/A'}
        </Frame>
        <Frame>
          <strong>RECEIVE: </strong>: -- {receiveToken ? safeTokenName(receiveToken) : 'N/A'}
        </Frame>
        <Frame>
          <strong>LIMIT PRICE{isPriceInverted ? ' (inverted)' : ''}</strong>:{' '}
          {limitPrice ? limitPrice.toFixed(4) : 'N/A'}
        </Frame>
        <Frame>
          <strong>PRICE SUGGESTION</strong>:
          <ul>
            <li>
              Fill Price: <a onClick={(): void => onSelectedPrice(fillPriceFormatted)}>{fillPriceFormatted}</a>
            </li>
            <li>
              Best Ask: <a onClick={(): void => onSelectedPrice(bestAskPriceFormatted)}>{bestAskPriceFormatted}</a>
            </li>
          </ul>
          <br />
          <a onClick={onSwapPrices}>Swap prices</a>
        </Frame>
        <Frame>
          <strong>EXPIRE SETTINGS</strong>: No yet
        </Frame>
        <input type="submit" value="SUBMIT LIMIT ORDER" />
      </form>
    </Wrapper>
  )
}

export default LimitOrder
