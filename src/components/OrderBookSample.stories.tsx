import React, { useMemo } from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, select, object, optionsKnob } from '@storybook/addon-knobs'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import { Network, TokenDetails } from 'types'
import sampleDataSet from 'storybook/orderbookSamples'
import { processRawApiData } from './OrderBookWidget'
import { OrderBookData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

type SampleData = typeof sampleDataSet[0]

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
const defaultBaseToken = {
  id: 1,
  name: 'Base Token',
  symbol: 'BASE',
  address: '0x1',
  decimals: 18,
}

const defaultQuoteToken = {
  id: 2,
  name: 'Quote Token',
  symbol: 'QUOTE',
  address: '0x2',
  decimals: 18,
}

// Token symbols to use in control selector
const tokenSymbols = [defaultBaseToken, defaultQuoteToken, ...tokenList].map((token) => token.symbol || token.address)

interface ProduceOrderBookArgsParams {
  sampleData: Pick<SampleData, 'asks' | 'bids'>
  orderbookProps: Omit<OrderBookChartProps, 'data'>
}
// normalizing sample data
// because real data is slightly more complex
const produceOrderBookProps = ({ sampleData, orderbookProps }: ProduceOrderBookArgsParams): OrderBookChartProps => {
  const { baseToken, quoteToken } = orderbookProps

  const { asks = [], bids = [] } = sampleData
  const normalizedRawData: OrderBookData = {
    asks: asks.map(({ volume, price }) => ({
      // turn small numbers into wei or decimal-aware units
      // otherwise get filtered as too small by src/components/OrderBookWidget.tsx#L77
      volume: volume * 10 ** baseToken.decimals,
      price,
    })),
    bids: bids.map(({ volume, price }) => ({
      volume: volume * 10 ** quoteToken.decimals,
      price,
    })),
  }

  const processedData = processRawApiData({ data: normalizedRawData, baseToken, quoteToken })

  return { ...orderbookProps, data: processedData }
}

type SampleProps = SampleData & {
  baseToken: string
  quoteToken: string
  networkId: number
}

// preprocessing template
// does what OrderBookWidget does for real data
const SampleTemplate: React.FC<SampleProps> = ({
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
      defaultBaseToken
    )
  }, [baseTokenSymbol])

  const quoteToken = useMemo(
    () =>
      tokenList.find((token) => token.symbol === quoteTokenSymbol || token.address === quoteTokenSymbol) ||
      defaultQuoteToken,
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
    <>
      <details style={{ lineHeight: 1.5 }}>
        <summary>{name}</summary>
        {description}
      </details>
      <OrderBookChart {...props} />
    </>
  )
}

/**
 * {
 *   Mainnet: "1",
 *   Ropsten: "3",
 *   Rinkeby: "4",
 *   Goerli: "5",
 *   Kovan: "42"
 * }
 */
const NetworkRadioOptions = Object.entries(Network).reduce<Record<string, string>>((acc, [key, val]) => {
  if (!Number.isInteger(val)) return acc

  // leaving as number causes radios to lose visible :checked state
  acc[key] = String(val)
  return acc
}, {})

const stories = storiesOf('OrderBook/Samples', module)
stories.addDecorator((Story) => <div style={{ height: '95vh' }}>{Story()}</div>)
stories.addDecorator(withKnobs)
stories.addParameters({
  component: SampleTemplate,
  docs: { disable: true }, // docs break render
})
sampleDataSet.forEach(({ name, description = '', asks = [], bids = [] }) => {
  stories.add(name, () => (
    <SampleTemplate
      name={name}
      description={description}
      asks={object('asks', asks)}
      bids={object('bids', bids)}
      baseToken={select('baseToken', tokenSymbols, tokenSymbols[0])}
      quoteToken={select('quoteToken', tokenSymbols, tokenSymbols[1])}
      networkId={+optionsKnob('networkId', NetworkRadioOptions, String(Network.Mainnet), { display: 'inline-radio' })}
    />
  ))
})
