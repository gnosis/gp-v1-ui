import { PricePointDetails, ZoomValues } from 'components/OrderBookChart/types'
import { logDebug } from 'utils'

const ORDERBOOK_ONE_SIDED_MARKET_ZOOM_PERCENTAGE = 0.05 // %

// --- Initial zoom calculation helper functions ---
export function calcRange(minBid: number, maxBid: number, minAsk: number, maxAsk: number): number {
  return Math.max(maxBid, maxAsk) - Math.min(minBid, minAsk)
}

export function calcSpread(maxBid: number, minAsk: number): number {
  return Math.abs(minAsk - maxBid)
}

export function calcZoomInterval(spread: number): number {
  // TODO: magic number, move to const
  return spread * 2
}

export function calcLowerZoomX(minBid: number, maxBid: number, minAsk: number, zoomInterval: number): number {
  return Math.max(Math.min(maxBid, minAsk) - zoomInterval, minBid)
}

export function calcUpperZoomX(minAsk: number, maxAsk: number, maxBid: number, zoomInterval: number): number {
  return Math.min(Math.max(maxBid, minAsk) + zoomInterval, maxAsk)
}

export function calcUpperZoomY(
  bids: PricePointDetails[],
  asks: PricePointDetails[],
  lowerZoomX: number,
  upperZoomX: number,
): number {
  const bidsVolume = bids.find(bid => lowerZoomX < bid.priceNumber)?.totalVolumeNumber || 0
  let asksVolume = asks.length > 0 ? asks[0].totalVolumeNumber : 0
  asksVolume = asks.find((_ask, i) => upperZoomX <= asks[i + 1]?.priceNumber)?.totalVolumeNumber || asksVolume
  logDebug(`[Order Book] bidsVolume: ${bidsVolume}; asksVolume: ${asksVolume}`)
  return Math.max(bidsVolume, asksVolume)
}

export function calcMinX(minBid: number, minAsk: number): number {
  return Math.min(minBid, minAsk)
}

export function calcPercentageOfAxis(position: number, start: number, range: number): number {
  return (position - start) / range
}

export function calcValueFromPercentage(percentage: number, start: number, range: number): number {
  return range * percentage + start
}

export function calcZoomY(
  bids: PricePointDetails[],
  asks: PricePointDetails[],
  xAxisMinValue: number,
  xAxisMaxValue: number,
  xAxisStartZoomPercentage: number,
  xAxisEndZoomPercentage: number,
  yAxisMaxValue: number,
): number {
  const range = xAxisMaxValue - xAxisMinValue
  const lowerZoomX = calcValueFromPercentage(xAxisStartZoomPercentage, xAxisMinValue, range)
  const upperZoomX = calcValueFromPercentage(xAxisEndZoomPercentage, xAxisMinValue, range)
  const upperZoomY = calcUpperZoomY(bids, asks, lowerZoomX, upperZoomX)
  return calcPercentageOfAxis(upperZoomY, 0, yAxisMaxValue)
}

export function calcInitialZoom(bids: PricePointDetails[], asks: PricePointDetails[]): ZoomValues {
  let startX = 0
  let endX = 1
  let endY = 1
  if (bids.length > 0 && asks.length > 0) {
    const minBid = bids[0].priceNumber
    const maxBid = bids[bids.length - 1].priceNumber
    const minAsk = asks[0].priceNumber
    const maxAsk = asks[asks.length - 1].priceNumber
    // What's the left most value? (given by price)
    const minX = calcMinX(minBid, minAsk)
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

    startX = calcPercentageOfAxis(lowerZoomX, minX, range)
    endX = calcPercentageOfAxis(upperZoomX, minX, range)
    // TODO: refactor calcZoomY. Calculating to-from % twice
    endY = calcZoomY(
      bids,
      asks,
      minX,
      Math.max(maxBid, maxAsk),
      startX,
      endX,
      Math.max(bids[0].totalVolumeNumber, asks[asks.length - 1].totalVolumeNumber),
    )

    logDebug(`[Order Book] bids[${minBid.toFixed(15)}...${maxBid.toFixed(15)}]`)
    logDebug(`[Order Book] asks[${minAsk.toFixed(15)}...${maxAsk.toFixed(15)}]`)
    logDebug(`[Order Book] range: ${range.toFixed(15)}; minX: ${minX.toFixed(15)}`)
    logDebug(`[Order Book] spread: ${spread.toFixed(15)}`)
    logDebug(`[Order Book] zoomInterval: ${zoomInterval.toFixed(15)}`)
    logDebug(`[Order Book] lowerZoomX: ${lowerZoomX.toFixed(15)}; upperZoomX: ${upperZoomX.toFixed(15)}`)
  } else if (bids.length > 0) {
    // There are no asks. Zoom on the right side of the graph
    startX = 1 - ORDERBOOK_ONE_SIDED_MARKET_ZOOM_PERCENTAGE
    endY = calcZoomY(
      bids,
      asks,
      bids[0].priceNumber,
      bids[bids.length - 1].priceNumber,
      startX,
      endX,
      bids[0].totalVolumeNumber,
    )
  } else if (asks.length > 0) {
    // There are no bids. Zoom on the left side of the graph
    endX = ORDERBOOK_ONE_SIDED_MARKET_ZOOM_PERCENTAGE
    endY = calcZoomY(
      bids,
      asks,
      asks[0].priceNumber,
      asks[asks.length - 1].priceNumber,
      startX,
      endX,
      asks[asks.length - 1].totalVolumeNumber,
    )
  }
  logDebug(`[Order Book] X start: ${startX * 100}%; end: ${endX * 100}%; Y end ${endY * 100}%`)
  return { startX, endX, endY }
}
