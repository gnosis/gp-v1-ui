import { walletApi } from 'api'
import { useState, useEffect } from 'react'
import { WalletInfo } from 'types'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ isConnected: false })

  useEffect((): (() => void) => {
    walletApi.addOnChangeWalletInfo(setWalletInfo, true)

    return function cleanup(): void {
      walletApi.removeOnChangeWalletInfo(setWalletInfo)
    }
  }, [])
  return walletInfo
}
