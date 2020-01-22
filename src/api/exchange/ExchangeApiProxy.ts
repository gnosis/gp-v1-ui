import { CacheMixin } from 'api/proxy'
import { Params } from 'api/deposit/DepositApi'

import ExchangeApiImpl, { ExchangeApi } from './ExchangeApi'

export class ExchangeApiProxy extends ExchangeApiImpl {
  private cache: CacheMixin

  public constructor(injectedDependencies: Params) {
    super(injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<ExchangeApi>(this, [
      { method: 'getFeeDenominator' },
      { method: 'getTokenAddressById' },
      { method: 'getTokenIdByAddress' },
    ])
  }
}
