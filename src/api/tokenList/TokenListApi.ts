import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'

export interface TokenList {
  getTokens: (networkId: number) => TokenDetails[]
}

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
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

  public async addTokenToList({ networkId, tokenAddress }: AddTokenParams): Promise<AddTokenResult> {
    const newToken = await getTokenFromExchangeByAddress({ networkId, tokenAddress })
    if (newToken) {
      logDebug('Added new Token to userlist', newToken)

      this._tokensByNetwork[networkId].push(newToken)
      this.persistUserTokenList(newToken, networkId)
    } else {
      logDebug('Token at address', tokenAddress, 'not available in Exchange contract')
    }
    return {
      success: !!newToken,
      tokenList: this.getTokens(networkId),
    }
  }

}

export default TokenListApiImpl
