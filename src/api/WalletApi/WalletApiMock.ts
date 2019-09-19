import { WalletApi, Network } from 'types'
import BN from 'bn.js'
import assert from 'assert'

import { log } from 'utils'
import { ADDRESS } from '../../../test/data'

/**
 * Basic implementation of Wallet API
 */
export class WalletApiMock implements WalletApi {
  private _connected = false
  private _balance = new BN('2750000000000000000')

  public isConnected(): boolean {
    return this._connected
  }

  public async connect(): Promise<void> {
    this._connected = true
    log('[WalletApiMock] Connected')
  }

  public async disconnect(): Promise<void> {
    this._connected = false
    log('[WalletApiMock] Disconnected')
  }

  public async getAddress(): Promise<string> {
    assert(this._connected, 'The wallet is not connected')

    return ADDRESS
  }

  public async getBalance(): Promise<BN> {
    assert(this._connected, 'The wallet is not connected')

    return this._balance
  }

  public async getNetworkId(): Promise<number> {
    assert(this._connected, 'The wallet is not connected')

    return Network.Rinkeby
  }
}

export default WalletApiMock
