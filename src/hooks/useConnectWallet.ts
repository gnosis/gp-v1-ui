import { walletApi } from 'api'
import { toast } from 'toastify'

interface Result {
  connectWallet: () => Promise<boolean>
  disconnectWallet: () => Promise<boolean>
}

export function useConnectWallet(): Result {
  const connectWallet = async (): Promise<boolean> => {
    try {
      const success = await walletApi.connect()

      // user closed Provider selection modal
      if (!success) {
        return false
      }

      toast.success('Wallet connected')

      return true
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
