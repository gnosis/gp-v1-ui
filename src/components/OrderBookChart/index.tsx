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

import { Offer, PricePointDetails, ZoomValues } from 'components/OrderBookChart/types'
import { calcInitialZoom, calcZoomY } from 'components/OrderBookChart/zoomFunctions'
import { createChart, getZoomButtonContainer, setLabel } from 'components/OrderBookChart/chartFunctions'
import { processData, _printOrderBook } from 'components/OrderBookChart/dataProcessingFunctions'

const ZOOM_INCREMENT_PERCENTAGE = 0.25 // %

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
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

  g {
    &.amcharts-Container.amcharts-Scrollbar.amcharts-XYChartScrollbar > g.amcharts-Sprite-group {
      fill: var(--color-background-pageWrapper);
    }
    &.amcharts-Sprite-group.amcharts-RoundedRectangle-group {
      fill-opacity: 0.3;
    }

    // &[role='scrollbar'] tspan {
    //   font-weight: bold;
    // }
  }

  path.amcharts-RoundedRectangle {
    fill: var(--color-background-input);
  }

  .amcharts-XYChart,
  .amcharts-Button,
  .amcharts-AxisLabel-group,
  .amcharts-Axis,
  .amcharts-ValueAxis,
  .amcharts-AxisTitles {
    fill-opacity: 0.8;
    tspan {
      fill: var(--color-text-primary);
    }
  }

  .amcharts-Button-group {
    cursor: pointer;

    tspan {
      font-weight: 800;
    }
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

  const mountPoint = useRef<HTMLDivElement>(null)

  // Creates chart instance upon load
  useEffect(() => {
    if (!mountPoint.current) {
      return
    }

    const _chart = createChart(mountPoint.current)

    setChart(_chart)

    return (): void => _chart.dispose()
    // We'll create only one instance as long as the component is not unmounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseToken, quoteToken, networkId, hops, debouncedBatchId])

  // Reloads data on token/network change
  // Sets chart configs that depend on token
  // Does the initial zoom calculation
  useEffect(() => {
    if (!chart || isPriceLoading) {
      return
    }

    const baseTokenLabel = safeTokenName(baseToken)
    const quoteTokenLabel = safeTokenName(quoteToken)

    const networkDescription = networkId !== Network.Mainnet ? `${getNetworkFromId(networkId)} ` : ''

    // Axes config
    const xAxis = chart.xAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>
    xAxis.title.text = `${networkDescription} Price (${baseTokenLabel}/${quoteTokenLabel})`

    const yAxis = chart.yAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>
    yAxis.title.text = `Volume (${baseTokenLabel})`
    xAxis.title.userClassName = yAxis.title.userClassName = 'amcharts-AxisTitles'

    // Tool tip
    const market = baseTokenLabel + '/' + quoteTokenLabel

    const [bidSeries, askSeries] = chart.series.values
    bidSeries.tooltipText = `[bold]${market}[/]\nBid Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`
    askSeries.tooltipText = `[bold]${market}[/]\nAsk Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`

    // Update data source according to network/base token/quote token
    chart.dataSource.url = dexPriceEstimatorApi.getOrderBookUrl({
      baseTokenId: baseToken.id,
      quoteTokenId: quoteToken.id,
      hops,
      networkId,
    })

    // Removing any previous event handler
    chart.dataSource.adapter.remove('parsedData')

    // Adding new event handler
    chart.dataSource.adapter.add('parsedData', data => {
      try {
        const bids = processData(data.bids, baseToken, quoteToken, Offer.Bid, oneOwlInQuoteToken)
        const asks = processData(data.asks, baseToken, quoteToken, Offer.Ask, oneOwlInQuoteToken)
        const pricePoints = bids.concat(asks)

        // Store bids and asks for later Y zoom calculation
        setBids(bids)
        setAsks(asks)

        const initialZoom = calcInitialZoom(bids, asks)

        // Setting initial zoom
        xAxis.start = initialZoom.startX
        xAxis.end = initialZoom.endX
        yAxis.end = initialZoom.endY
        // Storing calculated zoom values
        setInitialZoom(initialZoom)

        _printOrderBook(pricePoints, baseToken, quoteToken)

        return pricePoints
      } catch (error) {
        console.error('Error processing data', error)
        return []
      }
    })

    // Trigger data load re-using same chart
    chart.dataSource.load()
  }, [
    baseToken,
    chart,
    hops,
    networkId,
    quoteToken,
    oneOwlInQuoteToken,
    isPriceLoading,
    setInitialZoom,
    setBids,
    setAsks,
  ])

  // Creates zoom buttons once initialZoom has been calculated
  useEffect(() => {
    if (!chart) {
      return
    }

    // Finding the container for zoom buttons
    const buttonContainer = getZoomButtonContainer(chart)

    // Data not loaded yet, there's no container
    if (!buttonContainer) {
      return
    }
    buttonContainer.disposeChildren()

        if (cancelled) return

        const processedData = processRawApiData({ data: rawData, baseToken, quoteToken })

        setApiData(processedData)
      } catch (error) {
        if (cancelled) return
        console.error('Error populating orderbook with data', error)
        setError(error)
      }
      const diff = xAxis.end - xAxis.start
      const delta = diff * ZOOM_INCREMENT_PERCENTAGE
      xAxis.start = Math.max(xAxis.start - delta, 0)
      xAxis.end = Math.min(xAxis.end + delta, 1)

      yAxis.end = calcZoomY(bids, asks, xAxis.min, xAxis.max, xAxis.start, xAxis.end, yAxis.max)
      logDebug(`[Order Book] New zoom boundaries X: ${xAxis.start * 100}% - ${xAxis.end * 100}%; Y ${yAxis.end * 100}%`)
    })

    const resetZoomButton = buttonContainer.createChild(am4core.Button)
    setLabel(resetZoomButton.label, 'Reset')
    resetZoomButton.events.on('hit', () => {
      xAxis.start = initialZoom.startX
      xAxis.end = initialZoom.endX
      yAxis.end = initialZoom.endY
      logDebug(`[Order Book] New zoom boundaries X: ${xAxis.start * 100}% - ${xAxis.end * 100}%; Y ${yAxis.end * 100}%`)
    })

    const seeAllButton = buttonContainer.createChild(am4core.Button)
    setLabel(seeAllButton.label, 'full')
    seeAllButton.events.on('hit', () => {
      xAxis.start = 0
      xAxis.end = 1
      // to compensate for zoom buttons
      yAxis.end = 1.13
    })
  }, [chart, initialZoom, bids, asks])

  return <Wrapper ref={mountPoint} />
}

export default OrderBookWidget
