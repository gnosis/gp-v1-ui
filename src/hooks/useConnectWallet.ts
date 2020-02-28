import { walletApi } from 'api'
import { toast } from 'toastify'
import { WalletInfo } from 'api/wallet/WalletApi'

interface Result {
  connectWallet: () => Promise<WalletInfo | false>
  disconnectWallet: () => Promise<boolean>
}

export function useConnectWallet(): Result {
  const connectWallet = async (): Promise<WalletInfo | false> => {
    try {
      const success = await walletApi.connect()

      // user closed Provider selection modal
      if (!success) {
        return false
      }

      toast.success('Wallet connected')

      return walletApi.getWalletInfo()
    } catch (error) {
      console.error('[WalletComponent] Connect wallet error', error)
      toast.error('Error connecting wallet')

      return false
    }
  }

  const disconnectWallet = async (): Promise<boolean> => {
    try {
      await walletApi.disconnect()
      toast.info('Wallet disconnected')

      return true
    } catch (error) {
      console.error('[WalletComponent] Disconnect wallet error', error)
      toast.error('Error disconnecting wallet')

      return false
    }
  }

  return { connectWallet, disconnectWallet }
}
