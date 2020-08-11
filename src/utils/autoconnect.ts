import { generateWCOptions } from 'utils'
import { STORAGE_KEY_LAST_PROVIDER } from 'const'
import { WalletApi } from 'api/wallet/WalletApi'
import { logDebug } from 'utils'
import { connectors } from 'web3modal'
import { IWalletConnectConnectorOptions } from 'web3modal/dist/providers/connectors/walletconnect'

const getWCIfConnected = async (): Promise<unknown> => {
  const { default: WalletConnectProvider } = await import(
    /* webpackChunkName: "@walletconnect"*/
    '@walletconnect/web3-provider'
  )

  const wcOptions = generateWCOptions()

  try {
    const provider = (await connectors.walletconnect(
      WalletConnectProvider,
      wcOptions as IWalletConnectConnectorOptions,
    )) as InstanceType<typeof WalletConnectProvider>

    if (!provider.wc.connected) return null
    return provider
  } catch (error) {
    console.warn('Error reestablishing previous WC connection', error)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLastProvider = async (): Promise<any> => {
  const lastProviderName = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  try {
    // last provider was WalletConnect
    // try to reconnect
    // but account for possibly stale session
    if (lastProviderName === 'WalletConnect') return getWCIfConnected()

    const { getInjectedProviderName } = await import(
      /* webpackChunkName: "web3modal"*/
      'web3modal'
    )

    const injectedProviderName = getInjectedProviderName()
    // last provider is the current injected provider
    // and it's still injected
    if (injectedProviderName && injectedProviderName === lastProviderName) {
      return connectors.injected()
    }
  } catch (error) {
    console.warn('Error connecting to last used provider', lastProviderName, error)
  }
  return null
}

export const setupAutoconnect = async (walletApi: WalletApi): Promise<boolean> => {
  window.addEventListener('beforeunload', () => {
    const providerInfo = walletApi.getProviderInfo()
    if (!providerInfo) {
      // disonnected
      localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
      return
    }

    const { name } = providerInfo
    logDebug('[autoconnect] Storing last provider name', name)
    localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, name)
  })

  const provider = await getLastProvider()

  logDebug('[autoconnect] Connecting to last provider if any', provider)
  if (provider) return walletApi.connect(provider)
  return false
}
