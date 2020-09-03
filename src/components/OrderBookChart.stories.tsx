import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import { Network, TokenDetails } from 'types'
import realData from 'storybook/USDC-DAI_OrderBook_sample.json'
import sampleDataSet from 'storybook/orderbookSamples'
import { processRawApiData } from './OrderBookWidget'
import { RawApiData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

const networkIds = Object.values(Network).filter(Number.isInteger)

export default {
  title: 'Components/OrderBookChart',
  component: OrderBookChart,
  argTypes: {
    networkId: { control: { type: 'inline-radio', options: networkIds } },
  },
  decorators: [
    (Story): JSX.Element => (
      <div style={{ height: '97vh' }}>
        <Story />
      </div>
    ),
  ],
} as Meta

const Template: Story<OrderBookChartProps> = (args) => <OrderBookChart {...args} />

const defaultNetworkId = Network.Mainnet
const tokenList: TokenDetails[] = CONFIG.initialTokenList.map(
  ({ id, name, symbol, addressByNetwork, decimals = 18 }) => ({
    id,
    name,
    symbol,
    address: addressByNetwork[defaultNetworkId] || '0x',
    decimals: decimals,
  }),
)

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

export const USDC_DAI = Template.bind({})
const DAI = tokenList.find((token) => token.symbol === 'DAI')
const USDC = tokenList.find((token) => token.symbol === 'USDC')
USDC_DAI.args = {
  ...defaultParams,
  baseToken: DAI || tokenList[0],
  quoteToken: USDC || tokenList[1],
  data: processRawApiData({ data: realData, baseToken: DAI || tokenList[0], quoteToken: USDC || tokenList[1] }),
}

interface NormalizedData extends RawApiData {
  name: string
  description?: string
}

interface ProduceOrderBookArgsParams {
  sampleData: typeof sampleDataSet[0]
  orderbookProps: Omit<OrderBookChartProps, 'data'>
}

const produceOrderBookArgs = ({ sampleData, orderbookProps }: ProduceOrderBookArgsParams): OrderBookChartProps => {
  const { baseToken, quoteToken } = orderbookProps

  const { name, description, asks = [], bids = [] } = sampleData
  const normalizedRawData: NormalizedData = {
    name,
    description,
    asks: asks.map(({ amount, price }) => ({
      volume: amount * 10 ** baseToken.decimals,
      price,
    })),
    bids: bids.map(({ amount, price }) => ({
      volume: amount * 10 ** quoteToken.decimals,
      price,
    })),
  }

  console.log('normalizedRawData', normalizedRawData)

  const processedData = {
    description,
    name,
    data: processRawApiData({ data: normalizedRawData, baseToken, quoteToken }),
  }

  console.log('processedData', processedData)

  return { ...orderbookProps, ...processedData }
}

const [
  liquidMarket,
  liquidMarketBigSpread,
  liquidMarketWhenPricesFall20,
  liquidMarketWhenPricesFall40,
  liquidMarketWhenPricesFall60,
  lowVolumeOverlap,
  highVolumeOverlap,
  lowVolumeOverlapWithBigPriceDifference,
  highVolumeOverlapWithBigPriceDifference,
  spreadIsAlmostNonExistent,
  bidsLiquidAsksIlliquid,
  asksLiquidBidsIlliquid,
  asksLiquidInTheEdgesBidsIlliquid,
  bidsLiquidInTheEdgesAsksIlliquid,
  noBids,
  noAsks,
  noBidsAndNoAsks,
] = sampleDataSet

export const LiquidMarket = Template.bind({})
LiquidMarket.args = produceOrderBookArgs({
  sampleData: liquidMarket,
  orderbookProps: defaultParams,
})
