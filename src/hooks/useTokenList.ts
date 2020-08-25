import { useEffect, useMemo } from 'react'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'
import { getTokens, subscribeToTokenList } from 'services'
import { EMPTY_ARRAY } from 'const'
import stablecoins from 'data/stablecoinList'

export interface UseTokenListParams {
  networkId?: number
  excludeDeprecated?: boolean
  stablecoinList?: typeof stablecoins
}

function getNetworkCorrectStableCoinList(
  networkId: number | undefined,
  stablecoinList: typeof stablecoins,
): Map<string, number> | null {
  if (!networkId) return null

  const map: Map<string, number> = new Map()
  stablecoinList.forEach(({ priority, addresses }) => {
    if (addresses[networkId] && addresses[networkId].length) {
      addresses[networkId].forEach<string[]>((address: string) => map.set(address, priority))
    }
  })

  return map
}

export const useTokenList = ({
  networkId,
  stablecoinList = stablecoins,
  excludeDeprecated,
}: UseTokenListParams): TokenDetails[] => {
  // sync get tokenList
  const unfilteredTokens = networkId === undefined ? EMPTY_ARRAY : getTokens(networkId)
  const stablecoinMap = getNetworkCorrectStableCoinList(networkId, stablecoinList)

  const tokens = useMemo(() => {
    if (!excludeDeprecated) return unfilteredTokens

    const filteredTokens = unfilteredTokens.filter((token) => !token.disabled)
    // no networkId or map is empty as network id returns no tokens
    if (!stablecoinMap?.size) return filteredTokens

    // check token list against map and set prio
    return filteredTokens.map<TokenDetails>((token) =>
      Object.assign({}, token, { priority: stablecoinMap.get(token.address) }),
    )
  }, [stablecoinMap, excludeDeprecated, unfilteredTokens])

  // force update with a new value each time
  const [, forceUpdate] = useSafeState({})

  useEffect(() => {
    return subscribeToTokenList(() => forceUpdate({}))
  }, [forceUpdate])

  return tokens
}
