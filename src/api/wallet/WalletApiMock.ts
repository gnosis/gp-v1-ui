import { WalletApi, Network, WalletInfo, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'

import { log, wait, toWei } from 'utils'
import { USER_1, USER_2 } from '../../../test/data'

type OnChangeWalletInfo = (walletInfo: WalletInfo) => void

const AUTOCONNECT = process.env.AUTOCONNECT === 'true'

/**
 * Basic implementation of Wallet API
 */
export class WalletApiMock implements WalletApi {
  private _connected: boolean
  private _user: string
  private _networkId: number
  private _balance: BN
  private _listeners: ((walletInfo: WalletInfo) => void)[]

  public constructor() {
    this._connected = AUTOCONNECT
    this._user = USER_1
    this._networkId = Network.Rinkeby
    this._balance = toWei(new BN(2.75), 'ether')
    this._listeners = []
  }

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<boolean> {
    await wait(1000)
    this._connected = true
    log('[WalletApiMock] Connected')
    await this._notifyListeners()

    return true
  }

  public async disconnect(): Promise<void> {
    await wait(1000)
    this._connected = false
    log('[WalletApiMock] Disconnected')
    await this._notifyListeners()
  }

  public async getAddress(): Promise<string> {
    assert(this._connected, 'The wallet is not connected')

    return this._user
  }

  public async getBalance(): Promise<BN> {
    assert(this._connected, 'The wallet is not connected')

    return this._balance
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

  /* ****************      Test functions      **************** */
  // Functions created just for simulate some cases

  public changeUser(): void {
    this._user = this._user === USER_1 ? USER_2 : USER_1
    this._notifyListeners()
  }

  public changeNetwork(): void {
    this._networkId = this._networkId === Network.Rinkeby ? Network.Mainnet : Network.Rinkeby
    this._notifyListeners()
  }

  /* ****************      Private Functions      **************** */

  private _getWalletInfo(): WalletInfo {
    return {
      isConnected: this._connected,
      userAddress: this._connected ? this._user : undefined,
      networkId: this._connected ? this._networkId : undefined,
    }
  }

  private _notifyListeners(): void {
    const walletInfo: WalletInfo = this._getWalletInfo()
    this._listeners.forEach(listener => listener(walletInfo))
  }
}

export default WalletApiMock
