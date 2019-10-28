import { WalletApi, Network, WalletInfo, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'

import WalletConnectProvider from '@walletconnect/web3-provider'

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
  const subs = subscriptions || createSubscriptions(provider)

  let networkUpdate: (callback: (chainId: number) => void) => Command

  if (isMetamaskSubscriptions(subs)) networkUpdate = (cb): Command => subs.onNetworkChanged(networkId => cb(+networkId))
  if (isWalletConnectSubscriptions(subs)) networkUpdate = subs.onChainChanged

  const accountsUpdate = subs.onAccountsChanged

  const blockUpdate = (cb: (blockHeader: BlockHeader) => void): Command => {
    const blockSub = web3.eth.subscribe('newBlockHeaders').on('data', cb)
    return (): void => {
      blockSub.unsubscribe()
    }
  }

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
    infuraId: '8b4d9b4306294d2e92e0775ff1075066',
  },
}

/**
 * Basic implementation of Wallet API
 */
export class WalletApiImpl implements WalletApi {
  private _listeners: ((walletInfo: WalletInfo) => void)[]
  private _provider: Provider | null
  private _web3: Web3 | null

  private _unsubscribe: Command = () => {}

  public constructor() {
    this._listeners = []
  }

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<void> {
    const provider = await getProvider(wcOptions)
    // maybe throw
    if (!provider) return

    if (isMetamaskProvider(provider)) provider.autoRefreshOnNetworkChange = false

    this._provider = provider

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._web3 = new Web3(provider as any)
    log('[WalletApi] Connected')

    await this._notifyListeners()

    const subscriptions = createSubscriptions(provider)

    const unsubscribeUpdates = subscribeToBlockchainUpdate({ subscriptions, provider, web3: this._web3 })(
      this._notifyListeners.bind(this),
    )

    let unsubscribeDisconnect: Command = () => {}
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
  }

  public async disconnect(): Promise<void> {
    if (isWalletConnectProvider(this._provider) && this._connected) await this._provider.close()

    this._unsubscribe()

    this._provider = null
    this._web3 = null

    log('[WalletApi] Disconnected')
    await this._notifyListeners()
  }

  public async getAddress(): Promise<string> {
    assert(this._connected, 'The wallet is not connected')

    return this._user
  }

  public async getBalance(): Promise<BN> {
    assert(this._connected, 'The wallet is not connected')

    return toBN(await this._balance)
  }

  public async getNetworkId(): Promise<number> {
    assert(this._connected, 'The wallet is not connected')

    return this._networkId
  }

  public addOnChangeWalletInfo(callback: OnChangeWalletInfo, trigger?: boolean): Command {
    this._listeners.push(callback)
    if (trigger) {
      callback(this._getWalletInfo())
    }

    return (): void => this.removeOnChangeWalletInfo(callback)
  }

  public removeOnChangeWalletInfo(callback: OnChangeWalletInfo): void {
    this._listeners = this._listeners.filter(c => c !== callback)
  }

  /* ****************      Private Functions      **************** */

  private _getWalletInfo(): WalletInfo {
    const { isConnected = false, accounts = [], chainId = 0 } = getProviderState(this._provider) || {}
    return {
      isConnected,
      userAddress: accounts[0],
      networkId: isConnected ? +chainId : undefined,
    }
  }

  private async _notifyListeners(): Promise<void> {
    await Promise.resolve()
    const walletInfo: WalletInfo = this._getWalletInfo()
    console.table(walletInfo)
    this._listeners.forEach(listener => listener(walletInfo))
  }

  private get _connected(): boolean {
    return !!(getProviderState(this._provider) || {}).isConnected
  }
  private get _user(): string {
    const { accounts: [account] = [] } = getProviderState(this._provider) || {}
    return account
  }
  private get _balance(): Promise<string> {
    if (!this._web3) return Promise.resolve('0')
    return this._web3.eth.getBalance(this._user)
  }
  private get _networkId(): Network {
    const { chainId = 0 } = getProviderState(this._provider) || {}
    return chainId
  }
}

export default WalletApiImpl
