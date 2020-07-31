import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'

import { dexPriceEstimatorApi } from 'api'

import { getNetworkFromId, safeTokenName, logDebug } from 'utils'

import useSafeState from 'hooks/useSafeState'

import OrderBookChart, { OrderBookChartProps, OrderBookError, PricePointDetails, Offer } from './OrderBookChart'
import { TokenDetails } from 'types'
import { formatSmart, logDebug } from 'utils'
import BigNumber from 'bignumber.js'
import { TEN_BIG_NUMBER, DEFAULT_PRECISION, ZERO_BIG_NUMBER, ORDERBOOK_DATA_FETCH_DEBOUNCE_TIME } from 'const'
import BN from 'bn.js'
import { useDebounce } from 'hooks/useDebounce'

import { Offer, PricePointDetails, ZoomValues } from 'components/OrderBookWidget/types'
import { calcInitialZoom, calcZoomY } from 'components/OrderBookWidget/zoomFunctions'
import { createChart, getZoomButtonContainer, setLabel } from 'components/OrderBookWidget/chartFunctions'
import { processData, _printOrderBook } from 'components/OrderBookWidget/dataProcessingFunctions'

const ZOOM_INCREMENT_PERCENTAGE = 0.25 // %

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  /* min-height: 40rem; */
  /* height: calc(100vh - 30rem); */
  min-height: calc(100vh - 30rem);
  text-align: center;
  width: 100%;
  height: 100%;
  min-width: 100%;

  .amcharts-Sprite-group {
    font-size: 1rem;
  }

  .amcharts-Container .amcharts-Label {
    text-transform: uppercase;
    font-size: 1.2rem;
  }

  .amcharts-ZoomOutButton-group > .amcharts-RoundedRectangle-group {
    fill: var(--color-text-active);
    opacity: 0.6;
    transition: 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  .amcharts-AxisLabel,
  .amcharts-CategoryAxis .amcharts-Label-group > .amcharts-Label,
  .amcharts-ValueAxis-group .amcharts-Label-group > .amcharts-Label {
    fill: var(--color-text-primary);
  }
`

interface ChartProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  networkId: number
  hops?: number
  batchId?: number
}

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
    if (!chart) {
      return
    }

    // Finding the container for zoom buttons
    const buttonContainer = getZoomButtonContainer(chart)

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
    }

    fetchApiData()

    return (): void => {
      cancelled = true
    }
  }, [baseToken, quoteToken, networkId, hops, debouncedBatchId, setApiData, setError])

  if (error) return <OrderBookError error={error} />

  return <OrderBookChart baseToken={baseToken} quoteToken={quoteToken} networkId={networkId} data={apiData} />
}

export default OrderBookWidget
