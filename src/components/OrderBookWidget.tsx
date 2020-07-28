import React, { useEffect, useRef } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themesSpiritedaway from '@amcharts/amcharts4/themes/spiritedaway'

import { dexPriceEstimatorApi } from 'api'

import { getNetworkFromId, safeTokenName, formatSmart, logDebug } from 'utils'

import { TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { TokenDetails, Network } from 'types'
import BN from 'bn.js'
import { DEFAULT_PRECISION } from '@gnosis.pm/dex-js'
import useSafeState from 'hooks/useSafeState'

const SMALL_VOLUME_THRESHOLD = 0.01

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

enum Offer {
  Bid,
  Ask,
}

/**
 * Price point as defined in the API
 * Both price and volume are numbers (floats)
 *
 * The price and volume are expressed in atoms
 */
interface RawPricePoint {
  price: number
  volume: number
}

/**
 * Normalized price point
 * Both price and volume are BigNumbers (decimal)
 *
 * The price and volume are expressed in atoms
 */
interface PricePoint {
  price: BigNumber
  volume: BigNumber
}

/**
 * Price point data represented in the graph. Contains BigNumbers for operate with less errors and more precission
 * but for representation uses number as expected by the library
 */
interface PricePointDetails {
  // Basic data
  type: Offer
  volume: BigNumber // volume for the price point
  totalVolume: BigNumber // cumulative volume
  price: BigNumber

  // Data for representation
  priceNumber: number
  priceFormatted: string
  totalVolumeNumber: number
  totalVolumeFormatted: string
  askValueY: number | null
  bidValueY: number | null
}

function _toPricePoint(pricePoint: RawPricePoint, quoteTokenDecimals: number, baseTokenDecimals: number): PricePoint {
  return {
    price: new BigNumber(pricePoint.price).div(TEN_BIG_NUMBER.pow(quoteTokenDecimals - baseTokenDecimals)),
    volume: new BigNumber(pricePoint.volume).div(TEN_BIG_NUMBER.pow(baseTokenDecimals)),
  }
}

function _formatSmartBigNumber(amount: BigNumber): string {
  return formatSmart({
    amount: new BN(
      amount
        .times(TEN_BIG_NUMBER.pow(new BigNumber(DEFAULT_PRECISION)))
        // we don't want any decimals
        // before passing into BN conversion
        .decimalPlaces(0)
        .toString(10),
    ),
    precision: DEFAULT_PRECISION,
    decimals: 6,
    smallLimit: '0',
  })
}

/**
 * This method turns the raw data that the backend returns into data that can be displayed by the chart.
 * This involves aggregating the total volume and accounting for decimals
 */
const processData = (
  rawPricePoints: RawPricePoint[],
  baseToken: TokenDetails,
  quoteToken: TokenDetails,
  type: Offer,
): PricePointDetails[] => {
  const isBid = type == Offer.Bid
  const quoteTokenDecimals = quoteToken.decimals
  const baseTokenDecimals = baseToken.decimals

  // Convert RawPricePoint into PricePoint:
  //  Raw items use number (floats) and are given in "atoms"
  //  Normalized items use decimals (BigNumber) and are given in natural units
  let pricePoints: PricePoint[] = rawPricePoints.map(pricePoint =>
    _toPricePoint(pricePoint, quoteTokenDecimals, baseTokenDecimals),
  )

  // Filter tiny orders
  pricePoints = pricePoints
    .filter(pricePoint => pricePoint.volume.gt(SMALL_VOLUME_THRESHOLD))
    // sort by price according to type
    // bid orders must be inverted to calculate the descending total volume
    .sort(({ price: a }, { price: b }) => (isBid ? b.comparedTo(a) : a.comparedTo(b)))

  // Convert the price points that can be represented in the graph (PricePointDetails)
  const { points } = pricePoints.reduce(
    (acc, pricePoint, index) => {
      const { price, volume } = pricePoint
      const totalVolume = acc.totalVolume.plus(volume)

      // Amcharts draws step lines so that the x value is centered (Default). To correctly display the order book, we want
      // the x value to be at the left side of the step for asks and at the right side of the step for bids.
      //
      //    Default            Bids          Asks
      //            |      |                        |
      //   ---------       ---------       ---------
      //  |                         |      |
      //       x                    x      x
      //
      // For asks, we can offset the "startLocation" by 0.5. However, Amcharts does not support a "startLocation" of -0.5.
      // For bids, we therefore offset the curve by -1 (expose the previous total volume) and use an offset of 0.5.
      // Otherwise our steps would be off by one.
      let askValueY, bidValueY
      if (isBid) {
        const previousPricePoint = acc.points[index - 1]
        askValueY = null
        bidValueY = previousPricePoint?.totalVolume.toNumber() || 0
      } else {
        askValueY = totalVolume.toNumber()
        bidValueY = null
      }

      // Add the new point
      const pricePointDetails: PricePointDetails = {
        type,
        volume,
        totalVolume,
        price,

        // Data for representation
        priceNumber: price.toNumber(),
        totalVolumeNumber: totalVolume.toNumber(),
        priceFormatted: _formatSmartBigNumber(price),
        totalVolumeFormatted: _formatSmartBigNumber(totalVolume),
        askValueY,
        bidValueY,
      }
      acc.points.push(pricePointDetails)

      return { totalVolume, points: acc.points }
    },
    {
      totalVolume: ZERO_BIG_NUMBER,
      points: [] as PricePointDetails[],
    },
  )

  // Bid points were sorted in reverse for the volume calculation. Revert them back
  return isBid ? points.reverse() : points
}

function _printOrderBook(pricePoints: PricePointDetails[], baseToken: TokenDetails, quoteToken: TokenDetails): void {
  logDebug('Order Book: ' + baseToken.symbol + '-' + quoteToken.symbol)
  pricePoints.forEach(pricePoint => {
    const isBid = pricePoint.type === Offer.Bid
    logDebug(
      `\t${isBid ? 'Bid' : 'Ask'} ${pricePoint.totalVolumeFormatted} ${baseToken.symbol} at ${
        pricePoint.priceFormatted
      } ${quoteToken.symbol}`,
    )
  })
}

// --- Initial zoom calculation helper functions ---
function calcRange(minBid: number, maxBid: number, minAsk: number, maxAsk: number): number {
  return Math.max(maxBid, maxAsk) - Math.min(minBid, minAsk)
}

function calcSpread(maxBid: number, minAsk: number): number {
  return Math.abs(minAsk - maxBid)
}

function calcZoomInterval(spread: number): number {
  // TODO: magic number, move to const
  return spread * 2
}

function calcLowerZoomX(minBid: number, maxBid: number, minAsk: number, zoomInterval: number): number {
  return Math.max(Math.min(maxBid, minAsk) - zoomInterval, minBid)
}

function calcUpperZoomX(minAsk: number, maxAsk: number, maxBid: number, zoomInterval: number): number {
  return Math.min(Math.max(maxBid, minAsk) + zoomInterval, maxAsk)
}

function calcUpperZoomY(
  bids: PricePointDetails[],
  asks: PricePointDetails[],
  lowerZoomX: number,
  upperZoomX: number,
): number {
  const bidsVolume = bids.find(bid => lowerZoomX < bid.priceNumber)?.totalVolumeNumber || 0
  let asksVolume = asks.length > 0 ? asks[0].totalVolumeNumber : 0
  asksVolume = asks.find((_ask, i) => upperZoomX < asks[i + 1]?.priceNumber)?.totalVolumeNumber || asksVolume
  console.log(`bidsVolume: ${bidsVolume}; asksVolume: ${asksVolume}`)
  return Math.max(bidsVolume, asksVolume)
}

function calcMinX(minBid: number, minAsk: number): number {
  return Math.min(minBid, minAsk)
}

function calcMaxY(minBid: number, maxAsk: number): number {
  return Math.max(minBid, maxAsk)
}

function calcPercentageOfAxis(position: number, start: number, range: number): number {
  return (position - start) / range
}

function createChart(mountPoint: HTMLDivElement): am4charts.XYChart {
  const chart = am4core.create(mountPoint, am4charts.XYChart)

  // Create axes
  const xAxis = chart.xAxes.push(new am4charts.ValueAxis())
  // Making the scale start with the first value, without empty spaces
  // https://www.amcharts.com/docs/v4/reference/valueaxis/#strictMinMax_property
  xAxis.strictMinMax = true
  // How small we want the column separators be, in pixels
  // https://www.amcharts.com/docs/v4/reference/axisrendererx/#minGridDistance_property
  xAxis.renderer.minGridDistance = 40

  // To start zoomed in when data loads
  // https://www.amcharts.com/docs/v4/reference/valueaxis/#keepSelection_property
  xAxis.keepSelection = true
  // To allow we to zoom reaaaaly tiny fractions
  xAxis.maxZoomFactor = 10 ** 18

  const yAxis = chart.yAxes.push(new am4charts.ValueAxis())

  yAxis.keepSelection = true
  yAxis.maxZoomFactor = 10 ** 18

  // Colors
  const colors = {
    green: '#3d7542',
    red: '#dc1235',
  }

  // Create series
  const bidSeries = chart.series.push(new am4charts.StepLineSeries())
  bidSeries.dataFields.valueX = 'priceNumber'
  bidSeries.dataFields.valueY = 'bidValueY'
  bidSeries.strokeWidth = 1
  bidSeries.stroke = am4core.color(colors.green)
  bidSeries.fill = bidSeries.stroke
  bidSeries.fillOpacity = 0.1

  const askSeries = chart.series.push(new am4charts.StepLineSeries())
  askSeries.dataFields.valueX = 'priceNumber'
  askSeries.dataFields.valueY = 'askValueY'
  askSeries.strokeWidth = 1
  askSeries.stroke = am4core.color(colors.red)
  askSeries.fill = askSeries.stroke
  askSeries.fillOpacity = 0.1

  // Add cursor
  chart.cursor = new am4charts.XYCursor()

  chart.cursor.snapToSeries = [bidSeries, askSeries]

  am4core.useTheme(am4themesSpiritedaway)
  am4core.options.autoSetClassName = true

  chart.scrollbarX = new am4core.Scrollbar()
  chart.scrollbarY = new am4core.Scrollbar()

  return chart
}

interface ChartProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  networkId: number
  hops?: number
}

