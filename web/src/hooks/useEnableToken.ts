import { assert } from '@gnosis.pm/dex-js'

import { TokenBalanceDetails, TxOptionalParams, Receipt } from 'types'
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
  const { userAddress, isConnected, networkId } = useWalletConnection()
  const { enabled: enabledInitial, address: tokenAddress } = params.tokenBalances
  const [enabled, setEnabled] = useSafeState(enabledInitial)
  const [enabling, setEnabling] = useSafeState(false)
  const { txOptionalParams } = params

  async function enableToken(): Promise<Receipt> {
    assert(!enabled && isConnected, 'The token was already enabled and/or user is not connected')
    assert(userAddress, 'User address not found. Please check wallet.')
    assert(networkId, 'NetworkId not found. Please check wallet.')

    setEnabling(true)

    // Set the allowance
    const contractAddress = networkId ? depositApi.getContractAddress(networkId) : null
    assert(contractAddress, 'Contract address not found. Please check wallet.')

    const receipt = await erc20Api.approve({
      userAddress,
      tokenAddress,
      spenderAddress: contractAddress,
      amount: ALLOWANCE_MAX_VALUE,
      networkId,
      txOptionalParams,
    })

    // Update the state
    setEnabled(true)
    setEnabling(false)

    return receipt
  }

  return { enabled, enabling, enableToken }
}
