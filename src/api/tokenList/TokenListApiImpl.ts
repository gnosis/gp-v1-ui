import { TokenList, TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 * Gets the images from https://github.com/trustwallet/tokens
 */
export class TokenListApiImpl implements TokenList {
  public networkIds: number[]
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }

  public constructor(networkIds: number[]) {
    this.networkIds = networkIds

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
}

export default TokenListApiImpl
