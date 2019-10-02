import { walletApi } from 'api'
import { useState, useEffect } from 'react'
import { WalletInfo, Command } from 'types'

export const useWalletConnection = (): WalletInfo => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ isConnected: false })

  useEffect((): Command => {
    return walletApi.addOnChangeWalletInfo(setWalletInfo, true)
  }, [])
  return walletInfo
}
