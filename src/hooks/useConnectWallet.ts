import { walletApi } from 'api'
import { toast } from 'toastify'

interface Result {
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

export function useConnectWallet(): Result {
  const connectWallet = async (): Promise<void> => {
    try {
      const success = await walletApi.connect()

      // user closed Provider selection modal
      if (!success) return

      toast.success('Wallet connected')
    } catch (error) {
      console.error('[WalletComponent] Connect wallet error', error)
      toast.error('Error connecting wallet')
    }
  }

  const disconnectWallet = async (): Promise<void> => {
    try {
      await walletApi.disconnect()
      toast.info('Wallet disconnected')
    } catch (error) {
      console.error('[WalletComponent] Disconnect wallet error', error)
      toast.error('Error disconnecting wallet')
    }
  }

  return { connectWallet, disconnectWallet }
}
