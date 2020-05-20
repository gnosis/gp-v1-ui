import { TokenList } from 'api/tokenList/TokenListApi'
import { SubscriptionCallback } from 'api/tokenList/Subscriptions'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { TcrApi } from 'api/tcr/TcrApi'
import { TokenDetails, Command } from 'types'
import { logDebug, retry } from 'utils'

import { TokenFromErc20Params, TokenFromErc20 } from './'

interface Injects {
  getTokenFromErc20(params: TokenFromErc20Params): Promise<TokenFromErc20>
}

export function getTokensFactory(
  factoryParams: {
    tokenListApi: TokenList
    exchangeApi: ExchangeApi
    tcrApi?: TcrApi
  },
  injects: Injects,
): (tokenId: number) => TokenDetails[] {
  const { tokenListApi, exchangeApi, tcrApi } = factoryParams
  const { getTokenFromErc20 } = injects

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
          t => t.address,
        )}`,
      )
    }

    const promises = tokens.map(token => updateTokenIdOrIndicateFailure(networkId, token))

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

  async function getErc20DetailsOrAddress(networkId: number, tokenAddress: string): Promise<TokenFromErc20 | string> {
    // Simple wrapper function to return original address instead of null for make logging easier
    const erc20Details = await getTokenFromErc20({ networkId, tokenAddress })
    return erc20Details || tokenAddress
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

  async function updateTokenDetails(networkId: number, numTokens: number): Promise<void> {
    const [tcrAddressesSet, addressesAndIds] = await Promise.all([
      // Fetch addresses from TCR
      retry(() => fetchTcrAddresses(networkId)),
      // Fetch addresses from contract given numTokens count
      retry(() => fetchAddressesAndIds(networkId, numTokens)),
    ])

    logDebug(`[tokenListFactory][${networkId}] TCR contains ${tcrAddressesSet.size} addresses`)

    logDebug(`[tokenListFactory][${networkId}] Token id and address mapping:`)
    addressesAndIds.forEach((id, address) => {
      // Remove addresses that are not on the TCR, if any
      let removed = false
      if (tcrAddressesSet.size > 0 && !tcrAddressesSet.has(address)) {
        addressesAndIds.delete(address)
        removed = true
      }
      logDebug(`[tokenListFactory][${networkId}] ${id} : ${address}. On TCR? ${!removed}`)
    })

    // Create a map of current token list addresses and tokens
    const localAddressesMap = new Map<string, TokenDetails>(
      tokenListApi
        // Get a copy of the current token list
        .getTokens(networkId)
        // Remove tokens that are on the list but not registered on the contract neither on TCR
        .filter(({ address }) => addressesAndIds.has(address))
        // Map it with token address as key for easy access
        .map(token => [token.address, token]),
    )

    const promises: Promise<TokenFromErc20 | string>[] = []

    // Go over all value (id) and key (tokenAddress) pairs registered on the contract
    addressesAndIds.forEach((id, tokenAddress) => {
      if (!localAddressesMap.has(tokenAddress)) {
        // New token not in our local list, fetch erc20 details for it
        logDebug(`[tokenListFactory][${networkId}] Address ${tokenAddress} with id ${id} not in local list, fetching`)
        promises.push(getErc20DetailsOrAddress(networkId, tokenAddress))
      } else {
        // Token already exists, update id
        logDebug(`[tokenListFactory][${networkId}] Address ${tokenAddress} already in the list, updating id to ${id}`)
        const token = localAddressesMap.get(tokenAddress) as TokenDetails
        token.id = id
      }
    })

    const partialTokens = await Promise.all(promises)

    // For all newly fetched tokens
    partialTokens.forEach(partialToken => {
      if (typeof partialToken === 'string') {
        // We replaced potential null responses with original tokenAddress string for logging purposes
        logDebug(`[tokenListFactory][${networkId}] Address ${partialToken} is not a valid ERC20 token`)
      } else if (partialToken) {
        // If we got a valid response
        logDebug(
          `[tokenListFactory][${networkId}] Got details for address ${partialToken.address}: symbol '${partialToken.symbol}' name '${partialToken.name}'`,
        )
        // Get id from address/id mapping
        const id = addressesAndIds.get(partialToken.address) as number
        // build token object
        const token: TokenDetails = { ...partialToken, id }
        // add to local address map
        localAddressesMap.set(partialToken.address, token)
      }
    })

    // Convert map values to a list. Map keeps insertion order, so new tokens are added at the end
    const tokenList = Array.from(localAddressesMap.values())

    // Persist it \o/
    tokenListApi.persistTokens({ networkId, tokenList })
  }

  async function updateTokens(networkId: number): Promise<void> {
    areTokensUpdated.add(networkId)

    try {
      const numTokens = await retry(() => exchangeApi.getNumTokens(networkId))
      const tokens = tokenListApi.getTokens(networkId)

      logDebug(`[tokenListFactory][${networkId}] Contract has ${numTokens}; local list has ${tokens.length}`)
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
    }
  }

  return function(networkId: number): TokenDetails[] {
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
  return function(callback: SubscriptionCallback<TokenDetails[]>): Command {
    return tokenListApi.subscribe(callback)
  }
}
