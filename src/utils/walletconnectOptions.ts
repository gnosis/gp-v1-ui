import { INFURA_ID, WALLET_CONNECT_BRIDGE, STORAGE_KEY_CUSTOM_WC_OPTIONS } from 'const'
import { IWalletConnectProviderOptions, IRPCMap } from '@walletconnect/types'
import { Network } from 'types'

export interface WCOptions {
  infuraId?: string
  bridge?: string
  rpc?: {
    mainnet?: string
    rinkeby?: string
    xDAI?: string
  }
}

const defaultRPC = {
  [Network.xDAI]: 'https://rpc.xdaichain.com/',
}

export const setCustomWCOptions = (options: WCOptions): boolean => {
  const optionsStr = JSON.stringify(options)
  const oldStr = localStorage.getItem(STORAGE_KEY_CUSTOM_WC_OPTIONS)

  // no change,no need to reconnect
  if (optionsStr === oldStr) return false

  localStorage.setItem(STORAGE_KEY_CUSTOM_WC_OPTIONS, optionsStr)
  return true
}

export const getWCOptionsFromStorage = (): WCOptions => {
  const storedOptions = localStorage.getItem(STORAGE_KEY_CUSTOM_WC_OPTIONS)
  if (!storedOptions) return {}

  return JSON.parse(storedOptions)
}

const mapStoredRpc = (rpc?: WCOptions['rpc']): IRPCMap | undefined => {
  if (!rpc) return

  const { mainnet, rinkeby, xDAI } = rpc

  const rpcMap = {}
  if (mainnet) rpcMap[Network.Mainnet] = mainnet
  if (rinkeby) rpcMap[Network.Rinkeby] = rinkeby
  if (xDAI) rpcMap[Network.xDAI] = xDAI

  return rpcMap
}

export const generateWCOptions = (): IWalletConnectProviderOptions => {
  const { infuraId, bridge, rpc } = getWCOptionsFromStorage()
  return {
    infuraId: infuraId || INFURA_ID,
    bridge: bridge || WALLET_CONNECT_BRIDGE,
    rpc: {
      ...defaultRPC,
      ...mapStoredRpc(rpc),
    },
  }
}
