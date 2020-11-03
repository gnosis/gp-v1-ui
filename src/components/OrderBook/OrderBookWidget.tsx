import React, { useEffect, useMemo } from 'react'

import { dexPriceEstimatorApi } from 'api'

import useSafeState from 'hooks/useSafeState'

import OrderBookChart, { OrderBookChartProps, OrderBookError } from './OrderBookChart'
import { PricePointDetails } from './types'
import { ORDERBOOK_DATA_FETCH_DEBOUNCE_TIME } from 'const'
import { useDebounce } from 'hooks/useDebounce'
import { processRawApiData } from './dataProcessingFunctions'

export interface OrderBookProps extends Omit<OrderBookChartProps, 'data'> {
  hops?: number
  batchId?: number
}

const ORDER_BOOK_REFRESH_INTERVAL = 5000 // 5 sec

const OrderBookWidget: React.FC<OrderBookProps> = (props) => {
  const { baseToken, quoteToken, networkId, hops, batchId } = props
  const [apiData, setApiData] = useSafeState<PricePointDetails[] | null>(null)
  const [error, setError] = useSafeState<Error | null>(null)

  const { value: debouncedBatchId } = useDebounce(batchId, ORDERBOOK_DATA_FETCH_DEBOUNCE_TIME)

  // sync resetting ApiData to avoid old data on new labels flash
  // and layout changes
  useMemo(() => {
    setApiData(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseToken, quoteToken, networkId, hops, debouncedBatchId])

  useEffect(() => {
    // handle stale fetches resolving out of order
    let cancelled = false
    let timeoutId: NodeJS.Timeout | null = null

    const fetchApiData = async (): Promise<void> => {
      try {
        const rawData = await dexPriceEstimatorApi.getOrderBookData({
          baseTokenId: baseToken.id,
          quoteTokenId: quoteToken.id,
          hops,
          networkId,
          batchId: debouncedBatchId,
        })

        if (cancelled) return

        const processedData = processRawApiData({ data: rawData, baseToken, quoteToken })

        setApiData(processedData)
      } catch (error) {
        if (cancelled) return
        console.error('Error populating orderbook with data', error)
        setError(error)
      }
      timeoutId = setTimeout(fetchApiData, ORDER_BOOK_REFRESH_INTERVAL)
    }

    fetchApiData()

    return (): void => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [baseToken, quoteToken, networkId, hops, debouncedBatchId, setApiData, setError])

  if (error) return <OrderBookError error={error} />

  return <OrderBookChart baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} data={apiData} />
}

export default OrderBookWidget
