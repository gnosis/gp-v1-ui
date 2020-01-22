import { CacheMixin } from 'api/proxy'
import { InjectedDependencies } from 'api/deposit/DepositApi'

import ExchangeApiImpl, { ExchangeApi } from './ExchangeApi'

export class ExchangeApiProxy extends ExchangeApiImpl {
  private cache: CacheMixin

  public constructor(injectedDependencies: InjectedDependencies) {
    super(injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<ExchangeApi>(this, [
      { method: 'getFeeDenominator' },
      { method: 'getTokenAddressById' },
      { method: 'getTokenIdByAddress' },
    ])
  }
}
