import { useEffect } from 'react'
import BN from 'bn.js'
import { DEFAULT_PRECISION } from '@gnosis.pm/dex-js'

import { walletApi } from 'api'

import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'

import { formatSmart, logDebug } from 'utils'

interface UseEthBalanceResult {
  ethBalance: BN | null
  error: boolean
}

export const useEthBalances = (): UseEthBalanceResult => {
  const walletInfo = useWalletConnection()
  const [ethBalance, setEthBalance] = useSafeState<BN | null>(null)
  const [error, setError] = useSafeState(false)

  // Get ether balances
  useEffect(() => {
    if (walletInfo.isConnected) {
      walletApi
        .getBalance()
        .then((etherBalance) => {
          logDebug('[useEthBalance] Wallet balance: %s ETH', formatSmart(etherBalance, DEFAULT_PRECISION))
          setEthBalance(etherBalance)
          setError(false)
        })
        .catch((error) => {
          console.error('[useEthBalance] Error loading ether balance', error)
          setError(true)
        })
    }
  }, [setEthBalance, setError, walletInfo])

  return { ethBalance, error }
}
