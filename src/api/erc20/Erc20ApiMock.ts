import { Erc20Api } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { ZERO } from 'const'
import { formatAmount, log, wait } from 'utils'

interface Balances {
  [userAddress: string]: { [tokenAddress: string]: BN }
}

interface Allowances {
  [userAddress: string]: { [tokenAddress: string]: { [spenderAddress: string]: BN } }
}

/**
 * Basic implemtation of Wallet API
 */
export class Erc20ApiMock implements Erc20Api {
  private _balances: Balances
  private _allowances: Allowances

  public constructor({ balances = {}, allowances = {} } = {}) {
    this._balances = balances
    this._allowances = allowances
  }

  public async balanceOf(tokenAddress: string, userAddress: string): Promise<BN> {
    const userBalances = this._balances[userAddress]
    if (!userBalances) {
      return ZERO
    }

    const balance = userBalances[tokenAddress]
    return balance ? balance : ZERO
  }

  public async allowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<BN> {
    const userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      return ZERO
    }

    const tokenAllowances = userAllowances[tokenAddress]
    if (!tokenAllowances) {
      return ZERO
    }

    const allowance = tokenAllowances[spenderAddress]
    return allowance ? allowance : ZERO
  }

  public async approve(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    amount: BN,
  ): Promise<boolean> {
    await wait()
    this._initAllowances(userAddress, tokenAddress, spenderAddress)
    this._allowances[userAddress][tokenAddress][spenderAddress] = amount
    log(
      `[Erc20ApiMock] Approved ${formatAmount(
        amount,
      )} for the spender ${spenderAddress} on the token ${tokenAddress}. User ${userAddress}`,
    )

    return true
  }

  public async transfer(tokenAddress: string, fromAddress: string, toAddress: string, amount: BN): Promise<boolean> {
    await wait()
    this._initBalances(fromAddress, tokenAddress)
    this._initBalances(toAddress, tokenAddress)

    const balance = this._balances[fromAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    this._balances[fromAddress][tokenAddress] = balance.sub(amount)
    this._balances[tokenAddress][tokenAddress] = this._balances[tokenAddress][tokenAddress].add(amount)
    return true
  }

  /********************************    private methods   ********************************/
  private _initBalances(userAddress: string, tokenAddress: string): BN {
    let userBalances = this._balances[userAddress]
    if (!userBalances) {
      userBalances = {}
      this._balances[userAddress] = userBalances
    }

    let tokenBalance = userBalances[tokenAddress]
    if (!tokenBalance) {
      tokenBalance = ZERO
    }

    return tokenBalance
  }

  private _initAllowances(userAddress: string, tokenAddress: string, spenderAddress: string): BN {
    let userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      userAllowances = {}
      this._allowances[userAddress] = userAllowances
    }

    let userTokenAllowances = userAllowances[tokenAddress]
    if (!userTokenAllowances) {
      userTokenAllowances = {}
      userAllowances[tokenAddress] = userTokenAllowances
    }

    let spenderAllowance = userTokenAllowances[spenderAddress]
    if (!userTokenAllowances) {
      spenderAllowance = ZERO
      userTokenAllowances[spenderAddress] = spenderAllowance
    }

    return spenderAllowance
  }
}

export default Erc20ApiMock
