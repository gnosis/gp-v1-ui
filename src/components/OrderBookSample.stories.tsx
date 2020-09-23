import React, { useMemo } from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, select, object, optionsKnob } from '@storybook/addon-knobs'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'
import { Network } from 'types'
import sampleDataSet from 'storybook/orderbookSamples'
import { processRawApiData } from './OrderBookWidget'
import { OrderBookData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'
import {
  baseTokenDefault,
  quoteTokenDefault,
  tokenConfigSymbolsWithDefaults,
  defaultNetworkId,
  findTokenConfig,
} from 'storybook/data'

type SampleData = typeof sampleDataSet[0]

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
  baseToken: baseTokenSymbolOrAddress,
  quoteToken: quoteTokenSymbolOrAddress,
}) => {
  const baseToken = useMemo(() => findTokenConfig(baseTokenSymbolOrAddress, baseTokenDefault), [
    baseTokenSymbolOrAddress,
  ])

  const quoteToken = useMemo(() => findTokenConfig(quoteTokenSymbolOrAddress, quoteTokenDefault), [
    quoteTokenSymbolOrAddress,
  ])

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

const stories = storiesOf('OrderBook/Sample Data', module)
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
      baseToken={select('baseToken', tokenConfigSymbolsWithDefaults, tokenConfigSymbolsWithDefaults[0])}
      quoteToken={select('quoteToken', tokenConfigSymbolsWithDefaults, tokenConfigSymbolsWithDefaults[1])}
      networkId={+optionsKnob('networkId', NetworkRadioOptions, String(defaultNetworkId), { display: 'inline-radio' })}
    />
  ))
})
