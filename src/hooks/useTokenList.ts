import { useEffect, useMemo } from 'react'
import { TokenDetails, Network } from 'types'
import useSafeState from './useSafeState'
import { getTokens, subscribeToTokenList } from 'services'
import { DISABLED_TOKEN_MAPS } from 'const'
import { AddressToOverrideMap } from 'types/config'

// for stable reference
// to avoid updates on setState([])
const emptyArray: TokenDetails[] = []
const emptyObject: AddressToOverrideMap = {}

interface UseTokenListResult {
  tokenList: TokenDetails[]
  disabledTokensMap: AddressToOverrideMap
}

export const useTokenList = (networkId?: number, excludeDisabled?: boolean): UseTokenListResult => {
  // sync get tokenList
  const unfilteredTokens = networkId === undefined ? emptyArray : getTokens(networkId)
  const disabledTokensMap = DISABLED_TOKEN_MAPS[networkId || Network.Mainnet] || emptyObject

  const tokens = useMemo(() => {
    if (!excludeDisabled) return unfilteredTokens
    return unfilteredTokens.filter(token => !disabledTokensMap[token.address])
  }, [disabledTokensMap, excludeDisabled, unfilteredTokens])

  // force update with a new value each time
  const [, forceUpdate] = useSafeState({})

  useEffect(() => {
    return subscribeToTokenList(() => forceUpdate({}))
  }, [forceUpdate])

  return { tokenList: tokens, disabledTokensMap }
}
