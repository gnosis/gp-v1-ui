import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'
import GenericSubscriptions, { SubscriptionsInterface } from './Subscriptions'

export interface TokenList extends SubscriptionsInterface<TokenDetails[]> {
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
  hasToken: (params: HasTokenParams) => boolean

  persistTokens: (params: PersistTokensParams) => void
}

export interface TokenListApiParams {
  networkIds: number[]
}

export interface AddTokenParams {
  networkId: number
  token: TokenDetails
}

export interface HasTokenParams {
  networkId: number
  tokenAddress: string
}

export interface PersistTokensParams {
  networkId: number
  tokenList: TokenDetails[]
}

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 */
export class TokenListApiImpl extends GenericSubscriptions<TokenDetails[]> implements TokenList {
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _tokenAddressNetworkSet: Set<string>

  public constructor({ networkIds }: TokenListApiParams) {
    super()

    // Init the tokens by network
    this._tokensByNetwork = {}
    this._tokenAddressNetworkSet = new Set<string>()

    networkIds.forEach(networkId => {
      // initial value
      const tokenList = TokenListApiImpl.mergeTokenLists(
        getTokensByNetwork(networkId),
        this.loadUserTokenList(networkId),
      )
      this._tokensByNetwork[networkId] = tokenList

      tokenList.forEach(({ address }) => {
        this._tokenAddressNetworkSet.add(
          TokenListApiImpl.constructAddressNetworkKey({ tokenAddress: address, networkId }),
        )
      })
    })
  }

  public hasToken(params: HasTokenParams): boolean {
    return this._tokenAddressNetworkSet.has(TokenListApiImpl.constructAddressNetworkKey(params))
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId] || []
  }

  private static mergeTokenLists(baseList: TokenDetails[], newList: TokenDetails[]): TokenDetails[] {
    const seenAddresses = new Set<string>()
    const result: TokenDetails[] = []

    baseList.concat(newList).forEach(token => {
      if (!seenAddresses.has(token.address.toLowerCase())) {
        seenAddresses.add(token.address.toLowerCase())
        result.push(token)
      }
    })
    return result
  }

  private static constructAddressNetworkKey({ tokenAddress, networkId }: HasTokenParams): string {
    return tokenAddress.toLowerCase() + '|' + networkId
  }

  private static getLocalStorageKey(networkId: number): string {
    return 'USER_TOKEN_LIST_' + networkId
  }

  public addToken({ networkId, token }: AddTokenParams): void {
    logDebug('[TokenListApi]: Added new Token to userlist', token)

    this._tokensByNetwork[networkId] = this._tokensByNetwork[networkId].concat(token)
    this._tokenAddressNetworkSet.add(
      TokenListApiImpl.constructAddressNetworkKey({ tokenAddress: token.address, networkId }),
    )
    this.persistNewUserToken(token, networkId)

    this.triggerSubscriptions(this._tokensByNetwork[networkId])
  }

  private loadUserTokenList(networkId: number): TokenDetails[] {
    const storageKey = TokenListApiImpl.getLocalStorageKey(networkId)
    const listStringified = localStorage.getItem(storageKey)
    return listStringified ? JSON.parse(listStringified) : []
  }

  private persistNewUserToken(token: TokenDetails, networkId: number): void {
    const storageKey = TokenListApiImpl.getLocalStorageKey(networkId)
    const listStringified = localStorage.getItem(storageKey)
    const currentUserList: TokenDetails[] = listStringified ? JSON.parse(listStringified) : []

    currentUserList.push(token)
    localStorage.setItem(storageKey, JSON.stringify(currentUserList))
  }

  public persistTokens({ networkId, tokenList }: PersistTokensParams): void {
    // update copy in memory
    this._tokensByNetwork[networkId] = tokenList
    // update copy in local storage
    const storageKey = TokenListApiImpl.getLocalStorageKey(networkId)
    localStorage.setItem(storageKey, JSON.stringify(tokenList))
    // notify subscribers
    this.triggerSubscriptions(tokenList)
  }
}

export default TokenListApiImpl
