import Web3 from 'web3'

import { CacheMixin } from 'api/proxy'
import { InjectedDependencies } from 'api/erc20/Erc20Api'

import { DepositApiImpl, DepositApi } from './DepositApi'

export class DepositApiProxy extends DepositApiImpl {
  private cache: CacheMixin

  public constructor(web3: Web3, injectedDependencies: InjectedDependencies) {
    super(web3, injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<DepositApi>(this, [{ method: 'getContractAddress' }])
  }
}
