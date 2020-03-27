import { useEffect } from 'react'
import { tokenListApi } from 'api'
import { TokenDetails } from 'types'
import useSafeState from './useSafeState'

export const useTokenList = (networkId: number): TokenDetails[] => {
  const [tokens, setTokens] = useSafeState(tokenListApi.getTokens(networkId))

  useEffect(() => {
    return tokenListApi.subscribe(setTokens)
  }, [networkId, setTokens])

  return tokens
}
