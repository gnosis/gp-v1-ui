// Local type definitions pertaining only this component.
// Does not make sense to move it to the global type definition.

import BigNumber from 'bignumber.js'

export enum Offer {
  Bid,
  Ask,
}

/**
 * Price point as defined in the API
 * Both price and volume are numbers (floats)
 *
 * The price and volume are expressed in atoms
 */
export interface RawPricePoint {
  price: number
  volume: number
}

/**
 * Normalized price point
 * Both price and volume are BigNumbers (decimal)
 *
 * The price and volume are expressed in atoms
 */
export interface PricePoint {
  price: BigNumber
  volume: BigNumber
}

/**
 * Price point data represented in the graph. Contains BigNumbers for operate with less errors and more precission
 * but for representation uses number as expected by the library
 */
export interface PricePointDetails {
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

export interface ZoomValues {
  startX: number
  endX: number
  endY: number
}
