import { useState, useEffect } from 'react'
import { TxResult, TokenBalanceDetails, TxOptionalParams } from 'types'
import assert from 'assert'
import { depositApi, walletApi } from 'api'
import { ZERO } from 'const'

interface Params {
  tokenBalances: TokenBalanceDetails
  txOptionalParams?: TxOptionalParams
}

interface Result {
  withdrawable: boolean
  withdrawing: boolean
  withdraw(): Promise<TxResult<void>>
  error: boolean
}

export const useWithdrawTokens = (params: Params): Result => {
  const {
    tokenBalances: { enabled, address: tokenAddress, withdrawingBalance },
  } = params
  const [withdrawable, setWithdrawable] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState(false)

  async function _checkWithdrawable(): Promise<boolean> {
    if (!withdrawingBalance.gt(ZERO)) {
      return false
    }
    // TODO: Remove connect once login is done
    await walletApi.connect()

    // TODO: these two (useAddress and batchId) are constant for a given withdraw
    //       probably could be cached?
    const userAddress = await walletApi.getAddress()
    const [withdrawBatchId, currentBatchId] = await Promise.all([
      depositApi.getPendingWithdrawBatchId(userAddress, tokenAddress),
      depositApi.getCurrentBatchId(),
    ])

    return withdrawBatchId < currentBatchId
  }

  useEffect(() => {
    _checkWithdrawable()
      .then(withdrawable => setWithdrawable(withdrawable))
      .catch(error => {
        console.error('Error checking withdraw state')
        setError(error)
      })
  })

  async function withdraw(): Promise<TxResult<void>> {
    assert(enabled, 'Token not enabled')
    assert(withdrawable, 'Withdraw not ready')

    setWithdrawing(true)
    console.debug(`Is withdrawing? ${withdrawing}`)
    // TODO: Remove connect once login is done
    await walletApi.connect()

    const userAddress = await walletApi.getAddress()
    const result = depositApi.withdraw(userAddress, tokenAddress, params.txOptionalParams)

    setWithdrawing(false)
    console.debug(`Is withdrawing? ${withdrawing}`)
    return result
  }

  return { withdrawable, withdrawing, withdraw, error }
}
