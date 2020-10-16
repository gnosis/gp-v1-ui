import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'

import { TokenDetails } from 'types'

import { logDebug, safeTokenName } from 'utils'
import useSafeState from 'hooks/useSafeState'

import { createChart, drawLabels, getZoomButtonContainer, setLabel } from './chartFunctions'
import { PricePointDetails, ZoomValues, Offer } from './types'
import { calcInitialZoom, calcZoomY } from './zoomFunctions'

const ZOOM_INCREMENT_PERCENTAGE = 0.25 // %

export interface OrderBookChartProps {
  /**
   * Base Token for Y-axis
   */
  baseToken: TokenDetails
  /**
   * Quote Token for X-axis
   */
  quoteToken: TokenDetails
  /**
   * current network id
   */
  networkId: number
  /**
   * price/volume data with asks and bids
   */
  data: PricePointDetails[] | null
}

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

  g {
    &.amcharts-Container.amcharts-Scrollbar.amcharts-XYChartScrollbar > g.amcharts-Sprite-group {
      fill: var(--color-background-pageWrapper);
    }
    &.amcharts-Sprite-group.amcharts-RoundedRectangle-group {
      fill-opacity: 0.3;
    }
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

interface OrderBookErrorProps {
  error: Error
}

export const OrderBookError: React.FC<OrderBookErrorProps> = ({ error }) => <Wrapper>{error.message}</Wrapper>

const OrderBookChart: React.FC<OrderBookChartProps> = (props) => {
  const { baseToken, quoteToken, networkId, data } = props
  const mountPoint = useRef<HTMLDivElement>(null)
  const chartRef = useRef<am4charts.XYChart | null>(null)

  const [initialZoom, setInitialZoom] = useSafeState<ZoomValues>({ startX: 0, endX: 1, endY: 1 })
  const [bids, setBids] = useSafeState<PricePointDetails[]>([])
  const [asks, setAsks] = useSafeState<PricePointDetails[]>([])

  useEffect(() => {
    if (!mountPoint.current) return
    const chart = createChart(mountPoint.current)
    chartRef.current = chart

    // dispose on mount only
    return (): void => chart.dispose()
  }, [])

  useEffect(() => {
    if (!chartRef.current || data === null) return

    if (data.length === 0) {
      chartRef.current.data = []
      return
    }

    // go on with the update when data is ready
    drawLabels({
      chart: chartRef.current,
      baseToken,
      quoteToken,
      networkId,
    })

    const asks: PricePointDetails[] = []
    const bids: PricePointDetails[] = []

    for (const pricePoint of data) {
      if (pricePoint.type === Offer.Bid) {
        bids.push(pricePoint)
      } else {
        asks.push(pricePoint)
      }
    }

    setAsks(asks)
    console.log('asks', asks)
    setBids(bids)
    console.log('bids', bids)

    const initialZoom = calcInitialZoom(bids, asks)
    console.log('initialZoom', initialZoom)

    const {
      xAxes: [xAxis],
      yAxes: [yAxis],
    } = chartRef.current

    // Setting initial zoom
    xAxis.start = initialZoom.startX
    xAxis.end = initialZoom.endX
    yAxis.end = initialZoom.endY
    // Storing calculated zoom values
    setInitialZoom(initialZoom)

    chartRef.current.data = data
  }, [baseToken, networkId, quoteToken, data, setInitialZoom, setAsks, setBids])

  // Creates zoom buttons once initialZoom has been calculated
  useEffect(() => {
    // return
    const chart = chartRef.current
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
    setLabel(seeAllButton.label, 'Full')
    seeAllButton.events.on('hit', () => {
      xAxis.start = 0
      xAxis.end = 1
      // to compensate for zoom buttons
      yAxis.end = 1.13
    })
  }, [initialZoom, bids, asks])

  return (
    <Wrapper ref={mountPoint}>
      Show order book for token {safeTokenName(baseToken)} ({baseToken.id}) and {safeTokenName(baseToken)} (
      {quoteToken.id})
    </Wrapper>
  )
}

export default OrderBookChart
