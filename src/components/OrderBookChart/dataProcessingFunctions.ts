import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { TEN_BIG_NUMBER, formatSmart, DEFAULT_PRECISION, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from '@gnosis.pm/dex-js'

import { logDebug } from 'utils'
import { TokenDetails } from 'types'

import { RawPricePoint, PricePoint, Offer, PricePointDetails } from 'components/OrderBookChart/types'

const SMALL_VOLUME_THRESHOLD = 0.01

export function _toPricePoint(
  pricePoint: RawPricePoint,
  quoteTokenDecimals: number,
  baseTokenDecimals: number,
): PricePoint {
  return {
    price: new BigNumber(pricePoint.price).div(TEN_BIG_NUMBER.pow(quoteTokenDecimals - baseTokenDecimals)),
    volume: new BigNumber(pricePoint.volume).div(TEN_BIG_NUMBER.pow(baseTokenDecimals)),
  }
}

export function _formatSmartBigNumber(amount: BigNumber): string {
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
export function processData(
  rawPricePoints: RawPricePoint[],
  baseToken: TokenDetails,
  quoteToken: TokenDetails,
  type: Offer,
  owlPrice: BigNumber | null,
): PricePointDetails[] {
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
  const minimumOrderVolume = !owlPrice // is there a price returned?
    ? new BigNumber(SMALL_VOLUME_THRESHOLD) // No, use default dumb threshold
    : owlPrice.eq(0) // Is price 0?
    ? ONE_BIG_NUMBER // It's OWL itself, use 1
    : owlPrice // Not OWL, use returned price

  pricePoints = pricePoints
    .filter(pricePoint => pricePoint.volume.gt(minimumOrderVolume))
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

export function _printOrderBook(
  pricePoints: PricePointDetails[],
  baseToken: TokenDetails,
  quoteToken: TokenDetails,
): void {
  logDebug('[Order Book]: ' + baseToken.symbol + '-' + quoteToken.symbol)
  pricePoints.forEach(pricePoint => {
    const isBid = pricePoint.type === Offer.Bid
    logDebug(
      `[Order Book]\t${isBid ? 'Bid' : 'Ask'} ${pricePoint.totalVolumeFormatted} ${baseToken.symbol} at ${
        pricePoint.priceFormatted
      } ${quoteToken.symbol}\tinverted ${_formatSmartBigNumber(ONE_BIG_NUMBER.dividedBy(pricePoint.price))}`,
    )
  })
}
