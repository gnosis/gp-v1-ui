import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { TEN_BIG_NUMBER, formatSmart, DEFAULT_PRECISION, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from '@gnosis.pm/dex-js'

import { logDebug } from 'utils'
import { TokenDetails } from 'types'

import { RawPricePoint, PricePoint, Offer, PricePointDetails } from './types'
import { OrderBookData } from 'api/dexPriceEstimator/DexPriceEstimatorApi'

const SMALL_VOLUME_THRESHOLD = 0.01

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
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  type: Offer,
): PricePointDetails[] => {
  const isBid = type == Offer.Bid

  // Convert RawPricePoint into PricePoint:
  //  Raw items use number (floats) and are given in "atoms"
  //  Normalized items use decimals (BigNumber) and are given in natural units
  let pricePoints: PricePoint[] = rawPricePoints.map((pricePoint) =>
    _toPricePoint(pricePoint, quoteTokenDecimals, baseTokenDecimals),
  )

  // Filter tiny orders
  pricePoints = pricePoints
    .filter((pricePoint) => pricePoint.volume.gt(SMALL_VOLUME_THRESHOLD))
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

function _printOrderBook(pricePoints: PricePointDetails[], baseTokenSymbol = '', quoteTokenSymbol = ''): void {
  logDebug('Order Book: ' + baseTokenSymbol + '-' + quoteTokenSymbol)
  pricePoints.forEach((pricePoint) => {
    const isBid = pricePoint.type === Offer.Bid
    logDebug(
      `\t${isBid ? 'Bid' : 'Ask'} ${pricePoint.totalVolumeFormatted} ${baseTokenSymbol} at ${
        pricePoint.priceFormatted
      } ${quoteTokenSymbol}\tinverted ${_formatSmartBigNumber(ONE_BIG_NUMBER.dividedBy(pricePoint.price))}`,
    )
  })
}

interface ProcessRawDataParams {
  data: OrderBookData
  baseToken: Pick<TokenDetails, 'decimals' | 'symbol'>
  quoteToken: Pick<TokenDetails, 'decimals' | 'symbol'>
}

export const processRawApiData = ({ data, baseToken, quoteToken }: ProcessRawDataParams): PricePointDetails[] => {
  try {
    const bids = processData(data.bids, baseToken.decimals, quoteToken.decimals, Offer.Bid)
    const asks = processData(data.asks, baseToken.decimals, quoteToken.decimals, Offer.Ask)
    const pricePoints = bids.concat(asks)

    // Sort points by price
    // pricePoints.sort((lhs, rhs) => lhs.price.comparedTo(rhs.price))

    _printOrderBook(pricePoints, baseToken.symbol, quoteToken.symbol)

    return pricePoints
  } catch (error) {
    console.error('Error processing data', error)
    return []
  }
}
