import { WalletApi, Network, WalletInfo, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { getDefaultProvider } from '../'

import WalletConnectProvider from '@walletconnect/web3-provider'
// import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
;(window as any).WalletConnectProvider = WalletConnectProvider


class ETHProv extends WalletConnectProvider {
  public send(payload: any, callback: any): any {
    console.log('send::payload,callback', payload, callback)
    return super.send(payload, callback)
  }
  public handleReadRequest(payload: any): void {
    console.log('handleReadRequest::payload', payload)
    return super.handleReadRequest(payload)
  }
  public updateState(sessionParams: any): any {
    console.log('updateState::sessionParams', sessionParams)
    return super.updateState(sessionParams)
  }

  public enable(): Promise<[string]> {
    return new Promise(async (resolve, reject) => {
      try {
        const wc = await this.getWalletConnector()
        if (wc) {
          wc.session && this.updateState(wc.session)
          this.start()
          this.subscribeWalletConnector()
          resolve(wc.accounts)
        } else {
          return reject(new Error('Failed to connect to WalleConnect'))
        }
      } catch (error) {
        return reject(error)
      }
    })
  }

  // public getWalletConnector(): any {
  //   return new Promise((resolve, reject) => {
  //     const wc = this.wc

  //     if (this.isConnecting) {
  //       console.log('getWalletConnector:: already connecting')
  //       this.onConnect((x: any) => resolve(x))
  //     } else if (!wc.connected) {
  //       console.log('getWalletConnector:: will create session')
  //       this.isConnecting = true
  //       const sessionRequestOpions = this.chainId ? { chainId: this.chainId } : undefined
  //       wc.createSession(sessionRequestOpions)
  //         .then(() => {
  //           if (this.qrcode) {
  //             console.log(wc.uri)
  //             WalletConnectQRCodeModal.open(wc.uri, () => {
  //               reject(new Error('User closed WalletConnect modal'))
  //             })
  //           }
  //           wc.on('connect', (payload: any) => {
  //             console.log('getWalletConnector::wc.on(connect):: payload', payload)
  //             console.log('getWalletConnector::wc.session', JSON.stringify(wc.session))
  //             if (this.qrcode) {
  //               WalletConnectQRCodeModal.close()
  //             }
  //             this.isConnecting = false

  //             if (payload) {
  //               // Handle session update
  //               this.updateState(payload.params[0])
  //             } else if (wc.session) { // IMPORTANT!
  //               this.updateState(wc.session)
  //             }
  //             // Emit connect event
  //             this.emit('connect')

  //             this.triggerConnect(wc)
  //             resolve(wc)
  //           })
  //         })
  //         .catch((error: Error) => {
  //           console.log('getWalletConnector::wc.createSession::error', error)
  //           this.isConnecting = false
  //           reject(error)
  //         })
  //     } else {
  //       console.log('getWalletConnector:: already has valid session')
  //       if (wc.session) { // IMPORTANT!
  //         this.updateState(wc.session)
  //       }
  //       resolve(wc)
  //     }
  //   })
  // }
}
;(window as any).ETHProv = ETHProv

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
  // package: WalletConnectProvider,
  package: ETHProv,
  options: {
    // TODO get infuraId from .env
    infuraId: '8b4d9b4306294d2e92e0775ff1075066',
    network: 'rinkeby',
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

/**
 * Basic implementation of Wallet API
 */
export class WalletApiImpl implements WalletApi {
  private _listeners: ((walletInfo: WalletInfo) => void)[]
  private _provider: Provider | null
  private _web3: Web3

  private _unsubscribe: Command = () => {}

  public constructor(web3: Web3) {
    this._listeners = []
    this._web3 = web3
  }

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<boolean> {
    const provider = await getProvider(wcOptions)

    if (!provider) return false

    if (isMetamaskProvider(provider)) provider.autoRefreshOnNetworkChange = false

    this._provider = provider

    closeOpenWebSocketConnection(this._web3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._web3.setProvider(provider as any)
    log('[WalletApi] Connected')
    ;(window as any).web3c = this._web3

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

    return true
  }

  public async disconnect(): Promise<void> {
    if (isWalletConnectProvider(this._provider) && this._connected) await this._provider.close()

    this._unsubscribe()

    this._provider = null
    this._web3?.setProvider(getDefaultProvider())

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
