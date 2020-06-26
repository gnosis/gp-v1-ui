import { getProviderInfo } from 'web3modal'
import { HttpProvider, WebsocketProvider } from 'web3-core'
import WalletConnectProviderOrigin from '@walletconnect/web3-provider'

// EIP1193 interfaces
export interface ProviderConnectInfo {
  chainId: string
  [key: string]: unknown
}

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export interface ProviderMessage {
  type: string
  data: unknown
}

interface SpecificEvents<T extends HttpProvider | WebsocketProvider> {
  on?(event: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): T
  on?(event: 'disconnect', listener: (error: ProviderRpcError) => void): T
  on?(event: 'chainChanged', listener: (chainId: string) => void): T
  on?(event: 'accountsChanged', listener: (accounts: string[]) => void): T
  on?(event: 'message', listener: (message: ProviderMessage) => void): T
  on?(event: string, listener: (...params: unknown[]) => void): T
  once?(event: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): T
  once?(event: 'disconnect', listener: (error: ProviderRpcError) => void): T
  once?(event: 'chainChanged', listener: (chainId: string) => void): T
  once?(event: 'accountsChanged', listener: (accounts: string[]) => void): T
  once?(event: 'message', listener: (message: ProviderMessage) => void): T
  once?(event: string, listener: (...params: unknown[]) => void): T
  off?(event: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): T
  off?(event: 'disconnect', listener: (error: ProviderRpcError) => void): T
  off?(event: 'chainChanged', listener: (chainId: string) => void): T
  off?(event: 'accountsChanged', listener: (accounts: string[]) => void): T
  off?(event: 'message', listener: (message: ProviderMessage) => void): T
  off?(event: string, listener: (...params: unknown[]) => void): T
}

export type HttpProviderX = SpecificEvents<HttpProvider> & HttpProvider
export type WebsocketProviderX = SpecificEvents<WebsocketProvider> &
  WebsocketProvider & {
    on?(event: 'close', listener: () => void): WebsocketProviderX
    once?(event: 'close', listener: () => void): WebsocketProviderX
    off?(event: 'close', listener: () => void): WebsocketProviderX
  }

export type Provider = HttpProviderX | WebsocketProviderX | MetamaskProvider | WalletConnectProvider

export interface MetamaskProvider extends HttpProviderX {
  autoRefreshOnNetworkChange: boolean
}
export type WalletConnectProvider = WalletConnectProviderOrigin & HttpProviderX

export const isMetamaskProvider = (provider: Provider | null): provider is MetamaskProvider => {
  if (!provider) return false

  const info = getProviderInfo(provider)
  return info.name === 'MetaMask'
}
export const isWalletConnectProvider = (provider: Provider | null): provider is WalletConnectProvider => {
  if (!provider) return false

  const info = getProviderInfo(provider)
  return info.name === 'WalletConnect'
}
