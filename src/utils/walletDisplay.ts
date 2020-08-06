import { walletApi } from 'api'

export interface WalletDisplayInfo {
  walletName: string | null
  walletIconURL: string | null
}

// icons for known wallet providers
export const provName2Icon: Record<string, string> = {}

export const getWalletDisplayInfo = (): WalletDisplayInfo => {
  const providerInfo = walletApi.getProviderInfo()

  if (!providerInfo) {
    return {
      walletName: null,
      walletIconURL: null,
    }
  }
  const walletName = providerInfo.peerMeta?.name || providerInfo.name
  const walletIconURL = providerInfo.peerMeta?.icons[0] || provName2Icon[walletName]

  return {
    walletName,
    walletIconURL,
  }
}
