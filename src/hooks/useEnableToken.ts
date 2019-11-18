import { TokenBalanceDetails, TxOptionalParams, Receipt } from 'types'
import assert from 'assert'
import { erc20Api, depositApi } from 'api'

import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'

import { ALLOWANCE_MAX_VALUE } from 'const'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  enabled: boolean
  enabling: boolean
  enableToken(): Promise<Receipt>
}

export const useEnableTokens = (params: Params): Result => {
  const { userAddress, isConnected } = useWalletConnection()
  const { enabled: enabledInitial, address: tokenAddress } = params.tokenBalances
  const [enabled, setEnabled] = useSafeState(enabledInitial)
  const [enabling, setEnabling] = useSafeState(false)

  async function enableToken(): Promise<Receipt> {
    assert(!enabled, 'The token was already enabled')
    assert(isConnected, "There's no connected wallet")

    setEnabling(true)

    // Set the allowance
    const contractAddress = depositApi.getContractAddress()
    const receipt = await erc20Api.approve(
      userAddress,
      tokenAddress,
      contractAddress,
      ALLOWANCE_MAX_VALUE,
      params.txOptionalParams,
    )

    // Update the state
    setEnabled(true)
    setEnabling(false)

    return receipt
  }

  return { enabled, enabling, enableToken }
}
