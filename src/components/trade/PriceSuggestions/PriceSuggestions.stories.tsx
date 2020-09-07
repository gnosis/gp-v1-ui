import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { PriceSuggestions, Props } from './PriceSuggestions'
import { Frame } from 'components/common/Frame'
import BigNumber from 'bignumber.js'

export default {
  title: 'Trade/PriceSuggestions',
  components: PriceSuggestions,
} as Meta

const GNO = {
  id: 1,
  address: '0x1',
  symbol: 'GNO',
}
const DAI = {
  id: 2,
  address: '0x2',
  symbol: 'DAI',
}
const defaultProps = {
  baseToken: GNO,
  quoteToken: DAI,
  fillPrice: new BigNumber('55.13245672'),
  fillPriceLoading: false,
  bestAskPrice: new BigNumber('51.153236'),
  bestAskPriceLoading: false,
  isPriceInverted: false,
  amount: '100',
}

const Template: Story<Partial<Props>> = (props) => {
  const [isPriceInverted, setIsPriceInverted] = useState<boolean>(false)

  const methods = useForm()
  return (
    <Frame style={{ maxWidth: '50rem' }}>
      <FormProvider {...methods}>
        <form>
          <PriceSuggestions
            {...defaultProps}
            isPriceInverted={isPriceInverted}
            onSwapPrices={(): void => setIsPriceInverted(!isPriceInverted)}
            onClickPrice={(price, invertedPrice) => (): void =>
              console.log('Click price', price, invertedPrice, isPriceInverted)}
            {...props}
          />
        </form>
      </FormProvider>
    </Frame>
  )
}

export const Basic = Template.bind({})
Basic.args = {}

export const NoAmount = Template.bind({})
NoAmount.args = {
  amount: undefined,
}

export const NoAmountLoadingPrice = Template.bind({})
NoAmountLoadingPrice.args = {
  amount: undefined,
  bestAskPriceLoading: true,
}

export const LoadingBestAsk = Template.bind({})
LoadingBestAsk.args = {
  bestAskPriceLoading: true,
}

export const LoadingFillPrice = Template.bind({})
LoadingFillPrice.args = {
  fillPriceLoading: true,
}

export const NoPrice = Template.bind({})
NoPrice.args = {
  fillPrice: null,
  bestAskPrice: null,
}
