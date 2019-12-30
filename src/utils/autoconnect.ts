import Web3Connect from 'web3connect'
import { Provider, WalletConnectProvider as WCProvider } from '@gnosis.pm/dapp-ui'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { delay } from 'utils'
import { INFURA_ID, STORAGE_KEY_LAST_PROVIDER } from 'const'
import { WalletApi } from 'api/wallet/WalletApi'

const getWCIfConnected = async (): Promise<WCProvider | null> => {
  const provider = new WalletConnectProvider({
    infuraId: INFURA_ID,
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

export const getLastProvider = (): Promise<Provider | null> => {
  const lastProviderName = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)
  console.log('lastProvider', lastProviderName)

  try {
    // last provider was WalletConnect
    // try to reconnect
    // but account for possibly stale session
    if (lastProviderName === 'WalletConnect') return getWCIfConnected()

    const injectedProviderName = Web3Connect.getInjectedProviderName()
    console.log('injectedProvider', injectedProviderName)
    // last provider is the current injected provider
    // and it's still injected
    if (injectedProviderName === lastProviderName) {
      // if (injectedProvider === 'MetaMask') {
      //   const provider = window.ethereum || window.web3?.currentProvider
      //   provider._metamask?.isUnlocked()
      // }
      return Web3Connect.ConnectToInjected()
    }
  } catch (error) {
    console.warn('Error connecting to last used provider', lastProviderName, error)
  }
  return Promise.resolve(null)
}

export const setupAutoconnect = async (walletApi: WalletApi): Promise<boolean> => {
  window.addEventListener('beforeunload', e => {
    e.preventDefault()
    const { name } = walletApi.getProviderInfo()
    console.log('LAST PROVIDER NAME', name)
    localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, name)
  })

  const provider = await getLastProvider()

  console.log('Connecting to last provider if any', provider)

  if (provider) return walletApi.connect(provider)
  return false
}
