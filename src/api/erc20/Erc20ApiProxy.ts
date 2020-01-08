import BN from 'bn.js'

import { Receipt } from 'types'

import {
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
} from './Erc20Api'
import { CacheProxy } from 'api/proxy'

const DEFAULT_CACHE_TIME = 30

export class Erc20ApiProxy extends CacheProxy<Erc20Api> implements Erc20Api {
  public constructor(erc20Api: Erc20Api) {
    super(erc20Api)
  }

  public name(params: NameParams): Promise<string> {
    return this.fetchWithCache('name', params, DEFAULT_CACHE_TIME)
  }

  public symbol(params: SymbolParams): Promise<string> {
    return this.fetchWithCache('symbol', params, DEFAULT_CACHE_TIME)
  }

  public decimals(params: DecimalsParams): Promise<number> {
    return this.fetchWithCache('decimals', params, DEFAULT_CACHE_TIME)
  }

  public totalSupply(params: TotalSupplyParams): Promise<BN> {
    return this.fetchWithCache('totalSupply', params, DEFAULT_CACHE_TIME)
  }

  public balanceOf(params: BalanceOfParams): Promise<BN> {
    return this.fetchWithCache('balanceOf', params)
  }

  public allowance(params: AllowanceParams): Promise<BN> {
    return this.fetchWithCache('allowance', params)
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
