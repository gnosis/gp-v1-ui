import { useEffect, useMemo } from 'react'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'
import { getTokens, subscribeToTokenList } from 'services'
import { EMPTY_ARRAY } from 'const'
import quoteTokenPriorities from 'data/quoteTokenPriorities'

export interface UseTokenListParams {
  networkId?: number
  excludeDeprecated?: boolean
  quoteTokenPrioritiesList?: typeof quoteTokenPriorities
}

function getNetworkCorrectStableCoinList(
  networkId: number | undefined,
  quoteTokenPrioritiesList: typeof quoteTokenPriorities,
): Map<string, number> | null {
  if (!networkId) return null

  const map: Map<string, number> = new Map()
  quoteTokenPrioritiesList.forEach(({ priority, addresses }) => {
    if (addresses[networkId] && addresses[networkId].length) {
      addresses[networkId].forEach<string[]>((address: string) => map.set(address.toLowerCase(), priority))
    }
  })

  return map
}

export const useTokenList = ({
  networkId,
  quoteTokenPrioritiesList = quoteTokenPriorities,
  excludeDeprecated,
}: UseTokenListParams): TokenDetails[] => {
  // sync get tokenList
  const unfilteredTokens = networkId === undefined ? EMPTY_ARRAY : getTokens(networkId)

  const tokens = useMemo(() => {
    if (!excludeDeprecated) return unfilteredTokens

    const stablecoinMap = getNetworkCorrectStableCoinList(networkId, quoteTokenPrioritiesList)
    const filteredTokens = unfilteredTokens.filter((token) => !token.disabled)

    // no networkId or map is empty as network id returns no tokens
    if (!stablecoinMap?.size) return filteredTokens

    // check token list against map and set prio
    return filteredTokens.map<TokenDetails>((token) =>
      Object.assign({}, token, { priority: stablecoinMap.get(token.address.toLowerCase()) }),
    )
  }, [excludeDeprecated, unfilteredTokens, networkId, quoteTokenPrioritiesList])

  // force update with a new value each time
  const [, forceUpdate] = useSafeState({})

  useEffect(() => {
    return subscribeToTokenList(() => forceUpdate({}))
  }, [forceUpdate])

  return tokens
}
