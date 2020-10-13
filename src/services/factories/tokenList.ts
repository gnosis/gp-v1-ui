import { TokenList } from 'api/tokenList/TokenListApi'
import { SubscriptionCallback } from 'api/tokenList/Subscriptions'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { TcrApi } from 'api/tcr/TcrApi'
import { TokenDetails, Command, Network } from 'types'
import { logDebug, notEmpty, retry } from 'utils'

import { TokenFromErc20Params } from './'
import { safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import { WETH_ADDRESS_MAINNET, WETH_ADDRESS_RINKEBY, WETH_ADDRESS_XDAI, WXDAI_ADDRESS_XDAI } from 'const'

export function getTokensFactory(factoryParams: {
  tokenListApi: TokenList
  exchangeApi: ExchangeApi
  tcrApi?: TcrApi
  getTokenFromErc20: (params: TokenFromErc20Params) => Promise<TokenErc20 | null>
}): (networkId: number) => TokenDetails[] {
  const { tokenListApi, exchangeApi, tcrApi, getTokenFromErc20 } = factoryParams

  // Set containing ids for networks which we successfully updated the tokens from the contract
  const areTokensUpdated = new Set<number>()

  interface UpdateTokenIdResult {
    token: TokenDetails
    remove?: true
    failed?: true
  }

  async function updateTokenIdOrIndicateFailure(networkId: number, token: TokenDetails): Promise<UpdateTokenIdResult> {
    try {
      const hasToken = await exchangeApi.hasToken({ networkId, tokenAddress: token.address })
      if (!hasToken) {
        return { token, remove: true }
      }
      token.id = await exchangeApi.getTokenIdByAddress({ networkId, tokenAddress: token.address })
      return { token }
    } catch (e) {
      logDebug(`[tokenListFactory][${networkId}][address:${token.address}] Failed to fetch id from contract`, e.message)
      return { token, failed: true }
    }
  }

  async function updateTokenIds(
    networkId: number,
    tokens: TokenDetails[],
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackOff = true,
  ): Promise<void> {
    if (maxRetries <= 0) {
      throw new Error(
        `[network:${networkId}] Max retries exceeded trying to fetch token ids for tokens ${tokens.map(
          (t) => t.address,
        )}`,
      )
    }

    const promises = tokens.map((token) => updateTokenIdOrIndicateFailure(networkId, token))

    const results = await Promise.all(promises)

    const updated = new Map<string, TokenDetails>()
    const failedToUpdate: TokenDetails[] = []
    const toRemove = new Set<string>()

    // classify results into map/list/set for easier access
    results.forEach(({ token, remove, failed }) => {
      if (remove) {
        toRemove.add(token.address)
      } else if (failed) {
        failedToUpdate.push(token)
      } else {
        updated.set(token.address, token)
      }
    })

    // only bother update the list if there was anything updated/removed
    if (toRemove.size > 0 || updated.size > 0) {
      logDebug(`[tokenListFactory][${networkId}] Updated ${updated.size} ids and removed ${toRemove.size} tokens`)
      // build a new list from current list of tokens
      const tokenList = tokenListApi.getTokens(networkId).reduce<TokenDetails[]>((acc, token) => {
        if (toRemove.has(token.address)) {
          // removing tokens not registered in the exchange for this network
          return acc
        } else {
          // changed or old token
          acc.push(updated.get(token.address) || token)
        }
        return acc
      }, [])

      // persist updated list
      tokenListApi.persistTokens({ networkId, tokenList })
    }

    // if something failed...
    if (failedToUpdate.length > 0) {
      logDebug(
        `[tokenListFactory][${networkId}] Failed to fetch ids for ${failedToUpdate.length} tokens. Trying again in ${retryDelay}ms`,
      )
      // calculate how long to wait next time
      const nextDelay = retryDelay * (exponentialBackOff ? 2 : 1)
      // try again failed tokens after retryDelay
      setTimeout(() => updateTokenIds(networkId, failedToUpdate, maxRetries - 1, nextDelay), retryDelay)
    }
  }

  async function getErc20DetailsOrAddress(networkId: number, tokenAddress: string): Promise<TokenErc20 | null> {
    // Simple wrapper function to return original address instead of null for make logging easier
    return getTokenFromErc20({ networkId, tokenAddress })
  }

  async function fetchAddressesAndIds(networkId: number, numTokens: number): Promise<Map<string, number>> {
    logDebug(`[tokenListFactory][${networkId}] Fetching addresses for ids from 0 to ${numTokens - 1}`)

    const promises = Array.from(
      { length: numTokens },
      async (_, tokenId): Promise<[string, number]> => {
        const tokenAddress = await exchangeApi.getTokenAddressById({ networkId, tokenId })
        return [tokenAddress, tokenId]
      },
    )

    const tokenAddressIdPairs = await Promise.all(promises)

    return new Map(tokenAddressIdPairs)
  }

  async function fetchTcrAddresses(networkId: number): Promise<Set<string>> {
    return new Set(tcrApi && (await tcrApi.getTokens(networkId)))
  }

  async function _getFilteredIdsMap(
    networkId: number,
    numTokens: number,
    tokensConfig: TokenDetails[],
  ): Promise<Map<string, number>> {
    const [tcrAddressesSet, listedAddressesAndIds] = await Promise.all([
      // Fetch addresses from TCR
      retry(() => fetchTcrAddresses(networkId)),
      // Fetch addresses from contract given numTokens count
      retry(() => fetchAddressesAndIds(networkId, numTokens)),
    ])

    let filteredAddressAndIds: [string, number][]
    if (tcrAddressesSet.size > 0) {
      // If filtering by TCR
      logDebug(`[tokenListFactory][${networkId}] TCR contains ${tcrAddressesSet.size} addresses`)
      logDebug(`[tokenListFactory][${networkId}] Token id and address mapping:`)
      filteredAddressAndIds = Array.from(listedAddressesAndIds.entries()).filter(([address, id]) => {
        // Remove addresses that are not on the TCR, if any
        const isInTcr = tcrAddressesSet.has(address)
        logDebug(`[tokenListFactory][${networkId}] ${id} : ${address}. On TCR? ${isInTcr}`)
        return isInTcr
      })
    } else {
      // If not using a TCR, filter by default list
      logDebug(`[tokenListFactory][${networkId}] Not using a TCR. Filtering by tokens in the config file`)
      filteredAddressAndIds = tokensConfig
        .map((token): [string, number] | null => {
          const tokenId = listedAddressesAndIds.get(token.address)
          return tokenId !== undefined ? [token.address, tokenId] : null
        })
        .filter(notEmpty)
    }

    return new Map<string, number>(filteredAddressAndIds)
  }

  async function _fetchTokenDetails(
    networkId: number,
    addressToIdMap: Map<string, number>,
    tokensConfig: TokenDetails[],
  ): Promise<TokenDetails[]> {
    const tokensConfigMap = new Map(tokensConfig.map((t) => [t.address, t]))
    const tokenDetailsPromises: Promise<TokenDetails | undefined>[] = []

    async function _fillToken(id: number, tokenAddress: string): Promise<TokenDetails | undefined> {
      // Resolve the details using the config, otherwise fetch the token
      const token = tokensConfigMap.get(tokenAddress) || (await _fetchToken(networkId, id, tokenAddress))

      if (token) {
        token.label = safeTokenName(token)
        // TODO: review this
        // needs to be here to set correct IDs when using default initialTokenList
        // from config as the IDs there are not correct
        token.id =
          addressToIdMap.get(token.address) !== token.id ? (addressToIdMap.get(token.address) as number) : token.id
      }

      return token
    }

    addressToIdMap.forEach((id, tokenAddress) => {
      tokenDetailsPromises.push(_fillToken(id, tokenAddress))
    })

    return (await Promise.all(tokenDetailsPromises)).filter(notEmpty)
  }

  type TokenComparator = (a: TokenDetails, b: TokenDetails) => number

  function _createTokenComparator(networkId: number): TokenComparator {
    let comparator: TokenComparator
    // allows correct unicode comparison
    const compareByLabel: TokenComparator = (a, b) => a.label.localeCompare(b.label)

    switch (networkId) {
      case Network.Mainnet:
        comparator = (a, b): number => {
          // WETH first
          if (a.address === WETH_ADDRESS_MAINNET) return -1
          if (b.address === WETH_ADDRESS_MAINNET) return 1
          return compareByLabel(a, b)
        }
        break
      case Network.Rinkeby:
        comparator = (a, b): number => {
          // WETH first
          if (a.address === WETH_ADDRESS_RINKEBY) return -1
          if (b.address === WETH_ADDRESS_RINKEBY) return 1
          return compareByLabel(a, b)
        }
        break
      case Network.xDAI:
        comparator = (a, b): number => {
          // WXDAI before WETH
          if (a.address === WXDAI_ADDRESS_XDAI && b.address === WETH_ADDRESS_XDAI) return -1
          // WETH after WXDAI
          if (a.address === WETH_ADDRESS_XDAI && b.address === WXDAI_ADDRESS_XDAI) return 1
          // WXDAI and WETH first
          if (a.address === WXDAI_ADDRESS_XDAI) return -1
          if (b.address === WXDAI_ADDRESS_XDAI) return 1
          if (a.address === WETH_ADDRESS_XDAI) return -1
          if (b.address === WETH_ADDRESS_XDAI) return 1
          return compareByLabel(a, b)
        }
        break
      default:
        comparator = compareByLabel
    }

    return comparator
  }

  async function _fetchToken(
    networkId: number,
    tokenId: number,
    tokenAddress: string,
  ): Promise<TokenDetails | undefined> {
    const partialToken = await getErc20DetailsOrAddress(networkId, tokenAddress)

    if (!partialToken) {
      logDebug(`[tokenListFactory][${networkId}] Address ${partialToken} is not a valid ERC20 token`)
      return
    }

    logDebug(
      `[tokenListFactory][${networkId}] Got details for address ${partialToken.address}: symbol '${partialToken.symbol}' name '${partialToken.name}'`,
    )

    return {
      ...partialToken,
      id: tokenId,
      label: '', // Label is not nullable for convenience, but it's added later. This adds a default for making TS happy
    }
  }

  async function updateTokenDetails(networkId: number, numTokens: number): Promise<void> {
    const tokensConfig = tokenListApi.getTokens(networkId)

    // Get filtered ids and addresses
    const filteredAddressesAndIds = await _getFilteredIdsMap(networkId, numTokens, tokensConfig)

    // Get token details for each filtered token
    const tokenDetails = await _fetchTokenDetails(networkId, filteredAddressesAndIds, tokensConfig)

    // Sort tokens
    // note that sort mutates tokenDetails
    // but it's ok as tokenDetails is a newly created array
    tokenDetails.sort(_createTokenComparator(networkId))

    // Persist it
    tokenListApi.persistTokens({ networkId, tokenList: tokenDetails })
  }

  async function updateTokens(networkId: number): Promise<void> {
    areTokensUpdated.add(networkId)

    try {
      // Set token list readiness to false
      // and prevent stale data being presented in app
      tokenListApi.setListReady(false)

      const numTokens = await retry(() => exchangeApi.getNumTokens(networkId))
      const tokens = tokenListApi.getTokens(networkId)

      logDebug(`[tokenListFactory][${networkId}] Contract has ${numTokens}; local list has ${tokens.length}`)

      // TODO: review this logic
      // why update tokenDetails when token list lengths don't match?
      // why would token IDs not also need to be updated?
      if (numTokens > tokens.length) {
        // When there are more tokens in the contract than locally, fetch the new tokens
        await updateTokenDetails(networkId, numTokens)
      } else {
        // Otherwise, only update the ids
        await updateTokenIds(networkId, tokens)
      }
    } catch (e) {
      // Failed to update after retries.
      logDebug(`[tokenListFactory][${networkId}] Failed to update tokens: ${e.message}`)
      // Clear flag so on next query we try again.
      areTokensUpdated.delete(networkId)
    } finally {
      tokenListApi.setListReady(true)
    }
  }

  return function (networkId: number): TokenDetails[] {
    if (!areTokensUpdated.has(networkId)) {
      logDebug(`[tokenListFactory][${networkId}] Will update tokens for network`)
      updateTokens(networkId)
    }
    return tokenListApi.getTokens(networkId)
  }
}

export function subscribeToTokenListFactory(factoryParams: {
  tokenListApi: TokenList
}): (callback: SubscriptionCallback<TokenDetails[]>) => Command {
  const { tokenListApi } = factoryParams
  return function (callback: SubscriptionCallback<TokenDetails[]>): Command {
    return tokenListApi.subscribe(callback)
  }
}
