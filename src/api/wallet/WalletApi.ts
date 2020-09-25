import { Network, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { getDefaultProvider } from '..'
import { toBN } from '@gnosis.pm/dex-js'

import Web3Modal, { getProviderInfo, IProviderOptions, IProviderInfo, isMobile } from 'web3modal'
import { IClientMeta } from '@walletconnect/types'

import Web3 from 'web3'
import { BlockHeader } from 'web3-eth'
import { TransactionConfig } from 'web3-core'

import { logDebug, txDataEncoder, generateWCOptions } from 'utils'

import { subscribeToWeb3Event } from './subscriptionHelpers'
import { getMatchingScreenSize, subscribeToScreenSizeChange } from 'utils/mediaQueries'
import { composeProvider } from './composeProvider'
import fetchGasPriceFactory, { GasPriceLevel } from 'api/gasStation'
import { earmarkTxData, calcEarmarkedGas } from 'api/earmark'
import { Provider, isMetamaskProvider, isWalletConnectProvider, ProviderRpcError } from './providerUtils'
import { getWCWalletIconURL } from './walletUtils'

interface ProviderState {
  accounts: string[]
  chainId: number
  isConnected: boolean
}

const getProviderState = async (web3: Web3): Promise<ProviderState | null> => {
  if (!web3.currentProvider) return null
  try {
    const [accounts, chainId] = await Promise.all([web3.eth.getAccounts(), web3.eth.getChainId()])

    return {
      accounts,
      chainId,
      isConnected: accounts.length > 0 && !!chainId,
    }
  } catch (error) {
    console.error('[WalletApiImpl] Error getting ProviderState', error)
    return null
  }
}

export interface WalletApi {
  isConnected(): Promise<boolean>
  connect(givenProvider?: Provider): Promise<boolean>
  disconnect(): Promise<void>
  reconnectWC(): Promise<boolean>
  getAddress(): Promise<string>
  getBalance(): Promise<BN>
  getNetworkId(): Promise<number>
  getWalletInfo(): Promise<WalletInfo>
  addOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): Command
  removeOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void
  getProviderInfo(): ProviderInfo | null
  blockchainState: BlockchainUpdatePrompt
  userPrintAsync: Promise<string>
  getGasPrice(gasPriceLevel?: GasPriceLevel): Promise<number | null>
}

export interface WalletInfo {
  isConnected: boolean
  userAddress?: string
  networkId?: number
  blockNumber?: number
}

export interface ProviderInfo extends IProviderInfo {
  peerMeta?: IClientMeta
  walletName: string
  walletIcon: string
}

type OnChangeWalletInfo = (walletInfo: WalletInfo) => void

// to track chain state, be that current account balance or token balance of that account
// or any data on the chain belonging to that account
// we need to refetch that data when
// 1: network changes
// 2: account changes
// 3: new block is mined

interface BlockchainUpdatePrompt {
  account: string
  chainId: number
  blockHeader: BlockHeader | null
}

type BlockchainUpdatePromptCallback = (callback: (changedChainData: BlockchainUpdatePrompt) => void) => Command

interface Subscriptions {
  onAccountsChanged(callback: (accounts: string[]) => void, once?: boolean): () => void
  // should be enough to rely on onChainChanged only, bet let it stay commented out
  // onNetworkChanged(callback: (networkId: string) => void, once?: boolean): () => void;
  onChainChanged(callback: (chainId: string | number) => void, once?: boolean): () => void
}

function createSubscriptions(provider: null): null
function createSubscriptions(provider: Provider): Subscriptions | null
function createSubscriptions(provider: Provider | null): null | Subscriptions {
  if (!provider || !('on' in provider)) return null

  const onAccountsChanged = (callback: (accounts: string[]) => void, once?: boolean): (() => void) => {
    if (once) {
      provider.once?.('accountsChanged', callback)
    } else {
      provider.on?.('accountsChanged', callback)
    }

    return (): void => {
      provider.off?.('accountsChanged', callback)
    }
  }
  const onChainChanged = (callback: (chainId: string | number) => void, once?: boolean): (() => void) => {
    if (once) {
      provider.once?.('chainChanged', callback)
    } else {
      provider.on?.('chainChanged', callback)
    }

    return (): void => {
      provider.off?.('chainChanged', callback)
    }
  }

  return {
    onAccountsChanged,
    // onNetworkChanged,
    onChainChanged,
  }
}

