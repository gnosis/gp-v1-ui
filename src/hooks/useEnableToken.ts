import { useState, useEffect, useRef } from 'react'
import { erc20Api, depositApi } from 'api'
import { TokenBalanceDetails, TxOptionalParams, TxResult } from 'types'
import { ALLOWANCE_MAX_VALUE } from 'const'
import assert from 'assert'
import { useWalletConnection } from './useWalletConnection'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  enabled: boolean
  enabling: boolean
  enableToken(): Promise<TxResult<boolean>>
}

export const useEnableTokens = (params: Params): Result => {
  const { userAddress, isConnected } = useWalletConnection()
  const { enabled: enabledInitial, address: tokenAddress } = params.tokenBalances
  const [enabled, setEnabled] = useState(enabledInitial)
  const [enabling, setEnabling] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    return function cleanup(): void {
      mounted.current = false
    }
  }, [])

  async function enableToken(): Promise<TxResult<boolean>> {
    assert(!enabled, 'The token was already enabled')
    assert(isConnected, "There's no connected wallet")

    setEnabling(true)

    // Set the allowance
    const contractAddress = depositApi.getContractAddress()
    const result = await erc20Api.approve(
      userAddress,
      tokenAddress,
      contractAddress,
      ALLOWANCE_MAX_VALUE,
      params.txOptionalParams,
    )

    if (mounted.current) {
      // Update the state
      setEnabled(true)
      setEnabling(false)
    }

    return result
  }

  return { enabled, enabling, enableToken }
}
