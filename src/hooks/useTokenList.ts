import { useEffect } from 'react'
import { tokenListApi } from 'api'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'

// for stable reference
// to avoid updates on setState([])
const emptyArray: TokenDetails[] = []

export const useTokenList = (networkId?: number): TokenDetails[] => {
  const [tokens, setTokens] = useSafeState(networkId === undefined ? emptyArray : tokenListApi.getTokens(networkId))

  useEffect(() => {
    if (networkId === undefined) return setTokens(emptyArray)
    return tokenListApi.subscribe(setTokens)
  }, [networkId, setTokens])

  return tokens
}
