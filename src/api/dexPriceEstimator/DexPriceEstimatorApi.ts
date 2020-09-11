import BigNumber from 'bignumber.js'
import { assert, TEN_BIG_NUMBER, ONE_BIG_NUMBER } from '@gnosis.pm/dex-js'
import { ORDER_BOOK_HOPS_DEFAULT, ORDER_BOOK_HOPS_MAX } from 'const'

export interface DexPriceEstimatorApi {
  getPrice(params: GetPriceParams): Promise<BigNumber | null>
  getOrderBookUrl(params: OrderBookParams): string
  getOrderBookData(params: OrderBookParams): Promise<OrderBookData>
}

interface GetPriceParams {
  networkId: number
  baseToken: Token
  quoteToken: Token
  amountInUnits?: BigNumber | string
  inWei?: boolean
}

interface OrderBookParams {
  networkId: number
  baseTokenId: number
  quoteTokenId: number
  hops?: number
  batchId?: number
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
 * DATA returned from api as JSON
 */
export interface OrderBookData {
  asks: RawPricePoint[]
  bids: RawPricePoint[]
}

interface Token {
  id: number
  decimals?: number
}

// Sample response:
// {
//   "baseTokenId": 1,
//   "quoteTokenId": 2,
//   "buyAmountInBase": "4655308025024325536192659456",
//   "sellAmountInQuote": "1000000000000000000"
// }
interface GetPriceResponse {
  baseTokenId: number
  quoteTokenId: number
  buyAmountInBase: string
  sellAmountInQuote: string
}

export interface PriceEstimatorEndpoint {
  networkId: number
  url_production: string
  url_develop?: string
}

export type DexPriceEstimatorParams = PriceEstimatorEndpoint[]

function getDexPriceEstimatorUrl(baseUlr: string): string {
  return `${baseUlr}${baseUlr.endsWith('/') ? '' : '/'}api/v1/`
}

export class DexPriceEstimatorApiImpl implements DexPriceEstimatorApi {
  private urlsByNetwork: { [networkId: number]: string } = {}

  public constructor(params: DexPriceEstimatorParams) {
    params.forEach((endpoint) => {
      this.urlsByNetwork[endpoint.networkId] = getDexPriceEstimatorUrl(
        process.env.PRICE_ESTIMATOR_URL === 'production'
          ? endpoint.url_production
          : endpoint.url_develop || endpoint.url_production, // fallback on required url_production
      )
    })
  }

  public async getPrice(params: GetPriceParams): Promise<BigNumber | null> {
    const {
      networkId,
      baseToken: { id: baseTokenId, decimals: baseTokenDecimals = 18 },
      quoteToken: { id: quoteTokenId, decimals: quoteTokenDecimals = 18 },
      amountInUnits = ONE_BIG_NUMBER,
      inWei = false,
    } = params

    const amount = new BigNumber(amountInUnits)

    const amountInAtoms = amount.multipliedBy(10 ** quoteTokenDecimals).toFixed(0)

    // Query format: markets/1-2/estimated-buy-amount/1000000000000000000?atoms=true
    // See https://github.com/gnosis/dex-price-estimator#api
    const queryString = `markets/${baseTokenId}-${quoteTokenId}/estimated-buy-amount/${amountInAtoms}?atoms=true`

    try {
      const response = await this.query<GetPriceResponse>(networkId, queryString)

      if (!response) {
        return response
      }

      return this.parsePricesResponse(response.buyAmountInBase, baseTokenDecimals, amount, inWei)
    } catch (e) {
      console.error(e)
      throw new Error(
        `Failed to query price for baseToken id ${baseTokenId} quoteToken id ${quoteTokenId}: ${e.message}`,
      )
    }
  }

  public getOrderBookUrl(params: OrderBookParams): string {
    const { networkId, baseTokenId, quoteTokenId, hops = ORDER_BOOK_HOPS_DEFAULT, batchId } = params
    assert(hops >= 0, 'Hops should be positive')
    assert(hops <= ORDER_BOOK_HOPS_MAX, 'Hops should be not be greater than ' + ORDER_BOOK_HOPS_MAX)

    const baseUrl = this._getBaseUrl(networkId)

    let url = `${baseUrl}markets/${baseTokenId}-${quoteTokenId}?atoms=true&hops=${hops}`
    if (batchId) {
      url += `&batchId=${batchId}`
    }
    return url
  }

  public async getOrderBookData(params: OrderBookParams): Promise<OrderBookData> {
    try {
      const url = await this.getOrderBookUrl(params)

      const res = await fetch(url)
      if (!res.ok) {
        // backend returns {"message":"invalid url query"}
        // for bad requests
        throw await res.json()
      }
      return await res.json()
    } catch (error) {
      console.error(error)

      const { baseTokenId, quoteTokenId } = params

      throw new Error(
        `Failed to query orderbook data for baseToken id ${baseTokenId} quoteToken id ${quoteTokenId}: ${error.message}`,
      )
    }
  }

  private parsePricesResponse(
    baseAmountInAtoms: string,
    baseDecimals: number,
    quoteAmountInUnits: BigNumber,
    inWei: boolean,
  ): BigNumber {
    const baseAmountInUnits = new BigNumber(baseAmountInAtoms).dividedBy(TEN_BIG_NUMBER.exponentiatedBy(baseDecimals))

    const price = baseAmountInUnits.dividedBy(quoteAmountInUnits)

    return inWei ? price.multipliedBy(TEN_BIG_NUMBER.exponentiatedBy(baseDecimals)) : price
  }

  private async query<T>(networkId: number, queryString: string): Promise<T | null> {
    const baseUrl = this._getBaseUrl(networkId)

    const url = baseUrl + queryString

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Request failed: [${response.status}] ${response.body}`)
    }

    const body = await response.text()

    if (!body) {
      return null
    }

    return JSON.parse(body)
  }

  private _getBaseUrl(networkId: number): string {
    const baseUrl = this.urlsByNetwork[networkId]
    assert(baseUrl, `Dex-price-estimator not available for network id ${networkId}`)

    return baseUrl
  }
}
