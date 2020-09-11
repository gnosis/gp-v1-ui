import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import USDCxDAIdata from 'storybook/USDC-DAI_OrderBook_sample.json'
import { processRawApiData } from './OrderBookWidget'
import {
  defaultNetworkId,
  defaultBaseToken,
  defaultQuoteToken,
  findTokenBySymbolOrAddress,
  networkMap,
} from 'storybook/tokenDefaults'

const defaultParams: Omit<OrderBookChartProps, 'data'> = {
  baseToken: defaultBaseToken,
  quoteToken: defaultQuoteToken,
  networkId: defaultNetworkId,
}

export default {
  title: 'OrderBook/Real Data',
  component: OrderBookChart,
  argTypes: {
    networkId: { control: { type: 'inline-radio', options: networkMap } },
    baseToken: { control: null },
    quoteToken: { control: null },
    data: { control: null },
  },
  decorators: [(Story): JSX.Element => <div style={{ height: '97vh' }}>{Story()}</div>],
} as Meta

// Template for real data
// fetched from price-estimation service
const RealTemplate: Story<OrderBookChartProps> = (args) => <OrderBookChart {...args} />

const DAI = findTokenBySymbolOrAddress('DAI', defaultBaseToken)
const USDC = findTokenBySymbolOrAddress('USDC', defaultQuoteToken)
export const USDC_DAI = RealTemplate.bind({})

USDC_DAI.args = {
  ...defaultParams,
  baseToken: DAI,
  quoteToken: USDC,
  data: processRawApiData({ data: USDCxDAIdata, baseToken: DAI, quoteToken: USDC }),
}
