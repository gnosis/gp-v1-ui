import { Network, TokenDetails } from 'types'
import { getTokensByNetwork } from './tokenList'
import { logDebug } from 'utils'
import GenericSubscriptions, { SubscriptionsInterface } from './Subscriptions'
import { TokenDetailsConfigLegacy } from '@gnosis.pm/dex-js'
import quoteTokenPriorities from 'data/quoteTokenPriorities'
import { DISABLED_TOKEN_MAPS, EMPTY_ARRAY } from 'const'

const priosByNetwork = new Map<number, Map<string, number>>()

function getTokenPriorities(networkId: number | undefined): Map<string, number> | null {
  if (!networkId) return null

  const prioritiesCached = priosByNetwork.get(networkId)
  if (prioritiesCached) {
    return prioritiesCached
  }

  // Get the priorities for all tokens
  const priorities = new Map<string, number>()
  quoteTokenPriorities.forEach(({ priority, addresses }) => {
    if (addresses[networkId] && addresses[networkId].length) {
      addresses[networkId].forEach((address: string) => priorities.set(address.toLowerCase(), priority))
    }
  })

  // Cache priorities
  priosByNetwork.set(networkId, priorities)

  return priorities
}

function addAdditionalTokenDetails(networkId: number): (token: TokenDetails) => TokenDetails {
  const disabledTokensMap = DISABLED_TOKEN_MAPS[networkId]
  const prioritiesMap = getTokenPriorities(networkId)

  return (token: TokenDetails): TokenDetails => {
    // Add token override to tokens
    const tokenOverride = disabledTokensMap?.[token.address]
    if (tokenOverride) {
      token.override = tokenOverride
      token.disabled = true
      // override only keys present in both token and tokenOverride
      Object.keys(token).forEach((key) => {
        if (tokenOverride[key] !== undefined) token[key] = tokenOverride[key]
      })
    }

    // Add priority
    token.priority = prioritiesMap?.get(token.address.toLowerCase())

    return token
  }
}

export interface TokenList extends SubscriptionsInterface<TokenDetails[]> {
  setListReady: (state: boolean, networkId?: Network) => void
  getIsListReady: () => boolean
  isListReady: boolean
  getTokens: (networkId: number) => TokenDetails[]
  addToken: (params: AddTokenParams) => void
  addTokens: (params: AddTokensParams) => void
  hasToken: (params: HasTokenParams) => boolean

  persistTokens: (params: PersistTokensParams) => void
}

export interface TokenListApiParams {
  networkIds: number[]
  initialTokenList: TokenDetailsConfigLegacy[]
}

export interface AddTokenParams {
  networkId: number
  token: TokenDetails
}

export interface AddTokensParams {
  networkId: number
  tokens: TokenDetails[]
}

export interface HasTokenParams {
  networkId: number
  tokenAddress: string
}

export interface PersistTokensParams {
  networkId: number
  tokenList: TokenDetails[]
}

type tokenListType = 'user' | 'service'

/**
 * Basic implementation of Token API
 *
 * Has a pre-define list of tokens.
 */
export class TokenListApiImpl extends GenericSubscriptions<TokenDetails[]> implements TokenList {
  private _tokensByNetwork: { [networkId: number]: TokenDetails[] }
  private _tokenAddressNetworkSet: Set<string>

  // token list flag - prevents stale/incorrect data
  // from being presented during token list calculation
  public isListReady = true

  public constructor({ networkIds, initialTokenList }: TokenListApiParams) {
    super()

    // Init the tokens by network
    this._tokensByNetwork = {}
    this._tokenAddressNetworkSet = new Set<string>()

    networkIds.forEach((networkId) => {
      // initial value
      const tokenList = TokenListApiImpl.mergeTokenLists(
        // load first the local lists, as they might be more up to date
        this.loadTokenList(networkId, 'service'),
        this.loadTokenList(networkId, 'user'),
        // then default list
        getTokensByNetwork(networkId, initialTokenList),
      )
      this._tokensByNetwork[networkId] = TokenListApiImpl.extendTokensInList(
        tokenList,
        addAdditionalTokenDetails(networkId),
      )

      tokenList.forEach(({ address }) => {
        this._tokenAddressNetworkSet.add(
          TokenListApiImpl.constructAddressNetworkKey({ tokenAddress: address, networkId }),
        )
      })
    })
  }

