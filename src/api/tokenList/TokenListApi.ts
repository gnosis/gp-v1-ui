import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'
import GenericSubscriptions, { SubscriptionsInterface } from './Subscriptions'

export interface TokenList extends SubscriptionsInterface<TokenDetails[]> {
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
  hasToken: (params: HasTokenParams) => boolean
}

export interface AddTokenParams {
  networkId: number
  token: TokenDetails
}

export interface HasTokenParams {
  networkId: number
  tokenAddress: string
}

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 */
export class TokenListApiImpl extends GenericSubscriptions<TokenDetails[]> implements TokenList {
  public networkIds: number[]
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _tokenAddressNetworkSet: Set<string>

  public constructor(networkIds: number[]) {
    super()

    this.networkIds = networkIds

    // Init the tokens by network
    this._tokensByNetwork = {}
    this._tokenAddressNetworkSet = new Set<string>()

    networkIds.forEach(networkId => {
      // initial value
      const tokenList = this.mergeTokenLists(getTokensByNetwork(networkId), this.loadUserTokenList(networkId))
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


  private mergeTokenLists(baseList: TokenDetails[], newList: TokenDetails[]): TokenDetails[] {
    const seenAddresses = new Set<string>()
    const result: TokenDetails[] = []

    baseList.concat(newList).forEach(token => {
      if (!seenAddresses.has(token.address.toLocaleLowerCase())) {
        seenAddresses.add(token.address.toLocaleLowerCase())
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

    this.triggerSubscriptions(this.getTokens(networkId))
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
}

export default TokenListApiImpl
