import { useEffect } from 'react'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'
import { getTokens, subscribeToTokenList } from 'services'

// for stable reference
// to avoid updates on setState([])
const emptyArray: TokenDetails[] = []

export const useTokenList = (networkId?: number): TokenDetails[] => {
  const [tokens, setTokens] = useSafeState(networkId === undefined ? emptyArray : getTokens(networkId))

  useEffect(() => {
    if (networkId === undefined) return setTokens(emptyArray)
    return subscribeToTokenList(setTokens)
  }, [networkId, setTokens])

  return tokens
}
