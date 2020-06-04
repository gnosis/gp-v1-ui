import { CacheMixin } from 'api/proxy'

import ExchangeApiImpl, { ExchangeApi, ExchangeApiParams } from 'api/exchange/ExchangeApi'

export class ExchangeApiProxy extends ExchangeApiImpl {
  private cache: CacheMixin

  public constructor(injectedDependencies: ExchangeApiParams) {
    super(injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<ExchangeApi>(this, [
      { method: 'getFeeDenominator' },
      { method: 'getTokenAddressById' },
      { method: 'getTokenIdByAddress' },
    ])
  }
}
