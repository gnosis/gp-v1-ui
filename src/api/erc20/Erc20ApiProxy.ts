import { CacheMixin } from 'api/proxy'

import Erc20ApiImpl, { Erc20Api, Params } from './Erc20Api'

export class Erc20ApiProxy extends Erc20ApiImpl {
  private cache: CacheMixin

  public constructor(injectedDependencies: Params) {
    super(injectedDependencies)

    // Potentially, we could have a global cache obj OR
    // we could keep a local instance like this that allows more granular cache settings, such as default timeouts, etc
    this.cache = new CacheMixin()

    this.cache.injectCache<Erc20Api>(this, [
      { method: 'name' },
      { method: 'symbol' },
      { method: 'decimals' },
      { method: 'totalSupply' },
    ])
  }
}
