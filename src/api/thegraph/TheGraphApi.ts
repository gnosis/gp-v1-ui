import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { assert, ZERO } from '@gnosis.pm/dex-js'

export interface TheGraphApi {
  getPrice(params: GetPriceParams): Promise<BigNumber>
  getPriceInWei(params: GetPriceParams): Promise<BN>
}

export interface GetPriceParams {
  networkId: number
  tokenId: number
}

export interface QueryParams {
  networkId: number
  queryString: string
}

interface UrlByNetwork {
  [network: number]: string
}

interface PricesData {
  data: {
    prices: {
      batchId: string
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

  public async getPrice({ networkId, tokenId }: GetPriceParams): Promise<BigNumber> {
    const queryString = `{ 
        prices(
          first: 1, 
          orderBy: batchId
          orderDirection: desc
          where: { token: "${tokenId}" }
        ) {
            batchId
            priceInOwl
        }}`

    const gqlResult = await this.query<GqlResult>({ networkId, queryString })

    if (isGqlError(gqlResult)) {
      throw new Error(gqlResult.errors[0].message)
    }

    const price = gqlResult.data.prices[0].priceInOwl
    return new BigNumber(price)
  }

  public async getPriceInWei({}: GetPriceParams): Promise<BN> {
    // TODO: implement this, maybe?
    return ZERO
  }

  private async query<T>({ networkId, queryString }: QueryParams): Promise<T> {
    const url = this.urlByNetwork[networkId]
    assert(url, `No graph configured for network id ${networkId}`)

    const data = {
      query: queryString,
      variables: null,
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

    return response.json()
  }
}
