import { Provider, WalletConnectProvider as WCProvider } from '@gnosis.pm/dapp-ui'
import { delay } from 'utils'
import { INFURA_ID, STORAGE_KEY_LAST_PROVIDER, WALLET_CONNECT_BRIDGE } from 'const'
import { WalletApi } from 'api/wallet/WalletApi'
import Web3 from 'web3'
import { logDebug } from 'utils'

const getWCIfConnected = async (): Promise<WCProvider | null> => {
  const { default: WalletConnectProvider } = await import(
    /* webpackChunkName: "@walletconnect"*/
    '@walletconnect/web3-provider'
  )
  const provider = new WalletConnectProvider({
    infuraId: INFURA_ID,
    bridge: WALLET_CONNECT_BRIDGE,
  })

  if (!provider.wc.connected) return null

  try {
    await new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider.wc.on('transport_open', (error: Error, event: any) => {
        if (error) reject(error)
        else resolve(event)
      })
    })

    await Promise.race([
      // some time for connection to settle
      delay(250),
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider.wc.on('disconnect', (error: Error, event: any) => {
          // wc.connected is set to false here
          if (error) reject(error)
          else resolve(event)
        })
      }),
    ])

    if (!provider.wc.connected) return null

    await provider.enable()
  } catch (error) {
    console.warn('Error reestablishing previous WC connection', error)
    return null
  }

  return provider
}

declare global {
  interface Window {
    ethereum?: Provider & { enable(): Promise<string[]> }
    web3?: Web3 & { currentProvider: Provider }
  }
}

// from web3connect/providers/connectors/injected.ts
const connectToInjected = async (): Promise<Provider> => {
  let provider: Provider
  if (window.ethereum) {
    provider = window.ethereum
    try {
      await window.ethereum.enable()
    } catch (error) {
      throw new Error('User Rejected')
    }
  } else if (window.web3) {
    provider = window.web3.currentProvider
  } else {
    throw new Error('No Web3 Provider found')
  }
  return provider
}

export const getLastProvider = async (): Promise<Provider | null> => {
  const lastProviderName = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  try {
    // last provider was WalletConnect
    // try to reconnect
    // but account for possibly stale session
    if (lastProviderName === 'WalletConnect') return getWCIfConnected()

    const { default: Web3Connect } = await import(
      /* webpackChunkName: "@web3connect"*/
      'web3connect'
    )

    const injectedProviderName = Web3Connect.getInjectedProviderName()
    // last provider is the current injected provider
    // and it's still injected
    if (injectedProviderName && injectedProviderName === lastProviderName) {
      return connectToInjected()
    }
  } catch (error) {
    console.warn('Error connecting to last used provider', lastProviderName, error)
  }
  return null
}

export const setupAutoconnect = async (walletApi: WalletApi): Promise<boolean> => {
  window.addEventListener('beforeunload', () => {
    const { name } = walletApi.getProviderInfo()
    logDebug('[autoconnect] Storing last provider name', name)
    localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, name)
  })

  const provider = await getLastProvider()

  logDebug('[autoconnect] Connecting to last provider if any', provider)
  if (provider) return walletApi.connect(provider)
  return false
}
