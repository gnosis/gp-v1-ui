import React, { useEffect, useMemo } from 'react'

import { dexPriceEstimatorApi } from 'api'
import { RawApiData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

import useSafeState from 'hooks/useSafeState'

import OrderBookChart, { OrderBookChartProps, Wrapper as OrderBookWrapper } from './OrderBookChart'

interface OrderBookProps extends Omit<OrderBookChartProps, 'data'> {
  hops?: number
}

const OrderBookWidget: React.FC<OrderBookProps> = (props) => {
  const { baseToken, quoteToken, networkId, hops } = props
  console.log('Widget props', props)
  const [apiData, setApiData] = useSafeState<RawApiData | null>(null)
  const [error, setError] = useSafeState<Error | null>(null)

  // sync resetting ApiData to avoid old data on new labels flash
  // and layout changes
  useMemo(() => {
    setApiData(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseToken, quoteToken, networkId, hops])

  useEffect(() => {
    const fetchApiData = async (): Promise<void> => {
      try {
        const rawData = await dexPriceEstimatorApi.getOrderBookData({
          baseTokenId: baseToken.id,
          quoteTokenId: quoteToken.id,
          hops,
          networkId,
        })
        console.log('ORDERBOOK RAW DATA', rawData)

        setApiData(rawData)
      } catch (error) {
        console.error('Error populating orderbook with data', error)
        setError(error)
      }
    }

    fetchApiData()
  }, [baseToken, quoteToken, networkId, hops, setApiData, setError])

  if (error) return <OrderBookWrapper>{error.message}</OrderBookWrapper>

  return <OrderBookChart baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} data={apiData} />
}

export default OrderBookWidget
