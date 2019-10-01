import { WalletApi, Network, WalletInfo } from 'types'
import BN from 'bn.js'
import assert from 'assert'

import { log, wait, toWei } from 'utils'
import { USER_1 } from '../../../test/data'

/**
 * Basic implementation of Wallet API
 */
export class WalletApiMock implements WalletApi {
  private _connected = false
  private _user = USER_1
  private _networkId = Network.Rinkeby
  private _balance = toWei(new BN(2.75), 'ether')
  private _listeners: ((walletInfo: WalletInfo) => void)[] = []

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<void> {
    await wait(1000)
    this._connected = true
    log('[WalletApiMock] Connected')
    await this._notifyListeners()
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

  public addOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void, trigger?: boolean): void {
    this._listeners.push(callback)
    if (trigger) {
      callback(this._getWalletInfo())
    }
  }

  public removeOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void {
    this._listeners = this._listeners.filter(c => c !== callback)
  }

  private _getWalletInfo(): WalletInfo {
    return {
      isConnected: this._connected,
      userAddress: this._connected ? this._user : undefined,
      networkId: this._connected ? this._networkId : undefined,
    }
  }

  private async _notifyListeners(): Promise<void> {
    const walletInfo: WalletInfo = this._getWalletInfo()
    this._listeners.forEach(listener => listener(walletInfo))
  }
}

export default WalletApiMock
