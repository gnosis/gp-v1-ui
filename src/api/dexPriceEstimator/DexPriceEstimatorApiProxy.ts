import { CacheMixin } from 'api/proxy'
import { PRICES_CACHE_TIME } from 'const'
import { DexPriceEstimatorApiImpl, DexPriceEstimatimatorParams, DexPriceEstimatorApi } from './DexPriceEstimatorApi'

export class DexPriceEstimatorApiProxy extends DexPriceEstimatorApiImpl {
  private cache: CacheMixin

  public constructor(params: DexPriceEstimatimatorParams) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<DexPriceEstimatorApi>(this, [{ method: 'getPrice', ttl: PRICES_CACHE_TIME }])
  }
}
