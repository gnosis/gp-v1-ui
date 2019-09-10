import { TokenApi, TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'

const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${name}/logo.png'

function _getImageUrl(tokenAddress: string): string {
  return IMAGE_BASE_URL.replace(/\${name}/, tokenAddress)
}

/**
 * Basic implemtation of Token API
 *
 * Has a pre-define list of tokens.
 * Get's the images from https://github.com/trustwallet/tokens
 */
export class TokenApiImpl implements TokenApi {
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

export default TokenApiImpl
