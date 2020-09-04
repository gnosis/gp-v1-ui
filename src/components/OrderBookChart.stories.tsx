import React, { useMemo } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import { Network, TokenDetails } from 'types'
import realData from 'storybook/USDC-DAI_OrderBook_sample.json'
import sampleDataSet from 'storybook/orderbookSamples'
import { processRawApiData } from './OrderBookWidget'
import { RawApiData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

type SampleData = typeof sampleDataSet[0]

const networkIds = Object.values(Network).filter(Number.isInteger)

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

const configTokenSymbols = [defaultParams.baseToken, defaultParams.quoteToken, ...tokenList].map(
  (token) => token.symbol || token.address,
)

export default {
  title: 'Components/OrderBookChart',
  component: OrderBookChart,
  argTypes: {
    networkId: { control: { type: 'inline-radio', options: networkIds } },
    baseToken: {
      control: { type: 'select', options: configTokenSymbols },
    },
    quoteToken: {
      control: { type: 'select', options: configTokenSymbols },
    },
    name: { control: null },
    description: { control: null },
    data: { control: null },
  },
  decorators: [(Story): JSX.Element => <div style={{ height: '97vh' }}>{Story()}</div>],
} as Meta

const Template: Story<OrderBookChartProps> = (args) => <OrderBookChart {...args} />

export const USDC_DAI = Template.bind({})
const DAI = tokenList.find((token) => token.symbol === 'DAI')
const USDC = tokenList.find((token) => token.symbol === 'USDC')
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

interface ProduceOrderBookArgsParams {
  sampleData: Pick<SampleData, 'asks' | 'bids'>
  orderbookProps: Omit<OrderBookChartProps, 'data'>
}

const produceOrderBookProps = ({ sampleData, orderbookProps }: ProduceOrderBookArgsParams): OrderBookChartProps => {
  const { baseToken, quoteToken } = orderbookProps

  const { asks = [], bids = [] } = sampleData
  const normalizedRawData: RawApiData = {
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

  const processedData = processRawApiData({ data: normalizedRawData, baseToken, quoteToken })

  console.log('processedData', processedData)

  return { ...orderbookProps, data: processedData }
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

type SampleProps = SampleData & {
  baseToken: string
  quoteToken: string
  networkId: number
}

const SampleTemplate: Story<SampleProps> = ({
  name,
  description,
  asks,
  bids,
  networkId,
  baseToken: baseTokenSymbol,
  quoteToken: quoteTokenSymbol,
}) => {
  const baseToken = useMemo(() => {
    return (
      tokenList.find((token) => token.symbol === baseTokenSymbol || token.address === baseTokenSymbol) ||
      defaultParams.baseToken
    )
  }, [baseTokenSymbol])

  const quoteToken = useMemo(
    () =>
      tokenList.find((token) => token.symbol === quoteTokenSymbol || token.address === quoteTokenSymbol) ||
      defaultParams.quoteToken,
    [quoteTokenSymbol],
  )

  const props = useMemo(
    () =>
      produceOrderBookProps({
        sampleData: { asks, bids },
        orderbookProps: {
          baseToken,
          quoteToken,
          networkId: networkId,
        },
      }),
    [networkId, baseToken, quoteToken, asks, bids],
  )

  return (
    <div style={{ height: '95%' }}>
      <details style={{ lineHeight: 1.5 }}>
        <summary>{name}</summary>
        {description}
      </details>
      <OrderBookChart {...props} />
    </div>
  )
}

const defaultSampleParams = {
  ...defaultParams,
  baseToken: 'BASE',
  quoteToken: 'QUOTE',
}

const buildSampleStory = (data: SampleData): Story<SampleProps> => {
  const Story = SampleTemplate.bind({})
  Story.args = {
    ...defaultSampleParams,
    ...data,
  }

  Story.storyName = data.name

  return Story
}

export const LiquidMarket = buildSampleStory(liquidMarket)

export const LiquidMarketBigSpread = buildSampleStory(liquidMarketBigSpread)

export const LiquidMarketWhenPricesFall20 = buildSampleStory(liquidMarketWhenPricesFall20)

export const LiquidMarketWhenPricesFall40 = buildSampleStory(liquidMarketWhenPricesFall40)

export const LiquidMarketWhenPricesFall60 = buildSampleStory(liquidMarketWhenPricesFall60)

export const LowVolumeOverlap = buildSampleStory(lowVolumeOverlap)

export const HighVolumeOverlap = buildSampleStory(highVolumeOverlap)

export const LowVolumeOverlapWithBigPriceDifference = buildSampleStory(lowVolumeOverlapWithBigPriceDifference)

export const HighVolumeOverlapWithBigPriceDifference = buildSampleStory(highVolumeOverlapWithBigPriceDifference)

export const SpreadIsAlmostNonExistent = buildSampleStory(spreadIsAlmostNonExistent)

export const BidsLiquidAsksIlliquid = buildSampleStory(bidsLiquidAsksIlliquid)

export const AsksLiquidBidsIlliquid = buildSampleStory(asksLiquidBidsIlliquid)

export const AsksLiquidInTheEdgesBidsIlliquid = buildSampleStory(asksLiquidInTheEdgesBidsIlliquid)

export const BidsLiquidInTheEdgesAsksIlliquid = buildSampleStory(bidsLiquidInTheEdgesAsksIlliquid)

export const NoBids = buildSampleStory(noBids)

export const NoAsks = buildSampleStory(noAsks)

export const NoBidsAndNoAsks = buildSampleStory(noBidsAndNoAsks)
