import { useEffect, useMemo } from 'react'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'
import { getTokens, subscribeToTokenList } from 'services'
import { EMPTY_ARRAY } from 'const'
import { tokenListApi } from 'api'

export interface UseTokenListParams {
  networkId?: number
  excludeDeprecated?: boolean
}

export const useTokenList = ({ networkId, excludeDeprecated }: UseTokenListParams = {}): {
  tokens: TokenDetails[]
  isListReady: boolean
} => {
  // sync get tokenList
  const unfilteredTokens = networkId === undefined ? EMPTY_ARRAY : getTokens(networkId)

  const tokens = useMemo(() => {
    if (!excludeDeprecated) return unfilteredTokens
    const filteredList = unfilteredTokens.filter((token) => !token.disabled)

    return filteredList
  }, [excludeDeprecated, unfilteredTokens])

  // force update with a new value each time
  const [, forceUpdate] = useSafeState({})

  useEffect(() => {
    return subscribeToTokenList(() => forceUpdate({}))
  }, [forceUpdate])

  return { tokens, isListReady: tokenListApi.getIsListReady() }
}