// provides subscription to blockhain updates for account/network/block
const subscribeToBlockchainUpdate = async ({
  provider,
  subscriptions,
  web3,
}: {
  provider: Provider
  subscriptions: Subscriptions | null
  web3: Web3
}): Promise<BlockchainUpdatePromptCallback> => {
  const subs = subscriptions || createSubscriptions(provider)

  const blockUpdate = (cb: (blockHeader: BlockHeader) => void): Command => {
    return subscribeToWeb3Event({
      web3,
      callback: cb,
      getter: (web3) => web3.eth.getBlock('latest'),
      event: 'newBlockHeaders',
    })
  }

  let blockchainPrompt: BlockchainUpdatePrompt

  const providerState = await getProviderState(web3)

  if (providerState) {
    const {
      accounts: [account],
      chainId,
    } = providerState

    blockchainPrompt = {
      account,
      chainId,
      blockHeader: null,
    }
  } else {
    blockchainPrompt = {
      account: '',
      chainId: 0,
      blockHeader: null,
    }
  }

  if (!subs || !providerState) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const subscriptionHOC: BlockchainUpdatePromptCallback = (callback) => {
      const unsubBlock = blockUpdate((blockHeader) => {
        blockchainPrompt = { ...blockchainPrompt, blockHeader }
        logDebug('[WalletApiImpl] New block:', blockHeader.number)
        callback(blockchainPrompt)
      })

      return unsubBlock
    }

    return subscriptionHOC
  }

  const { onChainChanged: networkUpdate, onAccountsChanged: accountsUpdate } = subs

  const subscriptionHOC: BlockchainUpdatePromptCallback = (callback) => {
    const unsubNetwork = networkUpdate((chainId) => {
      logDebug('[WalletApiImpl] chainId changed:', chainId)
      blockchainPrompt = { ...blockchainPrompt, chainId: +chainId }
      callback(blockchainPrompt)
    })
    const unsubAccounts = accountsUpdate(([account]) => {
      logDebug('[WalletApiImpl] accounts changed:', account)
      blockchainPrompt = { ...blockchainPrompt, account }
      callback(blockchainPrompt)
    })

    const unsubBlock = blockUpdate(async (blockHeader) => {
      // oftentimes on network change newBlockHeaders fires first
      // reaffirm correct id
      const chainId = await web3.eth.net.getId()

      blockchainPrompt = { ...blockchainPrompt, blockHeader, chainId }
      logDebug('[WalletApiImpl] block changed:', blockHeader.number)
      callback(blockchainPrompt)
    })

    return (): void => {
      unsubNetwork()
      unsubAccounts()
      unsubBlock()
    }
  }

  return subscriptionHOC
}

// const AUTOCONNECT = process.env.AUTOCONNECT === 'true'

type WalletConnectInits = IProviderOptions['walletconnect']

