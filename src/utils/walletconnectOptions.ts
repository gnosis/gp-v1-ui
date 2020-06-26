import { INFURA_ID, WALLET_CONNECT_BRIDGE, STORAGE_KEY_CUSTOM_WC_OPTIONS } from 'const'
import { IWalletConnectProviderOptions } from '@walletconnect/types'

interface WCOptions {
  infuraId?: string
  bridge?: string
  rpc?: string
}

export const setCustomWCOptions = (options: WCOptions): boolean => {
  const optionsStr = JSON.stringify(options)
  const oldStr = localStorage.getItem(STORAGE_KEY_CUSTOM_WC_OPTIONS)

  // no change,no need to reconnect
  if (optionsStr === oldStr) return false

  localStorage.setItem(STORAGE_KEY_CUSTOM_WC_OPTIONS, optionsStr)
  return true
}

export const getWCOptionsFromStorage = (): IWalletConnectProviderOptions => {
  const storedOptions = localStorage.getItem(STORAGE_KEY_CUSTOM_WC_OPTIONS)
  if (!storedOptions) return {}

  const { infuraId, bridge, rpc }: IWalletConnectProviderOptions = JSON.parse(storedOptions)
  console.log('JSON.parse(storedOptions)', JSON.parse(storedOptions))
  return {
    infuraId,
    bridge,
    rpc,
  }
}

export const generateWCOptions = (): IWalletConnectProviderOptions => {
  const { infuraId, bridge } = getWCOptionsFromStorage()
  return {
    infuraId: infuraId || INFURA_ID,
    bridge: bridge || WALLET_CONNECT_BRIDGE,
  }
}
