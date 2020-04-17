import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { TokenDetails, Network } from 'types'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themesSpiritedaway from '@amcharts/amcharts4/themes/spiritedaway'
import { getNetworkFromId, safeTokenName } from '@gnosis.pm/dex-js'
import { dexPriceEstimatorApi } from 'api'

interface OrderBookProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  networkId: number
  hops?: number
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
`

enum Offer {
  Bid,
  Ask,
}

interface RawItem {
  price: number
  volume: number
}

interface ProcessedItem {
  volume: number
  totalVolume: number
  askValueY: number | null
  bidValueY: number | null
  price: number
}

/**
 * This method turns the raw data that the backend returns into data that can be displayed by the chart.
 * This involves aggregating the total volume and accounting for decimals
 */
const processData = (
  list: RawItem[],
  baseToken: TokenDetails,
  quoteToken: TokenDetails,
  type: Offer,
): ProcessedItem[] => {
  let totalVolume = 0
  const isBid = type == Offer.Bid
  return (
    list
      // Account fo decimals
      .map(element => {
        return {
          price: element.price / 10 ** (quoteToken.decimals - baseToken.decimals),
          volume: element.volume / 10 ** baseToken.decimals,
        }
      })
      // Filter tiny orders
      .filter(e => e.volume > 0.01)
      // Accumulate totalVolume
      .map(e => {
        const previousTotalVolume = totalVolume
        totalVolume += e.volume
        return {
          price: e.price,
          volume: e.volume,
          totalVolume,
          // Amcharts draws step lines so that the x value is centered (Default). To correctly display the orderbook, we want
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
          askValueY: isBid ? null : totalVolume,
          bidValueY: isBid ? previousTotalVolume : null,
        }
      })
  )
}

const draw = (
  chartElement: HTMLElement,
  baseToken: TokenDetails,
  quoteToken: TokenDetails,
  networkId: number,
  hops?: number,
): am4charts.XYChart => {
  const baseTokenLabel = safeTokenName(baseToken)
  am4core.useTheme(am4themesSpiritedaway)
  am4core.options.autoSetClassName = true
  const chart = am4core.create(chartElement, am4charts.XYChart)
  const networkDescription = networkId !== Network.Mainnet ? `${getNetworkFromId(networkId)} ` : ''

  // Add data
  chart.dataSource.url = dexPriceEstimatorApi.getOrderBookUrl({
    baseTokenId: baseToken.id,
    quoteTokenId: quoteToken.id,
    hops,
    networkId,
  })
  chart.dataSource.adapter.add('parsedData', data => {
    const processed = processData(data.bids, baseToken, quoteToken, Offer.Bid).concat(
      processData(data.asks, baseToken, quoteToken, Offer.Ask),
    )
    processed.sort((lhs, rhs) => lhs.price - rhs.price)
    return processed
  })

  // Set up precision for numbers
  chart.numberFormatter.numberFormat = '#,###.##'

  // Colors
  const colors = {
    green: '#3d7542',
    red: '#dc1235',
  }

  // Create axes
  const xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
  xAxis.dataFields.category = 'price'
  xAxis.title.text = `${networkDescription} Price (${baseToken.symbol}/${quoteToken.symbol})`

  const yAxis = chart.yAxes.push(new am4charts.ValueAxis())
  yAxis.title.text = 'Volume'

  // Create series
  const bidCurve = chart.series.push(new am4charts.StepLineSeries())
  bidCurve.dataFields.categoryX = 'price'
  bidCurve.dataFields.valueY = 'bidValueY'
  bidCurve.strokeWidth = 1
  bidCurve.stroke = am4core.color(colors.green)
  bidCurve.fill = bidCurve.stroke
  bidCurve.startLocation = 0.5
  bidCurve.fillOpacity = 0.1
  bidCurve.tooltipText = `Bid: [bold]{categoryX}[/]\nVolume: [bold]{totalVolume} ${baseTokenLabel}[/]`

  const askCurve = chart.series.push(new am4charts.StepLineSeries())
  askCurve.dataFields.categoryX = 'price'
  askCurve.dataFields.valueY = 'askValueY'
  askCurve.strokeWidth = 1
  askCurve.stroke = am4core.color(colors.red)
  askCurve.fill = askCurve.stroke
  askCurve.fillOpacity = 0.1
  askCurve.startLocation = 0.5
  askCurve.tooltipText = `Ask: [bold]{categoryX}[/]\nVolume: [bold]{totalVolume} ${baseTokenLabel}[/]`

  // Add cursor
  chart.cursor = new am4charts.XYCursor()
  return chart
}

const OrderBookWidget: React.FC<OrderBookProps> = props => {
  const { baseToken, quoteToken, networkId, hops } = props
  const mountPoint = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountPoint.current) return
    const chart = draw(mountPoint.current, baseToken, quoteToken, networkId, hops)

    return (): void => chart.dispose()
  }, [baseToken, quoteToken, networkId, hops])

  return (
    <Wrapper ref={mountPoint}>
      Show order book for token {safeTokenName(baseToken)} ({baseToken.id}) and {safeTokenName(baseToken)} (
      {quoteToken.id})
    </Wrapper>
  )
}

export default OrderBookWidget
