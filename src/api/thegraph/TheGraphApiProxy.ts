import { TheGraphApiImpl, Params, TheGraphApi } from './TheGraphApi'
import { CacheMixin } from 'api/proxy'
import { PRICES_CACHE_TIME } from 'const'

export class TheGraphApiProxy extends TheGraphApiImpl {
  private cache: CacheMixin

  public constructor(params: Params) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<TheGraphApi>(this, [
      { method: 'getPrice', ttl: PRICES_CACHE_TIME },
      { method: 'getPrices', ttl: PRICES_CACHE_TIME },
    ])
  }
}
