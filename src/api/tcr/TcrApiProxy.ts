import { TcrApiImpl, Params, TcrApi } from './TcrApi'
import { CacheMixin } from 'api/proxy'

export class TcrApiProxy extends TcrApiImpl {
  private cache: CacheMixin

  public constructor(params: Params) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<TcrApi>(this, [{ method: 'getTokens' }])
  }
}