export const Chart: React.FC<ChartProps> = props => {
  const { baseToken, quoteToken, networkId, hops } = props
  const [chart, setChart] = useSafeState<null | am4charts.XYChart>(null)

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
    if (chart) {
      const baseTokenLabel = safeTokenName(baseToken)
      const quoteTokenLabel = safeTokenName(quoteToken)
      const market = baseTokenLabel + '-' + quoteTokenLabel

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
          const bids = processData(data.bids, baseToken, quoteToken, Offer.Bid)
          const asks = processData(data.asks, baseToken, quoteToken, Offer.Ask)
          const pricePoints = bids.concat(asks)

          let startX = 0
          let endX = 1

          if (bids.length > 0 && asks.length > 0) {
            const minBid = bids[0].priceNumber
            const maxBid = bids[bids.length - 1].priceNumber
            const minAsk = asks[0].priceNumber
            const maxAsk = asks[asks.length - 1].priceNumber
            // What's the left most value? (given by price)
            const minX = calcMinX(minBid, minAsk)
            // What's the highest value? (given by volume)
            const maxY = calcMaxY(bids[0].totalVolumeNumber, asks[asks.length - 1].totalVolumeNumber)

            // What's the difference between start and end prices
            const range = calcRange(minBid, maxBid, minAsk, maxAsk)
            // What's the difference between highest bid and lowest ask (modulus)
            const spread = calcSpread(maxBid, minAsk)
            // How much will we zoom, based on the spread
            const zoomInterval = calcZoomInterval(spread)
            // Starting X value
            const lowerZoomX = calcLowerZoomX(minBid, maxBid, minAsk, zoomInterval)
            // Ending X value
            const upperZoomX = calcUpperZoomX(minAsk, maxAsk, maxBid, zoomInterval)
            // Ending Y value (Y always starts on 0)
            const upperZoomY = calcUpperZoomY(bids, asks, lowerZoomX, upperZoomX)

            // Calculate, given `upperZoomY`, where in % terms it fits
            const endY = calcPercentageOfAxis(upperZoomY, 0, maxY)
            // Same as above, for `lowerZoomX` and `upperZoomX`
            startX = calcPercentageOfAxis(lowerZoomX, minX, range)
            endX = calcPercentageOfAxis(upperZoomX, minX, range)

            logDebug(`bids[${minBid.toFixed(10)}...${maxBid.toFixed(10)}]`)
            logDebug(`asks[${minAsk.toFixed(10)}...${maxAsk.toFixed(10)}]`)
            logDebug(`range: ${range}; minX: ${minX}`)
            logDebug(`spread: ${spread}`)
            logDebug(`zoomInterval: ${zoomInterval}`)
            logDebug(`lowerZoomX: ${lowerZoomX}; upperZoomX: ${upperZoomX}`)
            logDebug(`startX %: ${startX}; endX %: ${endX}`)
            logDebug(`upperZoomY: ${upperZoomY}; maxY: ${maxY}`)
            logDebug(`endY %: ${endY}`)

            // Setting Y axis initial zoom
            yAxis.end = endY
          } else if (bids.length > 0) {
            // There are no asks. Zoom on the right side of the graph
            // TODO: magic number, move to const
            xAxis.start = 0.95
            xAxis.end = 1
            // TODO: adjust yAxis
          } else if (asks.length > 0) {
            // There are no bids. Zoom on the left side of the graph
            xAxis.start = 0
            // TODO: magic number, move to const
            xAxis.end = 0.5
            // TODO: adjust yAxis
          }

          // Setting X axis initial zoom
          xAxis.start = startX
          xAxis.end = endX

          _printOrderBook(pricePoints, baseToken, quoteToken)

          return pricePoints
        } catch (error) {
          console.error('Error processing data', error)
          return []
        }
      })

      // Reload data from data source re-using same chart
      chart.dataSource.load()

      // Setting up tooltips based on currently loaded tokens
      const [bidSeries, askSeries] = chart.series.values
      bidSeries.tooltipText = `[bold]${market}[/]\nBid Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`
      askSeries.tooltipText = `[bold]${market}[/]\nAsk Price: [bold]{priceFormatted}[/] ${quoteTokenLabel}\nVolume: [bold]{totalVolumeFormatted}[/] ${baseTokenLabel}`
    }
  }, [baseToken, chart, hops, networkId, quoteToken])

  return <Wrapper ref={mountPoint} />
}