// needed if Web3 was pre-instantiated with wss | WebsocketProvider
const closeOpenWebSocketConnection = (web3: Web3): void => {
  if (
    web3 &&
    typeof web3.currentProvider === 'object' &&
    web3.currentProvider?.connected &&
    'disconnect' in web3.currentProvider
  ) {
    // code=1000 - Normal Closure
    web3.currentProvider.disconnect(1000, 'Switching provider')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPromise = <T>(maybePromise: any): maybePromise is Promise<T> =>
  maybePromise instanceof Promise || ('then' in maybePromise && typeof maybePromise.then === 'function')

/**
 * Basic implementation of Wallet API
 */
export class WalletApiImpl implements WalletApi {
  private _listeners: ((walletInfo: WalletInfo) => void)[]
  private _provider: Provider | null
  private _web3: Web3
  private _providerInfo: ProviderInfo | null = null
  public userPrintAsync: Promise<string> = Promise.resolve('')
  public blockchainState: BlockchainUpdatePrompt

  private _unsubscribe: Command
  private _fetchGasPrice: ReturnType<typeof fetchGasPriceFactory> = async () => undefined

  public constructor(web3: Web3) {
    this._listeners = []
    this._web3 = web3

    // update userPrint on screenSize change
    // normally wouldn't happen
    // only when browser window is resized
    // or device is switched between landscape <-> portrait orientation
    subscribeToScreenSizeChange(() => {
      this.userPrintAsync = this._generateAsyncUserPrint()
    })
  }

  public isConnected(): Promise<boolean> {
    return this._connected
  }

  public async reconnectWC(): Promise<boolean> {
    // if connected to WC reconnect with new data
    if (await this.isConnected()) {
      if (isWalletConnectProvider(this._provider)) {
        await this.disconnect()
        return this.connect()
      }
    }

    // if not don't do anything
    return false
  }

  public async connect(givenProvider?: Provider): Promise<boolean> {
    let provider: Provider

    if (givenProvider) {
      provider = givenProvider
    } else {
      const options = generateWCOptions()
      const WCoptions: WalletConnectInits = {
        options,
        package: (
          await import(
            /* webpackChunkName: "@walletconnect"*/
            '@walletconnect/web3-provider'
            // '@walletconnect/web3-provider/dist/umd/index.min.js' // this also works
            // because inde.min is a full bundle minified with all correct dependencies
          )
        ).default,
      }

      const web3Modal = new Web3Modal({
        providerOptions: {
          walletconnect: WCoptions,
        },
      })

      provider = await web3Modal.connect()
    }

    if (!provider) return false

    if (isMetamaskProvider(provider)) provider.autoRefreshOnNetworkChange = false
    else if (isWalletConnectProvider(provider)) {
      // hackaround
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      provider.handleReadRequests = async function (payload: unknown): Promise<unknown> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if (!this.http) {
          const error = new Error('HTTP Connection not available')
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          this.emit('error', error)
          throw error
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        return this.http.send(payload)

        // was
        // this.http.send(payload);

        // return new Promise(resolve => {
        //   this.on("payload", (response: IJsonRpcResponseSuccess) => {
        //     if (response.id === payload.id) {
        //       resolve(response);
        //     }
        //   });
        // });

        // but HttpConnection doesn't have any events
      }
    }

    this._provider = provider
    this._setProviderInfo()

    closeOpenWebSocketConnection(this._web3)

    const fetchGasPrice = fetchGasPriceFactory(this)

    this._fetchGasPrice = fetchGasPrice

    const earmarkingFunction = async (tx: TransactionConfig): Promise<void> => {
      const userPrint = await this.userPrintAsync
      tx.data = earmarkTxData(tx.data, userPrint)

      if (tx.gas) {
        tx.gas = calcEarmarkedGas(tx.gas, userPrint)
      }
    }

    const composedProvider = composeProvider(provider, { fetchGasPrice, earmarkTx: earmarkingFunction })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._web3.setProvider(composedProvider)
    logDebug('[WalletApiImpl] Connected')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).web3c = this._web3

    const providerState = await getProviderState(this._web3)

    if (providerState) {
      const {
        accounts: [account],
        chainId,
      } = providerState

      this.blockchainState = {
        account,
        chainId,
        blockHeader: null,
      }
    }

    await this._notifyListeners(this.blockchainState)

    const subscriptions = createSubscriptions(provider)

    const blockchainPromtSubscription = await subscribeToBlockchainUpdate({ subscriptions, provider, web3: this._web3 })

    const unsubscribeUpdates = blockchainPromtSubscription(this._notifyListeners.bind(this))

    let unsubscribeDisconnect: Command = () => {
      // Empty comment to indicate this is on purpose: https://github.com/eslint/eslint/commit/c1c4f4d
    }

    if (isWalletConnectProvider(provider)) {
      const handleDisconnect = this.disconnect.bind(this)
      // WalletConnect provider has 'close' event
      // but fires it NEVER
      provider.on?.('close', handleDisconnect)
      provider.on?.('close', (...params) => {
        logDebug('[WalletApiImpl] WC closed', ...params)
      })
      // also has 'stop' event
      // inherited from web3-provider-engine
      // fires it only in versions <=beta.61
      provider.on?.('stop', handleDisconnect)
      provider.on?.('stop', (v) => {
        logDebug('[WalletApiImpl] WC stopped', v)
      })

      unsubscribeDisconnect = (): void => {
        provider.off?.('close', handleDisconnect)
        provider.off?.('stop', handleDisconnect)
      }
    } else {
      const handleEmptyAccounts = (accounts: string[]): void => {
        if (accounts.length > 0) return
        // accounts  = [] when user locks Metamask
        logDebug('[WalletApiImpl] accountsChanged empty accounts')
        this.disconnect()
      }
      provider.on?.('accountsChanged', handleEmptyAccounts)

      const handleDisconnect = (error: ProviderRpcError): void => {
        logDebug('[WalletApiImpl] disconnect provider disconnected', error)
        this.disconnect()
      }
      // providers should support 'disconnect' event
      provider.on?.('disconnect', handleDisconnect)

      unsubscribeDisconnect = (): void => {
        provider.off?.('accountsChanged', handleEmptyAccounts)
        provider.off?.('disconnect', handleDisconnect)
      }
    }

    this._unsubscribe = (): void => {
      unsubscribeUpdates()
      unsubscribeDisconnect()
    }

    this.userPrintAsync = this._generateAsyncUserPrint()

    return true
  }

  public async disconnect(): Promise<void> {
    // don't trigger all logic if already disconnected
    if (!this._provider) return

    this._unsubscribe()

    if (this._provider) {
      if ('close' in this._provider) this._provider.close()
      else if ('disconnect' in this._provider) this._provider.disconnect(1000, 'Closing provider connection')
    }

    this._provider = null
    this._web3?.setProvider(getDefaultProvider())

    logDebug('[WalletApiImpl] Disconnected')
    await this._notifyListeners()
    this._setProviderInfo()
  }

  public async getGasPrice(gasPriceLevel?: GasPriceLevel): Promise<number | null> {
    // this never errors
    // returns undefined if unable to fetch
    let gasPrice = await this._fetchGasPrice(gasPriceLevel)

    if (gasPrice) return +gasPrice
    try {
      // fallback to gasPrice from provider
      // {"jsonrpc":"2.0","method":"eth_gasPrice"} call
      gasPrice = await this._web3.eth.getGasPrice()

      if (gasPrice) return +gasPrice
    } catch (error) {
      console.error('Error fetching gas price', error)
    }

    // unable to fetch
    return null
  }

  public async getAddress(): Promise<string> {
    assert(await this._connected, 'The wallet is not connected')

    return this._user
  }

  public async getBalance(): Promise<BN> {
    assert(await this._connected, 'The wallet is not connected')

    return toBN(await this._balance)
  }

  public async getNetworkId(): Promise<number> {
    assert(await this._connected, 'The wallet is not connected')

    return this._networkId
  }

  public addOnChangeWalletInfo(callback: OnChangeWalletInfo): Command {
    // cancell possible promise if any
    let promiseIsStale = false
    const cancellableCallback: OnChangeWalletInfo = (newWalletInfo) => {
      promiseIsStale = true
      callback(newWalletInfo)
    }
    this._listeners.push(cancellableCallback)
    // since walletInfo can only be gotten asynchronously
    // trigger callback as soon as it becomes available
    // unless there's been a newer WalletInfo since promise initialization
    this.getWalletInfo().then((newWalletInfo) => {
      if (promiseIsStale) return
      callback(newWalletInfo)
    })

    return (): void => this.removeOnChangeWalletInfo(callback)
  }

  public removeOnChangeWalletInfo(callback: OnChangeWalletInfo): void {
    this._listeners = this._listeners.filter((c) => c !== callback)
  }

  public getProviderInfo(): ProviderInfo | null {
    return this._providerInfo
  }

  public async getWalletInfo(): Promise<WalletInfo> {
    const providerState = await getProviderState(this._web3)

    const { isConnected = false, accounts = [], chainId = 0 } = providerState || {}
    return {
      isConnected,
      userAddress: accounts[0],
      networkId: isConnected ? +chainId : undefined,
    }
  }

  /* ****************      Private Functions      **************** */

  private _setProviderInfo(): void {
    // this can get expensive depending on the number and complexity of checks in getProviderInfo
    // so retrigger only on connect/disconnect
    const providerInfo = getProviderInfo(this._provider)

    if (!providerInfo) {
      this._providerInfo = null
      return
    }

    this._providerInfo = {
      ...providerInfo,
      walletIcon: providerInfo.logo,
      walletName: providerInfo.name,
    }

    // not all WC wallets fill in peerMeat (Pillar doesn't)
    if (isWalletConnectProvider(this._provider) && this._provider.wc.peerMeta) {
      this._providerInfo.peerMeta = this._provider.wc.peerMeta
      this._providerInfo.walletName = this._provider.wc.peerMeta.name

      const WCWalletIcon = this._provider.wc.peerMeta.icons?.[0] || getWCWalletIconURL(this._providerInfo.walletName)
      if (WCWalletIcon) this._providerInfo.walletIcon = WCWalletIcon
    }
  }

  private async _notifyListeners(blockchainUpdate?: BlockchainUpdatePrompt): Promise<void> {
    let chainIdChanged = false
    if (blockchainUpdate) {
      chainIdChanged = this.blockchainState.chainId !== blockchainUpdate.chainId
      this.blockchainState = blockchainUpdate
    }

    await Promise.resolve()

    const walletInfo = await this.getWalletInfo()
    const wInfoExtended = { ...walletInfo, blockNumber: blockchainUpdate?.blockHeader?.number }

    if (
      // listeners called because of blockchain update
      blockchainUpdate &&
      // networkId is defined and not 0, meaning there's no connection lost
      wInfoExtended.networkId &&
      // but chainId from blockchain update is different
      wInfoExtended.networkId !== blockchainUpdate.chainId &&
      // and that chainId just changed
      chainIdChanged
    ) {
      // then consider blockchainUpdate.chainId a fresher value
      wInfoExtended.networkId = blockchainUpdate.chainId
      logDebug('[WalletApiImpl] chainId changed:', blockchainUpdate.chainId)
    }

    this._listeners.forEach((listener) => listener(wInfoExtended))
  }

  private get _connected(): Promise<boolean> {
    return this.getWalletInfo().then((walletInfo) => walletInfo?.isConnected || false)
  }
  private get _user(): Promise<string> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.userAddress || '')
  }
  private get _balance(): Promise<string> {
    if (!this._web3) return Promise.resolve('0')
    return Promise.resolve(this._user).then((user) => this._web3.eth.getBalance(user))
  }
  private get _networkId(): Promise<Network> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.networkId || 0)
  }

  // new userPrint is generated when provider or screen size changes
  // other flags -- mobile, browser -- are stable
  private async _generateAsyncUserPrint(): Promise<string> {
    const providerInfo = this.getProviderInfo()
    if (!providerInfo) return ''

    const { name: providerName } = providerInfo

    const mobile = isMobile() ? 'mobile' : 'desktop'

    const screenSize = getMatchingScreenSize()

    const { parseUserAgent } = await import(
      /* webpackChunkName: "detect-browser"*/
      'detect-browser'
    )

    const browserInfo = parseUserAgent(navigator.userAgent)

    const flagObject = {
      provider: providerName,
      mobile,
      browser: browserInfo?.name || '',
      screenSize,
    }

    const encoded = txDataEncoder(flagObject)

    logDebug('Encoded object', flagObject)
    logDebug('User Wallet print', encoded)
    return encoded
  }
}

export default WalletApiImpl
