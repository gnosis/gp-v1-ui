import { useState, useEffect, useRef } from 'react'
import { TxResult, TokenBalanceDetails, TxOptionalParams } from 'types'
import assert from 'assert'
import { depositApi, walletApi } from 'api'

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
  const mounted = useRef(true)

  useEffect(() => {
    async function checkWithdrawable(): Promise<boolean> {
      if (withdrawingBalance.isZero()) {
        return false
      }
      // TODO: Remove connect once login is done
      await walletApi.connect()

      const userAddress = await walletApi.getAddress()
      const [withdrawBatchId, currentBatchId] = await Promise.all([
        depositApi.getPendingWithdrawBatchId(userAddress, tokenAddress),
        depositApi.getCurrentBatchId(),
      ])

      return withdrawBatchId < currentBatchId
    }

    checkWithdrawable()
      .then(withdrawable => setWithdrawable(withdrawable))
      .catch(error => {
        console.error('Error checking withdraw state', error)
        setError(true)
      })

    return function cleanUp(): void {
      mounted.current = false
    }
  }, [tokenAddress, withdrawingBalance])

  async function withdraw(): Promise<TxResult<void>> {
    assert(enabled, 'Token not enabled')
    assert(withdrawable, 'Withdraw not ready')

    setWithdrawing(true)

    try {
      // TODO: Remove connect once login is done
      await walletApi.connect()

      const userAddress = await walletApi.getAddress()
      return await depositApi.withdraw(userAddress, tokenAddress, params.txOptionalParams)
    } finally {
      if (mounted.current) {
        setWithdrawing(false)
      }
    }
  }

  return { withdrawable, withdrawing, withdraw, error }
}