  public setListReady(state: boolean, networkId?: Network): void {
    this.isListReady = state
    if (this.isListReady && networkId) {
      this.triggerSubscriptions(this._tokensByNetwork[networkId])
    }
  }

  public getIsListReady(): boolean {
    return this.isListReady
  }

  public hasToken(params: HasTokenParams): boolean {
    return this._tokenAddressNetworkSet.has(TokenListApiImpl.constructAddressNetworkKey(params))
  }

  public getTokens(networkId: number): TokenDetails[] {
    return this._tokensByNetwork[networkId] || EMPTY_ARRAY
  }

  private static mergeTokenLists(...lists: TokenDetails[][]): TokenDetails[] {
    const seenAddresses = new Set<string>()
    const result: TokenDetails[] = []

    lists
      .reduce((acc, list) => acc.concat(list), [])
      .forEach((token) => {
        const addressLower = token.address.toLowerCase()
        if (!seenAddresses.has(addressLower)) {
          seenAddresses.add(addressLower)
          result.push(token)
        }
      })
    return result
  }

  private static extendTokensInList(
    list: TokenDetails[],
    extensionFunction: (token: TokenDetails) => TokenDetails,
  ): TokenDetails[] {
    return list.map(extensionFunction)
  }

  private static constructAddressNetworkKey({ tokenAddress, networkId }: HasTokenParams): string {
    return tokenAddress.toLowerCase() + '|' + networkId
  }

  private static getStorageKey(networkId: number, type: tokenListType): string {
    return `${type.toString().toUpperCase()}_TOKEN_LIST_${networkId}`
  }

  public addToken({ networkId, token }: AddTokenParams): void {
    this.addTokens({ tokens: [token], networkId })
  }

  public addTokens({ tokens, networkId }: AddTokensParams): void {
    const addedTokens: TokenDetails[] = []
    tokens.forEach((token) => {
      const key = TokenListApiImpl.constructAddressNetworkKey({ tokenAddress: token.address, networkId })

      if (this._tokenAddressNetworkSet.has(key)) return
      logDebug('[TokenListApi]: Added new Token to userlist', token)

      this._tokenAddressNetworkSet.add(key)
      addedTokens.push(token)
    })
    if (addedTokens.length === 0) return

    const extendedTokens = TokenListApiImpl.extendTokensInList(addedTokens, addAdditionalTokenDetails(networkId))

    this._tokensByNetwork[networkId] = TokenListApiImpl.mergeTokenLists(
      this._tokensByNetwork[networkId],
      extendedTokens,
    )
    this.persistNewUserTokens(addedTokens, networkId)

    this.triggerSubscriptions(this._tokensByNetwork[networkId])
  }
  private loadTokenList(networkId: number, type: tokenListType): TokenDetails[] {
    const storageKey = TokenListApiImpl.getStorageKey(networkId, type)
    const listStringified = localStorage.getItem(storageKey)
    return listStringified ? JSON.parse(listStringified) : []
  }

  private persistNewUserTokens(tokens: TokenDetails[], networkId: number): void {
    const storageKey = TokenListApiImpl.getStorageKey(networkId, 'user')
    const listStringified = localStorage.getItem(storageKey)

    const currentUserList: TokenDetails[] = TokenListApiImpl.mergeTokenLists(
      listStringified ? JSON.parse(listStringified) : [],
      tokens,
    )

    localStorage.setItem(storageKey, JSON.stringify(currentUserList))
  }

  public persistTokens({ networkId, tokenList }: PersistTokensParams): void {
    // fetch list of user added tokens
    const userAddedTokens = this.loadTokenList(networkId, 'user')

    const extendedTokens = TokenListApiImpl.extendTokensInList(tokenList, addAdditionalTokenDetails(networkId))

    // update copy in memory, appending anything user might have added
    this._tokensByNetwork[networkId] = TokenListApiImpl.mergeTokenLists(extendedTokens, userAddedTokens)

    // update copy in local storage for service tokens
    const serviceStorageKey = TokenListApiImpl.getStorageKey(networkId, 'service')
    localStorage.setItem(serviceStorageKey, JSON.stringify(tokenList))

    // update address network set
    tokenList.forEach(({ address: tokenAddress }) =>
      this._tokenAddressNetworkSet.add(TokenListApiImpl.constructAddressNetworkKey({ tokenAddress, networkId })),
    )
    // notify subscribers
    this.triggerSubscriptions(tokenList)
  }
}

export default TokenListApiImpl
