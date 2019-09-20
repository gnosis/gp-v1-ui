import { useState } from 'react'
import { erc20Api, depositApi, walletApi } from 'api'
import { TokenBalanceDetails } from 'types'
import { ALLOWANCE_VALUE } from 'const'
import assert from 'assert'

interface UseEnableTokensResult {
  enabled: boolean
  enabling: boolean
  highlight: boolean
  enableToken(): Promise<void>
}

export const useEnableTokens = (tokenBalances: TokenBalanceDetails): UseEnableTokensResult => {
  const [enabled, setEnabled] = useState(tokenBalances.enabled)
  const [enabling, setEnabling] = useState(false)
  const [highlight, setHightlight] = useState(false)

  async function enableToken(): Promise<void> {
    assert(!enabled, 'The token was already enabled')

    setEnabling(true)
    // TODO: Review after implementing connect wallet.
    //   Probably some APIs should have an implicit user and it should be login aware
    walletApi.connect()

    // Set the allowance
    const tokenAddress = tokenBalances.address
    const userAddress = await walletApi.getAddress()
    const contractAddress = depositApi.getContractAddress()
    await erc20Api.approve(tokenAddress, userAddress, contractAddress, ALLOWANCE_VALUE)

    // Update the state
    setEnabled(true)
    setEnabling(false)

    // Highlight the token for some seconds
    setHightlight(true)
    setTimeout(() => {
      setHightlight(false)
    }, 5000)
  }

  return { enabled, enabling, highlight, enableToken }
}
