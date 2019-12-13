import { walletApi } from 'api'
import { useEffect } from 'react'
import { WalletInfo, Command } from 'types'
import useSafeState from './useSafeState'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useSafeState<WalletInfo>({ isConnected: false })

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo, true)
  }, [setWalletInfo])
  return walletInfo
}
