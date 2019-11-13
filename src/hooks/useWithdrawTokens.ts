import { TxResult, TokenBalanceDetails, TxOptionalParams } from 'types'
import assert from 'assert'
import { depositApi } from 'api'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  claiming: boolean
  withdraw(): Promise<TxResult<void>>
}

export const useWithdrawTokens = (params: Params): Result => {
  const { userAddress, isConnected } = useWalletConnection()
  const {
    tokenBalances: { enabled, address: tokenAddress, claimable },
  } = params
  const [claiming, setWithdrawing] = useSafeState(false)

  async function withdraw(): Promise<TxResult<void>> {
    assert(enabled, 'Token not enabled')
    assert(claimable, 'Withdraw not ready')
    assert(isConnected, "There's no connected wallet")

    setWithdrawing(true)

    try {
      const receipt = await depositApi.withdraw(userAddress, tokenAddress, params.txOptionalParams)
      return receipt
    } finally {
      setWithdrawing(false)
    }
  }

  return { claiming, withdraw }
}
