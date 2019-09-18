import { WalletApi, Network } from 'types'
import BN from 'bn.js'

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
  }

  public async getAddress(): Promise<string> {
    return ADDRESS
  }

  public async getBalance(): Promise<BN> {
    return this._balance
  }

  public async getNetworkId(): Promise<number> {
    return Network.Rinkeby
  }
}

export default WalletApiMock
