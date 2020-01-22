import { CacheMixin } from 'api/proxy'

import { DepositApiImpl, DepositApi, InjectedDependencies } from './DepositApi'

export class DepositApiProxy extends DepositApiImpl {
  private cache: CacheMixin

  public constructor(injectedDependencies: InjectedDependencies) {
    super(injectedDependencies)

    this.cache = new CacheMixin()

    this.cache.injectCache<DepositApi>(this, [{ method: 'getContractAddress' }])
  }
}
