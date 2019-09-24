import { TokenList, TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'

function _getImageUrl(tokenAddress: string): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
}

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
      // Get list of tokens
      const tokens = getTokensByNetwork(networkId).map(token => {
        // Add image to the tokens
        return {
          ...token,
          image: _getImageUrl(token.addressMainnet),
        }
      })

      this._tokensByNetwork[networkId] = tokens
    })
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId]
  }
}

export default TokenListApiImpl
