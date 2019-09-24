import { useState, useEffect } from 'react'
import { erc20Api, depositApi, walletApi } from 'api'
import { TokenBalanceDetails, TxOptionalParams, TxResult } from 'types'
import { ALLOWANCE_VALUE } from 'const'
import assert from 'assert'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  enabled: boolean
  enabling: boolean
  highlight: boolean
  enableToken(): Promise<TxResult<boolean>>
}

export const useEnableTokens = (params: Params): Result => {
  const { enabled: enabledInitial, address: tokenAddress } = params.tokenBalances
  const [enabled, setEnabled] = useState(enabledInitial)
  const [enabling, setEnabling] = useState(false)
  const [highlight, setHighlight] = useState(false)
  let unmounted = false

  useEffect(() => {
    return function cleanup(): void {
      unmounted = true
    }
  }, [])

  async function enableToken(): Promise<TxResult<boolean>> {
    assert(!enabled, 'The token was already enabled')

    setEnabling(true)
    // TODO: Review after implementing connect wallet.
    //   Probably some APIs should have an implicit user and it should be login aware
    walletApi.connect()

    // Set the allowance
    const userAddress = await walletApi.getAddress()
    const contractAddress = depositApi.getContractAddress()
    const result = await erc20Api.approve(
      tokenAddress,
      userAddress,
      contractAddress,
      ALLOWANCE_VALUE,
      params.txOptionalParams,
    )

    if (!unmounted) {
      // Update the state
      setEnabled(true)
      setEnabling(false)

      // Highlight the token for some seconds
      setHighlight(true)
      setTimeout(() => {
        if (!unmounted) {
          setHighlight(false)
        }
      }, 5000)
    }

    return result
  }

  return { enabled, enabling, highlight, enableToken }
}
