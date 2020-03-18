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
    const price = await this.query<string>({ networkId, queryString })
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
