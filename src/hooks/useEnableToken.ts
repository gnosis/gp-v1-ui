import { useState } from 'react'
import { erc20Api, depositApi, walletApi } from 'api'
import { TokenBalanceDetails } from 'types'
import { ALLOWANCE_VALUE } from 'const'

interface UseEnableTokensResult {
  enabled: boolean
  enabling: boolean
  enableToken(): Promise<void>
}

export const useEnableTokens = (tokenBalances: TokenBalanceDetails): UseEnableTokensResult => {
  const [enabled, setEnabled] = useState(tokenBalances.enabled)
  const [enabling, setEnabling] = useState(false)

  async function enableToken(): Promise<void> {
    setEnabling(true)
    // TODO: Review after implementing connect wallet.
    //   Probably some APIs should have an implicit user and it should be login aware
    walletApi.connect()

    const tokenAddress = tokenBalances.address
    const userAddress = await walletApi.getAddress()
    const contractAddress = depositApi.getContractAddress()
    await erc20Api.approve(tokenAddress, userAddress, contractAddress, ALLOWANCE_VALUE)
    setEnabled(true)
  }

  return { enabled, enabling, enableToken }
}
