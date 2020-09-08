import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import { Network, TokenDetails } from 'types'
import realData from 'storybook/USDC-DAI_OrderBook_sample.json'
import { processRawApiData } from './OrderBookWidget'

const networkIds = Object.values(Network).filter(Number.isInteger)

const defaultNetworkId = Network.Mainnet
// All Default Tokens
const tokenList: TokenDetails[] = CONFIG.initialTokenList.map(
  ({ id, name, symbol, addressByNetwork, decimals = 18 }) => ({
    id,
    name,
    symbol,
    address: addressByNetwork[defaultNetworkId] || '0x',
    decimals: decimals,
  }),
)

// Default params to be used as initial values
// and when there's no Token found for symbol
const defaultParams: Omit<OrderBookChartProps, 'data'> = {
  baseToken: {
    id: 1,
    name: 'Base Token',
    symbol: 'BASE',
    address: '0x1',
    decimals: 18,
  },
  quoteToken: {
    id: 2,
    name: 'Quote Token',
    symbol: 'QUOTE',
    address: '0x2',
    decimals: 18,
  },
  networkId: defaultNetworkId,
}

// Token symbols to use in control selector
const tokenSymbols = [defaultParams.baseToken, defaultParams.quoteToken, ...tokenList].map(
  (token) => token.symbol || token.address,
)

export default {
  title: 'OrderBook/Real',
  component: OrderBookChart,
  argTypes: {
    networkId: { control: { type: 'inline-radio', options: networkIds } },
    baseToken: {
      control: { type: 'select', options: tokenSymbols },
    },
    quoteToken: {
      control: { type: 'select', options: tokenSymbols },
    },
    data: { control: null },
  },
  decorators: [(Story): JSX.Element => <div style={{ height: '97vh' }}>{Story()}</div>],
} as Meta

// Template for real data
// fetched from price-estimation service
const RealTemplate: Story<OrderBookChartProps> = (args) => <OrderBookChart {...args} />

const DAI = tokenList.find((token) => token.symbol === 'DAI')
const USDC = tokenList.find((token) => token.symbol === 'USDC')
export const USDC_DAI = RealTemplate.bind({})
USDC_DAI.args = {
  ...defaultParams,
  baseToken: DAI || tokenList[0],
  quoteToken: USDC || tokenList[1],
  data: processRawApiData({ data: realData, baseToken: DAI || tokenList[0], quoteToken: USDC || tokenList[1] }),
}
USDC_DAI.argTypes = {
  baseToken: { control: null },
  quoteToken: { control: null },
  data: { control: null },
}
