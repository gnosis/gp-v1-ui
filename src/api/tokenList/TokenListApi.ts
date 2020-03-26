import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'

export interface TokenList {
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
}

export interface AddTokenParams {
  networkId: number
  token: TokenDetails
}

const getUserTokenListName = (networkId: number): string => 'USER_TOKEN_LIST_' + networkId

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
      this._tokensByNetwork[networkId] = getTokensByNetwork(networkId).concat(this.loadUserTokenList(networkId))
    })
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId] || []
  }

  public async addTokenToList({ networkId, tokenAddress }: AddTokenParams): Promise<AddTokenResult> {
    const newToken = await getTokenFromExchangeByAddress({ networkId, tokenAddress })
    if (newToken) {
      logDebug('Added new Token to userlist', newToken)

  public addToken({ networkId, token }: AddTokenParams): void {
    logDebug('Added new Token to userlist', token)

    this._tokensByNetwork[networkId].push(token)
    this.persistUserTokenList(token, networkId)
    // return this.getTokens(networkId)
  }

  private loadUserTokenList(networkId: number): TokenDetails[] {
    const storageKey = getUserTokenListName(networkId)
    const listStringified = localStorage.getItem(storageKey)
    return listStringified ? JSON.parse(listStringified) : []
  }

  private persistUserTokenList(token: TokenDetails, networkId: number): void {
    const storageKey = getUserTokenListName(networkId)
    const listStringified = localStorage.getItem(storageKey)
    const currentUserList: TokenDetails[] = listStringified ? JSON.parse(listStringified) : []

    currentUserList.push(token)
    localStorage.setItem(storageKey, JSON.stringify(currentUserList))
  }
}

export default TokenListApiImpl
