import { TheGraphApiImpl, Params, TheGraphApi } from './TheGraphApi'
import { CacheMixin } from 'api/proxy'

// The prices on the contract will update at max once every batch, which is 5min long
const PRICES_CACHE_TIME = 60 // in seconds

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
