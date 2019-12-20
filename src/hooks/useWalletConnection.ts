import { walletApi } from 'api'
import { useEffect } from 'react'
import { Command } from 'types'
import useSafeState from './useSafeState'
import { WalletInfo } from 'api/wallet/WalletApi'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useSafeState<WalletInfo>({ isConnected: false })

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo, true)
  }, [setWalletInfo])
  return walletInfo
}
