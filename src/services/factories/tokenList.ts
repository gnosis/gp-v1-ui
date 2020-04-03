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

  interface GetTokenIdResult {
    value: number | null
    remove?: true
  }

  async function getTokenId(networkId: number, tokenAddress: string): Promise<GetTokenIdResult> {
    try {
      const hasToken = await exchangeApi.hasToken({ networkId, tokenAddress })
      if (!hasToken) {
        return { value: null, remove: true }
      }
      return { value: await exchangeApi.getTokenIdByAddress({ networkId, tokenAddress }) }
    } catch (e) {
      logDebug(`[network:${networkId}][address:${tokenAddress}] Failed to fetch id from contract`, e.message)
      return { value: null }
    }
  }

  async function updateTokenIds(networkId: number): Promise<void> {
    // Set as updated on start to prevent concurrent queries
    updatedIdsForNetwork.add(networkId)

    const promises = tokenListApi.getTokens(networkId).map(token => getTokenId(networkId, token.address))

    const results = await Promise.all(promises)

    let failedToUpdate = false

    const tokenList = results.reduce((tokens: TokenDetails[], result: GetTokenIdResult, index: number) => {
      if (result.value !== null) {
        // We got a result, yay
        const token = tokenListApi.getTokens(networkId)[index]
        token.id = result.value
        tokens.push(token)
      } else if (!result.remove) {
        // Failed to query, but don't remove from the list
        tokens.push(tokenListApi.getTokens(networkId)[index])
        // Try again next time
        // TODO: try again only for the ones that failed
        failedToUpdate = true
      }
      return tokens
    }, [])

    // If any token failed, clear flag to try again next time
    if (failedToUpdate) {
      updatedIdsForNetwork.delete(networkId)
      // TODO: update only the ones that failed
    }

    // persist
    tokenListApi.persistTokens({ networkId, tokenList })
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
