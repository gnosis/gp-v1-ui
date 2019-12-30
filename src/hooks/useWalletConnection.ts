import { walletApi } from 'api'
import { useEffect } from 'react'
import { Command } from 'types'
import useSafeState from './useSafeState'
import { WalletInfo } from 'api/wallet/WalletApi'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useSafeState<WalletInfo>(() => walletApi.getWalletInfo())

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo)
  }, [setWalletInfo])
  return walletInfo
}
