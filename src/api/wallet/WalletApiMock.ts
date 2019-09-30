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
  private _balance = toWei(new BN(2.75), 'ether')
  private _listeners: ((walletInfo: WalletInfo) => void)[] = []

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<void> {
    await wait(500)
    this._connected = true
    log('[WalletApiMock] Connected')
    await this._notifyListeners()
  }

  public async disconnect(): Promise<void> {
    await wait(500)
    this._connected = false
    log('[WalletApiMock] Disconnected')
    await this._notifyListeners()
  }

  public async getAddress(): Promise<string> {
    assert(this._connected, 'The wallet is not connected')

    return USER_1
  }

  public async getBalance(): Promise<BN> {
    assert(this._connected, 'The wallet is not connected')

    return this._balance
  }

  public async getNetworkId(): Promise<number> {
    assert(this._connected, 'The wallet is not connected')

    return Network.Rinkeby
  }

  public addOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void {
    this._listeners.push(callback)
  }

  public removeOnChangeWalletInfo(callback: (walletInfo: WalletInfo) => void): void {
    this._listeners = this._listeners.filter(c => c !== callback)
  }

  private async _notifyListeners(): Promise<void> {
    const walletInfo: WalletInfo = {
      isConnected: this._connected,
      userAddress: this._connected ? await this.getAddress() : undefined,
      networkId: this._connected ? await this.getNetworkId() : undefined,
    }
    this._listeners.forEach(listener => listener(walletInfo))
  }
}

export default WalletApiMock
