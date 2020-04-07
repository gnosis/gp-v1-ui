import BigNumber from 'bignumber.js'
import { getNetworkFromId, assert, TEN_BIG_NUMBER, ONE_BIG_NUMBER } from '@gnosis.pm/dex-js'

export interface DexPriceEstimatorApi {
  getPrice(params: GetPriceParams): Promise<BigNumber | null>
}

interface GetPriceParams {
  networkId: number
  baseToken: Token
  quoteToken: Token
  amountInUnits?: BigNumber | string
  inWei?: boolean
}

interface Token {
  id: number
  decimals?: number
}

// Sample response:
// {
//   "baseTokenId": "1",
//   "quoteTokenId": "2",
//   "buyAmountInBase": 4.6553080250243255e+27,
//   "sellAmountInQuote": 1000000000000000000
// }
interface GetPriceResponse {
  baseTokenId: string
  quoteTokenId: string
  buyAmountInBase: string
  sellAmountInQuote: string
}

export interface Params {
  networkIds: number[]
}

function getDexPriceEstimatorUrl(networkId: number): string {
  const networkName = getNetworkFromId(networkId).toLowerCase()
  return `https://price-estimate-${networkName}.dev.gnosisdev.com/api/v1/`
}

export class DexPriceEstimatorApiImpl implements DexPriceEstimatorApi {
  private urlsByNetwork: { [networkId: number]: string }

  public constructor(params: Params) {
    const { networkIds } = params

    this.urlsByNetwork = {}
    networkIds.forEach(networkId => {
      this.urlsByNetwork[networkId] = getDexPriceEstimatorUrl(networkId)
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

    const amountInAtoms = new BigNumber(amountInUnits).multipliedBy(10 ** quoteTokenDecimals).toFixed(0)

    // Query format: markets/1-2/estimated-buy-amount/1000000000000000000?atoms=true
    // See https://github.com/gnosis/dex-price-estimator#api
    const queryString = `markets/${baseTokenId}-${quoteTokenId}/estimated-buy-amount/${amountInAtoms}?atoms=true`

    try {
      const response = await this.query<GetPriceResponse>(networkId, queryString)
      console.log('response:', response)

      if (!response) {
        return response
      }

      return this.parsePricesResponse(response.buyAmountInBase, baseTokenDecimals, inWei)
    } catch (e) {
      console.error(e)
      throw new Error(
        `Failed to query price for baseToken id ${baseTokenId} quoteToken id ${quoteTokenId}: ${e.message}`,
      )
    }
  }

  private parsePricesResponse(priceString: string, decimals: number, inWei: boolean): BigNumber {
    const price = new BigNumber(priceString)
    return inWei ? price : price.dividedBy(TEN_BIG_NUMBER.exponentiatedBy(decimals))
  }

  private async query<T>(networkId: number, queryString: string): Promise<T | null> {
    const baseUrl = this.urlsByNetwork[networkId]
    assert(baseUrl, `Dex-price-estimator not available for network id ${networkId}`)

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
}
