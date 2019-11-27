import { TokenBalanceDetails, TxOptionalParams, Receipt } from 'types'
import { assert } from 'utils'
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
  const { userAddress, isConnected } = useWalletConnection()
  const {
    tokenBalances: { enabled, address: tokenAddress, claimable },
  } = params
  const [claiming, setWithdrawing] = useSafeState(false)

  async function withdraw(): Promise<Receipt> {
    try {
      assert(userAddress, 'No valid user address found')
      assert(enabled, 'Token not enabled')
      assert(claimable, 'Withdraw not ready')
      assert(isConnected, "There's no connected wallet")

      setWithdrawing(true)

      return depositApi.withdraw({ userAddress, tokenAddress }, params.txOptionalParams)
    } finally {
      setWithdrawing(false)
    }
  }

  return { claiming, withdraw }
}
