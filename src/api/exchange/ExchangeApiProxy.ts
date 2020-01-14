import Web3 from 'web3'

import { CacheMixin } from 'api/proxy'
import { InjectedDependencies } from 'api/erc20/Erc20Api'

import ExchangeApiImpl, { ExchangeApi } from './ExchangeApi'

export class ExchangeApiProxy extends ExchangeApiImpl {
  private cache: CacheMixin

  public constructor(web3: Web3, injectedDependencies: InjectedDependencies) {
    super(web3, injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<ExchangeApi>(this, [
      { method: 'getFeeDenominator' },
      { method: 'getTokenAddressById' },
      { method: 'getTokenIdByAddress' },
    ])
  }
}
