import { TcrApi } from './TcrApi'
import { MultiTcrApi, MultiTcrApiParams } from './MultiTcrApi'
import { CacheMixin } from 'api/proxy'

export class MultiTcrApiProxy extends MultiTcrApi {
  private cache: CacheMixin

  public constructor(params: MultiTcrApiParams) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<TcrApi>(this, [{ method: 'getTokens' }])
  }
}
