import BN from 'bn.js'

import { Receipt } from 'types'

import Erc20ApiImpl, {
  Erc20Api,
  NameParams,
  SymbolParams,
  DecimalsParams,
  TotalSupplyParams,
  BalanceOfParams,
  AllowanceParams,
  ApproveParams,
  TransferParams,
  TransferFromParams,
  InjectedDependencies,
} from './Erc20Api'
import { CacheProxy } from 'api/proxy'
import { CacheMixin } from 'api/proxy/CacheMixin'
import Web3 from 'web3'

// Approach 1: Proxy pattern implementing base API, extending CacheProxy
export class Erc20ApiProxy extends CacheProxy<Erc20Api> implements Erc20Api {
  public name(params: NameParams): Promise<string> {
    return this.fetchWithCache('name', params)
  }

  public symbol(params: SymbolParams): Promise<string> {
    return this.fetchWithCache('symbol', params)
  }

  public decimals(params: DecimalsParams): Promise<number> {
    return this.fetchWithCache('decimals', params)
  }

  public totalSupply(params: TotalSupplyParams): Promise<BN> {
    return this.fetchWithCache('totalSupply', params)
  }

  // guess we shouldn't cache these two either, or at best cache only for a few seconds
  public balanceOf(params: BalanceOfParams): Promise<BN> {
    return this.api.balanceOf(params)
  }

  public allowance(params: AllowanceParams): Promise<BN> {
    return this.api.allowance(params)
  }

  // pass through methods, cache doesn't apply to these
  public approve(params: ApproveParams): Promise<Receipt> {
    return this.api.approve(params)
  }

  public transfer(params: TransferParams): Promise<Receipt> {
    return this.api.transfer(params)
  }

  public transferFrom(params: TransferFromParams): Promise<Receipt> {
    return this.api.transfer(params)
  }
}

// Approach 2: Extending Api impl (to avoid re-implementing methods not cached), using composition for cache
export class Erc20ApiProxyV2 extends Erc20ApiImpl {
  private cache: CacheMixin

  public constructor(web3: Web3, injectedDependencies: InjectedDependencies) {
    super(web3, injectedDependencies)

    // Potentially, we could have a global cache obj OR
    // we could keep a local instance like this that allows more granular cache settings, such as default timeouts, etc
    this.cache = new CacheMixin()

    // overwrite the ones we want to cache only
    // this.name = this.cache.cacheMethod({ fnToCache: this.name })
    // this.symbol = this.cache.cacheMethod({ fnToCache: this.symbol })
    // this.decimals = this.cache.cacheMethod({ fnToCache: this.decimals })
    // this.totalSupply = this.cache.cacheMethod({ fnToCache: this.totalSupply })

    // Alternatively, we could use a single method to inject the cached methods into `this`
    this.cache.injectCache<Erc20Api>(this, [
      { method: 'name' },
      { method: 'symbol' },
      { method: 'decimals' },
      { method: 'totalSupply' },
    ])
  }
}
