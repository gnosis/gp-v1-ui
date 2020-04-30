import { TokenList } from 'api/tokenList/TokenListApi'
import { SubscriptionCallback } from 'api/tokenList/Subscriptions'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { TokenDetails, Command } from 'types'
import { logDebug } from 'utils'

export function getTokensFactory(factoryParams: {
  tokenListApi: TokenList
  exchangeApi: ExchangeApi
}): (tokenId: number) => TokenDetails[] {
  const { tokenListApi, exchangeApi } = factoryParams

  const updatedIdsForNetwork = new Set<number>()

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
      logDebug(`[network:${networkId}][address:${token.address}] Failed to fetch id from contract`, e.message)
      return { token, failed: true }
    }
  }

  async function updateWithRetries(
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
      logDebug(`[network:${networkId}] Updated ${updated.size} ids and removed ${toRemove.size} tokens`)
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
        `[network:${networkId}] Failed to fetch ids for ${failedToUpdate.length} tokens. Trying again in ${retryDelay}ms`,
      )
      // calculate how long to wait next time
      const nextDelay = retryDelay * (exponentialBackOff ? 2 : 1)
      // try again failed tokens after retryDelay
      setTimeout(() => updateWithRetries(networkId, failedToUpdate, maxRetries - 1, nextDelay), retryDelay)
    }
  }

  async function updateTokenIds(networkId: number): Promise<void> {
    // Set as updated on start to prevent concurrent queries
    updatedIdsForNetwork.add(networkId)

    try {
      await updateWithRetries(networkId, tokenListApi.getTokens(networkId))
    } catch (e) {
      // Failed to update after retries.
      logDebug(e.message)
      // Clear flag so on next query we try again.
      updatedIdsForNetwork.delete(networkId)
    }
  }

  return function(networkId: number): TokenDetails[] {
    if (!updatedIdsForNetwork.has(networkId)) {
      updateTokenIds(networkId)
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
