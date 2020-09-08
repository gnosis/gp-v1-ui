import React from 'react'
import styled from 'styled-components'
import { TokenDetails, safeTokenName, invertPrice } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { Frame } from 'components/common/Frame'
import { useForm } from 'react-hook-form'
import { PriceSuggestions } from '../PriceSuggestions'

const Wrapper = styled.div`
  max-width: 50rem;

  input[name='amount'] {
    width: 30em;
  }
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

function formatToken(token?: TokenDetails): string {
  return token ? safeTokenName(token) : 'N/A'
}

function formatPrice(price: BigNumber | null, isPriceInverted: boolean): string {
  if (price) {
    const limitPriceAdjusted = isPriceInverted ? invertPrice(price) : price
    return limitPriceAdjusted.toFixed(5)
  } else {
    return 'N/A'
  }
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
  // Mock data
  // TODO: Delete
  const fillPriceFormatted = '51.15324'
  const bestAskPriceFormatted = '55.13246'

  const sellTokenName = formatToken(sellToken)
  const receiveTokenName = formatToken(receiveToken)

  // // Select market, for now, the market is RECEIVE_TOKEN/SELL_TOKEN
  // // TODO: When merged with automatic quote selection, this logic must be adapted
  // // TODO: When we change the layout to a classical UI, we'll need to inject the baseToken/quoteToken/orderType as props
  // const [baseToken, quoteToken] = isPriceInverted ? [sellToken, receiveToken] : [receiveToken, sellToken]

  const { handleSubmit, register, watch } = useForm<LimitOrderFormData>({
    defaultValues: {
      amount: amount,
    },
  })
  const amountCurrent = watch('amount')
  const onSubmit = (data: LimitOrderFormData): void => {
    if (confirm('Please review your order: ' + JSON.stringify(data))) {
      onSubmitLimitOrder(data)
    }
  }

  return (
    <Wrapper>
      <form action="submit" onSubmit={handleSubmit(onSubmit)}>
        {/* Market: {formatToken(baseToken)}/{formatToken(quoteToken)} */}
        <Frame>
          <strong>SELL: </strong>: <input name="amount" ref={register} /> {sellTokenName}
        </Frame>
        <Frame>
          <strong>RECEIVE: </strong>: -- {receiveTokenName}
        </Frame>
        <Frame>
          <strong>LIMIT PRICE</strong>: {formatPrice(limitPrice, isPriceInverted)}
        </Frame>
        <Frame>
          {receiveToken && sellToken && (
            <PriceSuggestions
              // Market
              baseToken={receiveToken}
              quoteToken={sellToken}
              isPriceInverted={isPriceInverted}
              // Amount
              amount={amountCurrent}
              // Prices
              fillPrice={new BigNumber(fillPriceFormatted)}
              fillPriceLoading={false}
              bestAskPrice={new BigNumber(bestAskPriceFormatted)}
              bestAskPriceLoading={false}
              // Events
              // TODO: PriceSuggestions should send the price in quote tokens always, instead of sending both
              onClickPrice={(price, invertedPrice): void => onSelectedPrice(isPriceInverted ? invertedPrice : price)}
              onSwapPrices={onSwapPrices}
            />
          )}
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
