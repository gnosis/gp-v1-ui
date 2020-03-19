import BN from 'bn.js'
import { assert, ZERO } from '@gnosis.pm/dex-js'

export interface TheGraphApi {
  getPrice(params: GetPriceParams): Promise<BN>
  getPrices(params: GetPricesParams): Promise<GetPricesResult>
}

interface GetPricesResult {
  [tokenId: number]: BN
}

export interface GetPriceParams {
  networkId: number
  tokenId: number
}

export interface GetPricesParams {
  networkId: number
  tokenIds: number[]
}

interface QueryParams {
  networkId: number
  queryString: string
}

interface UrlByNetwork {
  [network: number]: string
}

interface PricesData {
  data: {
    [tokenKey: string]: {
      priceInOwl: string
    }[]
  }
}

interface GqlError {
  errors: {
    locations: {
      line: number
      column: number
    }[]
    message: string
  }[]
}

type GqlResult = PricesData | GqlError

const isGqlError = (gqlResult: GqlResult): gqlResult is GqlError => 'errors' in gqlResult

export class TheGraphApiImpl {
  private urlByNetwork: UrlByNetwork

  public constructor(params: { urls: UrlByNetwork }) {
    this.urlByNetwork = params.urls
  }

  public async getPrice({ networkId, tokenId }: GetPriceParams): Promise<BN> {
    const prices = this.getPrices({ networkId, tokenIds: [tokenId] })
    return prices[tokenId]
  }

  public async getPrices({ networkId, tokenIds }: GetPricesParams): Promise<GetPricesResult> {
    const tokens = tokenIds.map(tokenId => this.buildPriceQuery(tokenId)).join('\n')
    const queryString = `{${tokens}}`

    try {
      const response = await this.query<PricesData>({ networkId, queryString })

      return this.parsePricesData(response)
    } catch (e) {
      console.error(e)
      throw new Error(`Failed to query prices: ${e.message}`)
    }
  }

  private async query<T>({ networkId, queryString }: QueryParams): Promise<T> {
    const url = this.urlByNetwork[networkId]
    assert(url, `No graph configured for network id ${networkId}`)

    const data = {
      query: queryString,
    }

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Request failed: [${response.status}] ${response.body}`)
    }

    const gqlResult = await response.json()

    if (isGqlError(gqlResult)) {
      throw new Error(`Query failed: ${gqlResult.errors[0].message}`)
    }

    return gqlResult
  }

  private buildPriceQuery(tokenId: number): string {
    return `Token${tokenId}: prices(
  first: 1, 
  orderBy: batchId, 
  orderDirection: desc, 
  where: {token: "${tokenId}"}
) {
  priceInOwl
}`
  }

  private parsePricesData({ data }: PricesData): GetPricesResult {
    return Object.keys(data).reduce((acc, tokenKey) => {
      // not possible to have a key with only integers, thus `Token` prefix was added
      const tokenId = +tokenKey.replace(/Token/, '')

      // When there's no data for a token, return 0
      acc[tokenId] = new BN(data[tokenKey].length > 0 ? data[tokenKey][0].priceInOwl : ZERO)
      return acc
    }, {})
  }
}
