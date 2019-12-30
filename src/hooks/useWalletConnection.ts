import { walletApi } from 'api'
import { useEffect } from 'react'
import { WalletInfo, Command } from 'types'
import useSafeState from './useSafeState'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useSafeState<WalletInfo>(() => walletApi.getWalletInfo())

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo)
  }, [setWalletInfo])
  return walletInfo
}
