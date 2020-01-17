import { Network, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { getDefaultProvider } from '..'

import WalletConnectProvider from '@walletconnect/web3-provider'

import Web3Connect from 'web3connect'

import Web3 from 'web3'
import { BlockHeader } from 'web3-eth'

import {
  getProvider,
  getProviderState,
  createSubscriptions,
  Provider,
  WalletConnectInits,
  isWalletConnectProvider,
  isMetamaskSubscriptions,
  isWalletConnectSubscriptions,
  isMetamaskProvider,
  Subscriptions,
} from '@gnosis.pm/dapp-ui'

import { log, toBN } from 'utils'
import { INFURA_ID } from 'const'

export interface WalletApi {
  isConnected(): boolean | Promise<boolean>
  connect(givenProvider?: Provider): Promise<boolean>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getBalance(): Promise<BN>
  getNetworkId(): Promise<number>
  getWalletInfo(): WalletInfo | Promise<WalletInfo>
  addOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void, trigger?: boolean): Command
  removeOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void
  getProviderInfo(): ProviderInfo
}

export interface WalletInfo {
  isConnected: boolean
  userAddress?: string
  networkId?: number
}

export type ProviderInfo = ReturnType<typeof Web3Connect.getProviderInfo>

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

// provides subscription to blockhain updates for account/network/block
const subscribeToBlockchainUpdate = ({
  provider,
  subscriptions,
  web3,
}: {
  provider: Provider
  subscriptions?: Subscriptions
  web3: Web3
}): BlockchainUpdatePromptCallback => {
  console.log('provider', provider)
  const subs = subscriptions || createSubscriptions(provider)
  console.log('subscriptions', subscriptions)
  console.log('subs', subs)

  const blockUpdate = (cb: (blockHeader: BlockHeader) => void): Command => {
    const blockSub = web3.eth.subscribe('newBlockHeaders').on('data', cb)
    return (): void => {
      blockSub.unsubscribe()
    }
  }

  if (!subs) {
    let blockchainPrompt: BlockchainUpdatePrompt = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account: (provider as any).address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chainId: +(provider as any).chainId,
      blockHeader: null,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('(provider as any).address', (provider as any).address)

    const subscriptionHOC: BlockchainUpdatePromptCallback = callback => {
      const unsubBlock = blockUpdate(blockHeader => {
        blockchainPrompt = { ...blockchainPrompt, blockHeader }
        log('block changed:', blockHeader.number)
        callback(blockchainPrompt)
      })

      return (): void => {
        unsubBlock()
      }
    }

    return subscriptionHOC
  }

  let networkUpdate: (callback: (chainId: number) => void) => Command

  if (isMetamaskSubscriptions(subs)) networkUpdate = (cb): Command => subs.onNetworkChanged(networkId => cb(+networkId))
  if (isWalletConnectSubscriptions(subs)) networkUpdate = subs.onChainChanged

  const accountsUpdate = subs.onAccountsChanged

  const {
    accounts: [account],
    chainId,
  } = getProviderState(provider)

  let blockchainPrompt: BlockchainUpdatePrompt = {
    account,
    chainId: +chainId,
    blockHeader: null,
  }

  const subscriptionHOC: BlockchainUpdatePromptCallback = callback => {
    const unsubNetwork = networkUpdate(chainId => {
      blockchainPrompt = { ...blockchainPrompt, chainId }
      log('chainId changed:', chainId)
      callback(blockchainPrompt)
    })
    const unsubAccounts = accountsUpdate(([account]) => {
      blockchainPrompt = { ...blockchainPrompt, account }
      log('accounts changed:', account)
      callback(blockchainPrompt)
    })

    const unsubBlock = blockUpdate(blockHeader => {
      blockchainPrompt = { ...blockchainPrompt, blockHeader }
      log('block changed:', blockHeader.number)
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

const wcOptions: WalletConnectInits = {
  package: WalletConnectProvider,
  options: {
    // TODO get infuraId from .env
    infuraId: INFURA_ID,
  },
}

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

  private _unsubscribe: Command = () => {
    // Empty comment to indicate this is on purpose: https://github.com/eslint/eslint/commit/c1c4f4d
  }

  public constructor(web3: Web3) {
    this._listeners = []
    this._web3 = web3
  }

  public isConnected(): boolean | Promise<boolean> {
    return this._connected
  }

  public async connect(givenProvider?: Provider): Promise<boolean> {
    const provider = givenProvider || (await getProvider(wcOptions))

    if (!provider) return false

    if (isMetamaskProvider(provider)) provider.autoRefreshOnNetworkChange = false

    this._provider = provider

    closeOpenWebSocketConnection(this._web3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._web3.setProvider(provider as any)
    log('[WalletApi] Connected')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).web3c = this._web3

    await this._notifyListeners()

    const subscriptions = createSubscriptions(provider)
    console.log('Provider', provider)
    console.log('Subscriptions', subscriptions)

    const unsubscribeUpdates = subscribeToBlockchainUpdate({ subscriptions, provider, web3: this._web3 })(
      this._notifyListeners.bind(this),
    )

    let unsubscribeDisconnect: Command = () => {
      // Empty comment to indicate this is on purpose: https://github.com/eslint/eslint/commit/c1c4f4d
    }
    if (isWalletConnectSubscriptions(subscriptions)) {
      unsubscribeDisconnect = subscriptions.onStop(this.disconnect.bind(this))
    } else if (isMetamaskSubscriptions(subscriptions)) {
      unsubscribeDisconnect = subscriptions.onAccountsChanged(accounts => {
        if (accounts.length > 0) return
        // accounts  = [] when user locks Metamask

        this.disconnect()
      })
    }

    this._unsubscribe = (): void => {
      unsubscribeUpdates()
      unsubscribeDisconnect()
    }

    return true
  }

  public async disconnect(): Promise<void> {
    if (isWalletConnectProvider(this._provider) && (await this._connected)) await this._provider.close()

    this._unsubscribe()

    this._provider = null
    this._web3?.setProvider(getDefaultProvider())

    log('[WalletApi] Disconnected')
    await this._notifyListeners()
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

  public addOnChangeWalletInfo(callback: OnChangeWalletInfo, trigger?: boolean): Command {
    this._listeners.push(callback)
    const walletInfo = this.getWalletInfo()
    // if walletInfo can only be gotten asynchronously
    // trigger callback as soon as it becomes available
    if (trigger || isPromise(walletInfo)) {
      Promise.resolve(walletInfo).then(callback)
    }

    return (): void => this.removeOnChangeWalletInfo(callback)
  }

  public removeOnChangeWalletInfo(callback: OnChangeWalletInfo): void {
    this._listeners = this._listeners.filter(c => c !== callback)
  }

  public getProviderInfo(): ProviderInfo {
    return Web3Connect.getProviderInfo(this._provider)
  }

  public getWalletInfo(): WalletInfo | Promise<WalletInfo> {
    const providerState = getProviderState(this._provider)

    if (!providerState) return this._getAsyncWalletInfo()

    const { isConnected = false, accounts = [], chainId = 0 } = providerState
    return {
      isConnected,
      userAddress: accounts[0],
      networkId: isConnected ? +chainId : undefined,
    }
  }

  /* ****************      Private Functions      **************** */

  private async _getAsyncWalletInfo(): Promise<WalletInfo> {
    try {
      const [[userAddress], networkId] = await Promise.all([this._web3.eth.getAccounts(), this._web3.eth.net.getId()])

      return {
        userAddress,
        networkId,
        isConnected: !!userAddress && !!networkId,
      }
    } catch (error) {
      log('Error asynchrously getting WalletInfo', error)
      return {
        userAddress: '',
        networkId: 0,
        isConnected: false,
      }
    }
  }

  private async _notifyListeners(): Promise<void> {
    await Promise.resolve()
    // const walletInfo: WalletInfo = this.getWalletInfo()
    // const account = (await this._web3.eth.getAccounts())[0]
    // const walletInfo: WalletInfo = {
    //   userAddress: account,
    //   networkId: await this._web3.eth.net.getId(),
    //   isConnected: !!account,
    // }

    const walletInfo = await (this.getWalletInfo() || this._getAsyncWalletInfo())

    this._listeners.forEach(listener => listener(walletInfo))
  }

  private get _connected(): boolean | Promise<boolean> {
    const providerState = getProviderState(this._provider)

    if (providerState) return providerState.isConnected

    return this._getAsyncWalletInfo().then(walletInfo => walletInfo.isConnected)
    // return !!(getProviderState(this._provider) || { isConnected: true }).isConnected
  }
  private get _user(): string | Promise<string> {
    const providerState = getProviderState(this._provider)

    if (providerState) return providerState.accounts[0]

    return this._getAsyncWalletInfo().then(walletInfo => walletInfo.userAddress || '')

    // const { accounts: [account] = [] } = getProviderState(this._provider) || {}
    // return account
  }
  private get _balance(): Promise<string> {
    if (!this._web3) return Promise.resolve('0')
    return Promise.resolve(this._user).then(user => this._web3.eth.getBalance(user))
    // return this._web3.eth.getBalance(await this._user)
  }
  private get _networkId(): Network | Promise<Network> {
    const providerState = getProviderState(this._provider)

    if (providerState) return providerState.chainId || 0

    return this._getAsyncWalletInfo().then(walletInfo => walletInfo.networkId || 0)
    // const { chainId = 0 } = getProviderState(this._provider) || {}
    // return chainId
  }
}

export default WalletApiImpl
