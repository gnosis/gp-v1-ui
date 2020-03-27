import { useEffect } from 'react'
import { tokenListApi } from 'api'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'

export const useTokenList = (networkId?: number): TokenDetails[] => {
  const [tokens, setTokens] = useSafeState(networkId === undefined ? [] : tokenListApi.getTokens(networkId))

  useEffect(() => {
    if (networkId === undefined) return setTokens([])
    return tokenListApi.subscribe(setTokens)
  }, [networkId, setTokens])

  return tokens
}
