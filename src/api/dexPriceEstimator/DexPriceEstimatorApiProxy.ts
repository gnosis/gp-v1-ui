import { CacheMixin } from 'api/proxy'
import { PRICES_CACHE_TIME } from 'const'
import { DexPriceEstimatorApiImpl, Params, DexPriceEstimatorApi } from './DexPriceEstimatorApi'

export class DexPriceEstimatorApiProxy extends DexPriceEstimatorApiImpl {
  private cache: CacheMixin

  public constructor(params: Params) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<DexPriceEstimatorApi>(this, [{ method: 'getPrice', ttl: PRICES_CACHE_TIME }])
  }
}
