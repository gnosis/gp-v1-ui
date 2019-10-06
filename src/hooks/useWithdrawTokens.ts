import { useState, useEffect, useRef } from 'react'
import { TxResult, TokenBalanceDetails, TxOptionalParams } from 'types'
import assert from 'assert'
import { depositApi } from 'api'
import { useWalletConnection } from './useWalletConnection'

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
  const [claiming, setWithdrawing] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  async function withdraw(): Promise<TxResult<void>> {
    assert(enabled, 'Token not enabled')
    assert(claimable, 'Withdraw not ready')
    assert(isConnected, "There's no connected wallet")

    setWithdrawing(true)

    try {
      return await depositApi.withdraw(userAddress, tokenAddress, params.txOptionalParams)
    } finally {
      if (mounted.current) {
        setWithdrawing(false)
      }
    }
  }

  return { claiming, withdraw }
}
