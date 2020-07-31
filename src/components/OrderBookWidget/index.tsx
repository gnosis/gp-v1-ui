import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'

import { dexPriceEstimatorApi } from 'api'

import { getNetworkFromId, safeTokenName, logDebug } from 'utils'

import useSafeState from 'hooks/useSafeState'
import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

import { TokenDetails, Network } from 'types'

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
}

export const Chart: React.FC<ChartProps> = props => {
  const { baseToken, quoteToken, networkId, hops } = props
  const [chart, setChart] = useSafeState<null | am4charts.XYChart>(null)
  const [initialZoom, setInitialZoom] = useSafeState<ZoomValues>({ startX: 0, endX: 1, endY: 1 })
  const [bids, setBids] = useSafeState<PricePointDetails[]>([])
  const [asks, setAsks] = useSafeState<PricePointDetails[]>([])

  // Get the price of 1 OWL in quote token
  const { priceEstimation: oneOwlInQuoteToken, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: '0', // no amount means 1 unit === 1 OWL
    baseTokenId: 0, // OWL
    quoteTokenId: quoteToken.id,
    quoteTokenDecimals: quoteToken.decimals,
  })

  const mountPoint = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountPoint.current) {
      return
    }

    const _chart = createChart(mountPoint.current)

    setChart(_chart)

    return (): void => _chart.dispose()
    // We'll create only one instance as long as the component is not unmounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!chart) {
      return
    }

    // Finding the container for zoom buttons
    const buttonContainer = getZoomButtonContainer(chart)

    // Data not loaded yet, there's no button
    if (!buttonContainer) {
      return
    }
    buttonContainer.disposeChildren()

    const xAxis = chart.xAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>
    const yAxis = chart.yAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>

    // When any of these is not set, there's no data in the chart, thus we don't need to adjust the zoom
    if (!xAxis || xAxis.min === undefined || xAxis.max === undefined || !yAxis || yAxis.max === undefined) {
      return
    }

    const zoomInButton = buttonContainer.createChild(am4core.Button)
    setLabel(zoomInButton.label, '+')
    zoomInButton.events.on('hit', () => {
      // Even though there's a check in the parent context, TS won't shut up unless I put this up
      if (xAxis.min === undefined || xAxis.max === undefined || yAxis.max === undefined) {
        return
      }
      const diff = xAxis.end - xAxis.start
      const delta = diff * ZOOM_INCREMENT_PERCENTAGE
      xAxis.start += delta
      xAxis.end -= delta

      const endY = calcZoomY(bids, asks, xAxis.min, xAxis.max, xAxis.start, xAxis.end, yAxis.max)
      logDebug(`[Order Book] New zoom boundaries X: ${xAxis.start * 100}% - ${xAxis.end * 100}%; Y ${endY * 100}%`)
      yAxis.end = endY
    })

    const zoomOutButton = buttonContainer.createChild(am4core.Button)
    setLabel(zoomOutButton.label, '-')
    zoomOutButton.events.on('hit', () => {
      if (xAxis.min === undefined || xAxis.max === undefined || yAxis.max === undefined) {
        return
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
      yAxis.end = 1
    })
  }, [chart, initialZoom, bids, asks])

  useEffect(() => {
    if (!chart || isPriceLoading) {
      return
    }

    const baseTokenLabel = safeTokenName(baseToken)
    const quoteTokenLabel = safeTokenName(quoteToken)

    const networkDescription = networkId !== Network.Mainnet ? `${getNetworkFromId(networkId)} ` : ''

    // Axes configs
    const xAxis = chart.xAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>
    xAxis.title.text = `${networkDescription} Price (${quoteTokenLabel})`

    const yAxis = chart.yAxes.values[0] as am4charts.ValueAxis<am4charts.AxisRenderer>
    yAxis.title.text = baseTokenLabel

    // Add data
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

    // Reload data from data source re-using same chart
    chart.dataSource.load()

    const market = baseTokenLabel + '-' + quoteTokenLabel

    // Setting up tooltips based on currently loaded tokens
    const [bidSeries, askSeries] = chart.series.values
    bidSeries.tooltipText = `[bold]${market}[/]\nBid Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`
    askSeries.tooltipText = `[bold]${market}[/]\nAsk Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`
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

  return <Wrapper ref={mountPoint} />
}
