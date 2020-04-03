import { TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'
import GenericSubscriptions, { SubscriptionsInterface } from './Subscriptions'
import { ExchangeApi } from 'api/exchange/ExchangeApi'

export interface TokenList extends SubscriptionsInterface<TokenDetails[]> {
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
  hasToken: (params: HasTokenParams) => boolean
}

export interface TokenListApiParams {
  exchangeApi: ExchangeApi
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

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 */
export class TokenListApiImpl extends GenericSubscriptions<TokenDetails[]> implements TokenList {
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _tokenAddressNetworkSet: Set<string>
  private updatedIdsForNetwork: Set<number>
  private exchangeApi: ExchangeApi

  public constructor({ networkIds, exchangeApi }: TokenListApiParams) {
    super()

    this.exchangeApi = exchangeApi

    // Init the tokens by network
    this._tokensByNetwork = {}
    this._tokenAddressNetworkSet = new Set<string>()
    this.updatedIdsForNetwork = new Set<number>()

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
    if (!this.updatedIdsForNetwork.has(networkId)) {
      // update token ids from contract if this it has not updated successfully before, async
      this.updateTokenIds(networkId)
    }

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

  private persistTokensForNetwork(networkId: number): void {
    const storageKey = TokenListApiImpl.getLocalStorageKey(networkId)
    localStorage.setItem(storageKey, JSON.stringify(this._tokensByNetwork[networkId]))
  }

  private async getTokenId(networkId: number, tokenAddress: string): Promise<{ value: number | null; remove?: true }> {
    try {
      return { value: await this.exchangeApi.getTokenIdByAddress({ networkId, tokenAddress }) }
    } catch (e) {
      const value = null
      if (e.message.match(/Must have Address to get ID/)) {
        logDebug(
          `[network:${networkId}][address:${tokenAddress}] Address not registered on network, removing from the list`,
        )
        return { value, remove: true }
      } else {
        logDebug(`[network:${networkId}][address:${tokenAddress}] Failed to fetch id from contract`, e.message)
        return { value }
      }
    }
  }

  private async updateTokenIds(networkId: number): Promise<void> {
    // Set as updated on start to prevent concurrent queries
    this.updatedIdsForNetwork.add(networkId)

    const promises = this._tokensByNetwork[networkId].map(token => this.getTokenId(networkId, token.address))

    const results = await Promise.all(promises)

    let failedToUpdate = false

    const updatedTokenList = results.reduce(
      (tokens: TokenDetails[], result: { value: number | null; remove?: true }, index: number) => {
        if (result.value !== null) {
          // We got a result, yay
          const token = this._tokensByNetwork[networkId][index]
          token.id = result.value
          tokens.push(token)
        } else if (!result.remove) {
          // Failed to query, but don't remove from the list
          tokens.push(this._tokensByNetwork[networkId][index])
          // Try again next time
          // TODO: try again only for the ones that failed
          failedToUpdate = true
        }
        return tokens
      },
      [],
    )

    this._tokensByNetwork[networkId] = updatedTokenList

    // If any token failed, clear flag to try again next time
    if (failedToUpdate) {
      this.updatedIdsForNetwork.delete(networkId)
      // TODO: update only the ones that failed
    }

    // persist
    this.persistTokensForNetwork(networkId)

    // update subscribers
    this.triggerSubscriptions(this._tokensByNetwork[networkId])
  }
}

export default TokenListApiImpl
