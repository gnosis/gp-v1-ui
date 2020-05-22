import { TokenBalanceDetails, TxOptionalParams, Receipt } from 'types'
import { assert } from '@gnosis.pm/dex-js'
import { depositApi } from 'api'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  claiming: boolean
  withdraw(): Promise<Receipt>
}

export const useWithdrawTokens = (params: Params): Result => {
  const { userAddress, isConnected, networkId } = useWalletConnection()
  const {
    tokenBalances: { enabled, address: tokenAddress, claimable },
    txOptionalParams,
  } = params
  const [claiming, setWithdrawing] = useSafeState(false)

  async function withdraw(): Promise<Receipt> {
    try {
      assert(userAddress, 'No valid user address found')
      assert(enabled, 'Token not enabled')
      assert(claimable, 'Withdraw not ready')
      assert(isConnected, "There's no connected wallet")
      assert(networkId, 'No valid networkId found')

      setWithdrawing(true)

      return depositApi.withdraw({ userAddress, tokenAddress, networkId, txOptionalParams })
    } finally {
      setWithdrawing(false)
    }
  }

  return { claiming, withdraw }
}
