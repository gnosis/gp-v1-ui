import { TokenList, TokenDetails, ExchangeApi } from 'types'
import { getTokensByNetwork } from './tokenList'
import { log } from 'utils'

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 * Gets the images from https://github.com/trustwallet/tokens
 */
export class TokenListApiImpl implements TokenList {
  public networkIds: number[]
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _exchangeApi: ExchangeApi

  public constructor(networkIds: number[], exchangeApi: ExchangeApi) {
    this.networkIds = networkIds
    this._exchangeApi = exchangeApi

    // Init the tokens by network
    this._tokensByNetwork = {}
    networkIds.forEach(networkId => {
      // initial value
      this._tokensByNetwork[networkId] = getTokensByNetwork(networkId)
    })
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId] || []
  }

  public async updateTokenIdsForNetwork(networkId: number): Promise<void> {
    // on every call fetch initial list again as tokens previously discarded might have been added to exchange
    const tokens = getTokensByNetwork(networkId)
    if (!tokens) {
      return
    }

    const tokenPromises = tokens.map(token => this.injectExchangeIdIntoToken(token))

    // Resolve promises and remove tokens which are not registered in the exchange
    this._tokensByNetwork[networkId] = (await Promise.all(tokenPromises)).filter(Boolean) as TokenDetails[]
  }

  private async injectExchangeIdIntoToken(token: TokenDetails): Promise<TokenDetails | null> {
    try {
      // Should throw when address not registered
      const exchangeId = await this._exchangeApi.getTokenIdByAddress(token.address)
      return { ...token, id: exchangeId }
    } catch (e) {
      log('Token not registered on the exchange %s', token.address, e)
      return null
    }
  }
}

export default TokenListApiImpl
