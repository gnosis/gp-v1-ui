import React, { useEffect } from 'react'

import { dexPriceEstimatorApi } from 'api'
import { RawApiData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

import useSafeState from 'hooks/useSafeState'

import OrderBookChart, { OrderBookChartProps } from './OrderBookChart'

interface OrderBookProps extends Omit<OrderBookChartProps, 'data'> {
  hops?: number
}

const OrderBookWidget: React.FC<OrderBookProps> = (props) => {
  const { baseToken, quoteToken, networkId, hops } = props
  const [apiData, setApiData] = useSafeState<RawApiData | null>(null)

  useEffect(() => {
    const fetchApiData = async (): Promise<void> => {
      setApiData(null)
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
      }
    }

    fetchApiData()
  }, [baseToken, quoteToken, networkId, hops, setApiData])

  return <OrderBookChart baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} data={apiData} />
}

export default OrderBookWidget
